// src/app/api/auth/route.js
import { NextResponse } from "next/server";
import {
  authenticateUser,
  createUser,
  initializeAdmin,
} from "../../../../lib/models/user";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Initialize the admin user on server start
initializeAdmin().catch(console.error);

// Secret key for JWT
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Login handler
export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Authenticate user
    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    // Set cookie with JWT
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8, // 8 hours
      path: "/",
      sameSite: "strict",
    });

    // Return user info without sensitive data
    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// Register handler - for creating new users (admin only in production)
export async function PUT(request) {
  try {
    const userData = await request.json();

    // Get auth token from cookies to verify admin status
    const token = cookies().get("auth-token")?.value;

    // In production, only allow admin to create users
    if (process.env.NODE_ENV === "production") {
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== "admin") {
          return NextResponse.json(
            { error: "Admin privileges required" },
            { status: 403 }
          );
        }
      } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // Create the user
    const userId = await createUser(userData);

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "User registration failed" },
      { status: 400 }
    );
  }
}

// Logout handler
export async function DELETE(request) {
  cookies().delete("auth-token");
  return NextResponse.json({ success: true });
}
