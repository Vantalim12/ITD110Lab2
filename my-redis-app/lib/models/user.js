// lib/models/user.js
import redis from "../redis";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

/**
 * User Model for Redis
 *
 * Data structure:
 * - users:{id} -> Hash containing user details
 * - users:ids -> Set of all user IDs
 * - users:index:username:{username} -> String containing user ID for lookup
 * - users:index:email:{email} -> String containing user ID for lookup
 */

// Helper function to hash passwords
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

// Helper function to verify passwords
function verifyPassword(password, hash, salt) {
  const verifyHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === verifyHash;
}

export async function createUser(userData) {
  try {
    // Check if username or email already exists
    const existingUsernameId = await redis.get(
      `users:index:username:${userData.username}`
    );
    if (existingUsernameId) {
      throw new Error(`Username ${userData.username} is already taken`);
    }

    const existingEmailId = await redis.get(
      `users:index:email:${userData.email}`
    );
    if (existingEmailId) {
      throw new Error(`Email ${userData.email} is already registered`);
    }

    // Generate a unique ID if not provided
    const userId = userData.id || `user:${uuidv4()}`;

    // Hash the password
    const { hash, salt } = hashPassword(userData.password);

    // Create a multi command to execute all Redis operations atomically
    const multi = redis.multi();

    // Store user data as a hash
    multi.hset(`users:${userId}`, {
      id: userId,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName || "",
      role: userData.role || "editor", // Default role
      passwordHash: hash,
      passwordSalt: salt,
      lastLogin: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add to the set of all user IDs
    multi.sadd("users:ids", userId);

    // Add to indexes for looking up by username and email
    multi.set(`users:index:username:${userData.username}`, userId);
    multi.set(`users:index:email:${userData.email}`, userId);

    // Execute all commands
    await multi.exec();

    return userId;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUser(userId) {
  try {
    const user = await redis.hgetall(`users:${userId}`);

    // If user exists, remove sensitive fields
    if (user && Object.keys(user).length > 0) {
      // Don't return password hash and salt to clients
      const { passwordHash, passwordSalt, ...safeUser } = user;
      return safeUser;
    }

    return null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw error;
  }
}

export async function getUserByUsername(username) {
  try {
    const userId = await redis.get(`users:index:username:${username}`);

    if (!userId) {
      return null;
    }

    return getUser(userId);
  } catch (error) {
    console.error("Error getting user by username:", error);
    throw error;
  }
}

export async function getUserByEmail(email) {
  try {
    const userId = await redis.get(`users:index:email:${email}`);

    if (!userId) {
      return null;
    }

    return getUser(userId);
  } catch (error) {
    console.error("Error getting user by email:", error);
    throw error;
  }
}

export async function getUserForAuth(username) {
  try {
    const userId = await redis.get(`users:index:username:${username}`);

    if (!userId) {
      return null;
    }

    // For authentication, we need the password hash and salt
    return redis.hgetall(`users:${userId}`);
  } catch (error) {
    console.error("Error getting user for auth:", error);
    throw error;
  }
}

export async function authenticateUser(username, password) {
  try {
    const user = await getUserForAuth(username);

    if (!user) {
      return null;
    }

    // Verify the password
    const isValid = verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt
    );

    if (!isValid) {
      return null;
    }

    // Update last login time
    await redis.hset(`users:${user.id}`, "lastLogin", new Date().toISOString());

    // Return user without sensitive data
    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  } catch (error) {
    console.error("Error authenticating user:", error);
    throw error;
  }
}

export async function updateUser(userId, userData) {
  try {
    const existingUser = await redis.hgetall(`users:${userId}`);

    if (!existingUser || Object.keys(existingUser).length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const multi = redis.multi();

    // Check if username is being changed
    if (userData.username && userData.username !== existingUser.username) {
      const existingUsernameId = await redis.get(
        `users:index:username:${userData.username}`
      );
      if (existingUsernameId) {
        throw new Error(`Username ${userData.username} is already taken`);
      }

      // Update username index
      multi.del(`users:index:username:${existingUser.username}`);
      multi.set(`users:index:username:${userData.username}`, userId);
    }

    // Check if email is being changed
    if (userData.email && userData.email !== existingUser.email) {
      const existingEmailId = await redis.get(
        `users:index:email:${userData.email}`
      );
      if (existingEmailId) {
        throw new Error(`Email ${userData.email} is already registered`);
      }

      // Update email index
      multi.del(`users:index:email:${existingUser.email}`);
      multi.set(`users:index:email:${userData.email}`, userId);
    }

    // Prepare updated user data
    const updatedUser = {
      ...existingUser,
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    // If password is being updated, hash it
    if (userData.password) {
      const { hash, salt } = hashPassword(userData.password);
      updatedUser.passwordHash = hash;
      updatedUser.passwordSalt = salt;
    }

    // Update the user hash
    multi.hset(`users:${userId}`, updatedUser);

    // Execute all commands
    await multi.exec();

    // Return updated user without sensitive data
    const { passwordHash, passwordSalt, ...safeUser } = updatedUser;
    return safeUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userId) {
  try {
    const user = await redis.hgetall(`users:${userId}`);

    if (!user || Object.keys(user).length === 0) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const multi = redis.multi();

    // Remove from indexes
    multi.del(`users:index:username:${user.username}`);
    multi.del(`users:index:email:${user.email}`);

    // Remove from main user set
    multi.srem("users:ids", userId);

    // Delete the user hash
    multi.del(`users:${userId}`);

    // Execute all commands
    await multi.exec();

    return true;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

export async function getAllUsers() {
  try {
    const userIds = await redis.smembers("users:ids");

    // Get user data for each ID
    const users = await Promise.all(userIds.map((id) => getUser(id)));

    return users.filter(Boolean); // Filter out any null results
  } catch (error) {
    console.error("Error getting all users:", error);
    throw error;
  }
}

// Initialize admin user if it doesn't exist
export async function initializeAdmin() {
  try {
    const adminExists = await redis.get("users:index:username:admin");

    if (!adminExists) {
      await createUser({
        username: "admin",
        email: "admin@barangaykabacsanan.gov.ph",
        password: "admin123", // This should be changed after first login
        fullName: "System Administrator",
        role: "admin",
      });

      console.log("Admin user initialized");
    }
  } catch (error) {
    console.error("Error initializing admin:", error);
  }
}
