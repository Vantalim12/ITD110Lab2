// lib/models/resident.js
import redis from "../redis";
import { v4 as uuidv4 } from "uuid";

/**
 * Resident Model for Redis
 *
 * Data structure:
 * - residents:{id} -> Hash containing resident details
 * - residents:ids -> Set of all resident IDs
 * - residents:household:{householdId} -> Set of residents in a household
 * - residents:index:name:{name} -> Set of resident IDs with this name for search
 * - residents:index:age:{age} -> Set of resident IDs with this age for search
 */

export async function createResident(residentData) {
  try {
    // Generate a unique ID if not provided
    const residentId = residentData.id || `res:${uuidv4()}`;

    // Create a multi command to execute all Redis operations atomically
    const multi = redis.multi();

    // Store resident data as a hash
    multi.hset(`residents:${residentId}`, {
      id: residentId,
      firstName: residentData.firstName,
      middleName: residentData.middleName || "",
      lastName: residentData.lastName,
      birthDate: residentData.birthDate,
      gender: residentData.gender,
      civilStatus: residentData.civilStatus,
      occupation: residentData.occupation || "",
      contactNumber: residentData.contactNumber || "",
      email: residentData.email || "",
      imageUrl: residentData.imageUrl || "",
      householdId: residentData.householdId || "",
      categoryTags: JSON.stringify(residentData.categoryTags || []),
      isHead: residentData.isHead || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add to the set of all resident IDs
    multi.sadd("residents:ids", residentId);

    // Add to indexes for searching
    const fullName =
      `${residentData.firstName} ${residentData.lastName}`.toLowerCase();
    multi.sadd(`residents:index:name:${fullName}`, residentId);

    // Calculate age from birthdate
    if (residentData.birthDate) {
      const birthDate = new Date(residentData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      multi.sadd(`residents:index:age:${age}`, residentId);
    }

    // If household ID is provided, add to household relationship
    if (residentData.householdId) {
      multi.sadd(`residents:household:${residentData.householdId}`, residentId);
    }

    // Add category tags for filtering
    if (residentData.categoryTags && Array.isArray(residentData.categoryTags)) {
      for (const tag of residentData.categoryTags) {
        multi.sadd(`residents:index:tag:${tag.toLowerCase()}`, residentId);
      }
    }

    // Execute all commands
    await multi.exec();

    return residentId;
  } catch (error) {
    console.error("Error creating resident:", error);
    throw error;
  }
}

export async function getResident(residentId) {
  try {
    const resident = await redis.hgetall(`residents:${residentId}`);

    // If resident exists, parse JSON fields
    if (resident && Object.keys(resident).length > 0) {
      resident.categoryTags = JSON.parse(resident.categoryTags || "[]");
      return resident;
    }

    return null;
  } catch (error) {
    console.error("Error getting resident:", error);
    throw error;
  }
}

export async function updateResident(residentId, residentData) {
  try {
    const existingResident = await getResident(residentId);

    if (!existingResident) {
      throw new Error(`Resident with ID ${residentId} not found`);
    }

    // Create a multi command to execute all Redis operations atomically
    const multi = redis.multi();

    // Update the resident hash with new data
    const updatedResident = {
      ...existingResident,
      ...residentData,
      updatedAt: new Date().toISOString(),
    };

    // Ensure categoryTags is stringified
    if (
      updatedResident.categoryTags &&
      Array.isArray(updatedResident.categoryTags)
    ) {
      updatedResident.categoryTags = JSON.stringify(
        updatedResident.categoryTags
      );
    }

    multi.hset(`residents:${residentId}`, updatedResident);

    // If household ID changed, update relationships
    if (
      residentData.householdId &&
      residentData.householdId !== existingResident.householdId
    ) {
      // Remove from old household
      if (existingResident.householdId) {
        multi.srem(
          `residents:household:${existingResident.householdId}`,
          residentId
        );
      }

      // Add to new household
      multi.sadd(`residents:household:${residentData.householdId}`, residentId);
    }

    // Execute all commands
    await multi.exec();

    // Return the updated resident
    return getResident(residentId);
  } catch (error) {
    console.error("Error updating resident:", error);
    throw error;
  }
}

export async function deleteResident(residentId) {
  try {
    const resident = await getResident(residentId);

    if (!resident) {
      throw new Error(`Resident with ID ${residentId} not found`);
    }

    const multi = redis.multi();

    // Delete from indexes
    const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase();
    multi.srem(`residents:index:name:${fullName}`, residentId);

    // Calculate age from birthdate to remove from age index
    if (resident.birthDate) {
      const birthDate = new Date(resident.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      multi.srem(`residents:index:age:${age}`, residentId);
    }

    // Remove from household relationship
    if (resident.householdId) {
      multi.srem(`residents:household:${resident.householdId}`, residentId);
    }

    // Remove from category tags
    const categoryTags =
      typeof resident.categoryTags === "string"
        ? JSON.parse(resident.categoryTags)
        : resident.categoryTags;

    if (Array.isArray(categoryTags)) {
      for (const tag of categoryTags) {
        multi.srem(`residents:index:tag:${tag.toLowerCase()}`, residentId);
      }
    }

    // Remove from main resident set
    multi.srem("residents:ids", residentId);

    // Delete the resident hash
    multi.del(`residents:${residentId}`);

    // Execute all commands
    await multi.exec();

    return true;
  } catch (error) {
    console.error("Error deleting resident:", error);
    throw error;
  }
}

export async function getAllResidents(page = 1, limit = 10) {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get a subset of resident IDs using pagination
    const residentIds = await redis.smembers("residents:ids");
    const paginatedIds = residentIds.slice(start, start + limit);

    // Get resident data for each ID
    const residents = await Promise.all(
      paginatedIds.map((id) => getResident(id))
    );

    return {
      residents: residents.filter(Boolean), // Filter out any null results
      total: residentIds.length,
      page,
      limit,
      totalPages: Math.ceil(residentIds.length / limit),
    };
  } catch (error) {
    console.error("Error getting all residents:", error);
    throw error;
  }
}

export async function searchResidents(query) {
  try {
    const searchTerm = query.toLowerCase();
    let residentIds = new Set();

    // Search by name
    const nameMatchKeys = await redis.keys(
      `residents:index:name:*${searchTerm}*`
    );
    for (const key of nameMatchKeys) {
      const ids = await redis.smembers(key);
      ids.forEach((id) => residentIds.add(id));
    }

    // Search by category tag
    const tagMatchKeys = await redis.keys(
      `residents:index:tag:*${searchTerm}*`
    );
    for (const key of tagMatchKeys) {
      const ids = await redis.smembers(key);
      ids.forEach((id) => residentIds.add(id));
    }

    // Get full resident data for matching IDs
    const residents = await Promise.all(
      Array.from(residentIds).map((id) => getResident(id))
    );

    return residents.filter(Boolean); // Filter out any null results
  } catch (error) {
    console.error("Error searching residents:", error);
    throw error;
  }
}

export async function getResidentsByHousehold(householdId) {
  try {
    // Get all resident IDs in the household
    const residentIds = await redis.smembers(
      `residents:household:${householdId}`
    );

    // Get resident data for each ID
    const residents = await Promise.all(
      residentIds.map((id) => getResident(id))
    );

    return residents.filter(Boolean); // Filter out any null results
  } catch (error) {
    console.error("Error getting residents by household:", error);
    throw error;
  }
}

export async function getDemographicStats() {
  try {
    const residentIds = await redis.smembers("residents:ids");
    const residents = await Promise.all(
      residentIds.map((id) => getResident(id))
    );

    // Filter out any null results
    const validResidents = residents.filter(Boolean);

    // Calculate various demographic statistics
    const stats = {
      total: validResidents.length,
      genderDistribution: {},
      ageGroups: {
        "0-17": 0,
        "18-30": 0,
        "31-45": 0,
        "46-60": 0,
        "61+": 0,
      },
      civilStatusDistribution: {},
      occupationDistribution: {},
    };

    for (const resident of validResidents) {
      // Gender distribution
      stats.genderDistribution[resident.gender] =
        (stats.genderDistribution[resident.gender] || 0) + 1;

      // Age groups
      if (resident.birthDate) {
        const birthDate = new Date(resident.birthDate);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();

        if (age <= 17) stats.ageGroups["0-17"]++;
        else if (age <= 30) stats.ageGroups["18-30"]++;
        else if (age <= 45) stats.ageGroups["31-45"]++;
        else if (age <= 60) stats.ageGroups["46-60"]++;
        else stats.ageGroups["61+"]++;
      }

      // Civil status distribution
      stats.civilStatusDistribution[resident.civilStatus] =
        (stats.civilStatusDistribution[resident.civilStatus] || 0) + 1;

      // Occupation distribution
      if (resident.occupation) {
        stats.occupationDistribution[resident.occupation] =
          (stats.occupationDistribution[resident.occupation] || 0) + 1;
      }
    }

    return stats;
  } catch (error) {
    console.error("Error getting demographic stats:", error);
    throw error;
  }
}
