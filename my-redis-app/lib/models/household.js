// lib/models/household.js
import redis from "../redis";
import { v4 as uuidv4 } from "uuid";
import { getResidentsByHousehold } from "./resident";

/**
 * Household Model for Redis
 *
 * Data structure:
 * - households:{id} -> Hash containing household details
 * - households:ids -> Set of all household IDs
 * - households:index:address:{address} -> Set of household IDs with this address for search
 * - households:index:barangay:{barangay} -> Set of household IDs in this barangay
 */

export async function createHousehold(householdData) {
  try {
    // Generate a unique ID if not provided
    const householdId = householdData.id || `hh:${uuidv4()}`;

    // Create a multi command to execute all Redis operations atomically
    const multi = redis.multi();

    // Store household data as a hash
    multi.hset(`households:${householdId}`, {
      id: householdId,
      addressLine1: householdData.addressLine1,
      addressLine2: householdData.addressLine2 || "",
      barangay: "Kabacsanan", // Fixed for this application
      city: householdData.city || "Default City",
      province: householdData.province || "Default Province",
      zipCode: householdData.zipCode || "",
      monthlyIncome: householdData.monthlyIncome || "0",
      categoryTags: JSON.stringify(householdData.categoryTags || []),
      notes: householdData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add to the set of all household IDs
    multi.sadd("households:ids", householdId);

    // Add to indexes for searching
    const addressForSearch = `${householdData.addressLine1} ${
      householdData.addressLine2 || ""
    }`.toLowerCase();
    multi.sadd(`households:index:address:${addressForSearch}`, householdId);

    // Add to barangay index
    multi.sadd("households:index:barangay:kabacsanan", householdId);

    // Add category tags for filtering
    if (
      householdData.categoryTags &&
      Array.isArray(householdData.categoryTags)
    ) {
      for (const tag of householdData.categoryTags) {
        multi.sadd(`households:index:tag:${tag.toLowerCase()}`, householdId);
      }
    }

    // Execute all commands
    await multi.exec();

    return householdId;
  } catch (error) {
    console.error("Error creating household:", error);
    throw error;
  }
}

export async function getHousehold(householdId) {
  try {
    const household = await redis.hgetall(`households:${householdId}`);

    // If household exists, parse JSON fields
    if (household && Object.keys(household).length > 0) {
      household.categoryTags = JSON.parse(household.categoryTags || "[]");
      return household;
    }

    return null;
  } catch (error) {
    console.error("Error getting household:", error);
    throw error;
  }
}

export async function updateHousehold(householdId, householdData) {
  try {
    const existingHousehold = await getHousehold(householdId);

    if (!existingHousehold) {
      throw new Error(`Household with ID ${householdId} not found`);
    }

    // Create a multi command to execute all Redis operations atomically
    const multi = redis.multi();

    // Update the household hash with new data
    const updatedHousehold = {
      ...existingHousehold,
      ...householdData,
      updatedAt: new Date().toISOString(),
    };

    // Ensure categoryTags is stringified
    if (
      updatedHousehold.categoryTags &&
      Array.isArray(updatedHousehold.categoryTags)
    ) {
      updatedHousehold.categoryTags = JSON.stringify(
        updatedHousehold.categoryTags
      );
    }

    multi.hset(`households:${householdId}`, updatedHousehold);

    // If address changed, update indexes
    if (householdData.addressLine1 || householdData.addressLine2) {
      // Remove from old address index
      const oldAddressForSearch = `${existingHousehold.addressLine1} ${
        existingHousehold.addressLine2 || ""
      }`.toLowerCase();
      multi.srem(
        `households:index:address:${oldAddressForSearch}`,
        householdId
      );

      // Add to new address index
      const newAddressLine1 =
        householdData.addressLine1 || existingHousehold.addressLine1;
      const newAddressLine2 =
        householdData.addressLine2 || existingHousehold.addressLine2 || "";
      const newAddressForSearch =
        `${newAddressLine1} ${newAddressLine2}`.toLowerCase();
      multi.sadd(
        `households:index:address:${newAddressForSearch}`,
        householdId
      );
    }

    // Execute all commands
    await multi.exec();

    // Return the updated household
    return getHousehold(householdId);
  } catch (error) {
    console.error("Error updating household:", error);
    throw error;
  }
}

export async function deleteHousehold(householdId) {
  try {
    const household = await getHousehold(householdId);

    if (!household) {
      throw new Error(`Household with ID ${householdId} not found`);
    }

    // Check if there are still residents in this household
    const residents = await getResidentsByHousehold(householdId);
    if (residents.length > 0) {
      throw new Error(
        `Cannot delete household with ID ${householdId} because it still has ${residents.length} residents`
      );
    }

    const multi = redis.multi();

    // Remove from indexes
    const addressForSearch = `${household.addressLine1} ${
      household.addressLine2 || ""
    }`.toLowerCase();
    multi.srem(`households:index:address:${addressForSearch}`, householdId);

    // Remove from barangay index
    multi.srem("households:index:barangay:kabacsanan", householdId);

    // Remove from category tags
    const categoryTags =
      typeof household.categoryTags === "string"
        ? JSON.parse(household.categoryTags)
        : household.categoryTags;

    if (Array.isArray(categoryTags)) {
      for (const tag of categoryTags) {
        multi.srem(`households:index:tag:${tag.toLowerCase()}`, householdId);
      }
    }

    // Remove from main household set
    multi.srem("households:ids", householdId);

    // Delete the household hash
    multi.del(`households:${householdId}`);

    // Execute all commands
    await multi.exec();

    return true;
  } catch (error) {
    console.error("Error deleting household:", error);
    throw error;
  }
}

export async function getAllHouseholds(page = 1, limit = 10) {
  try {
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get a subset of household IDs using pagination
    const householdIds = await redis.smembers("households:ids");
    const paginatedIds = householdIds.slice(start, start + limit);

    // Get household data for each ID
    const households = await Promise.all(
      paginatedIds.map((id) => getHousehold(id))
    );

    return {
      households: households.filter(Boolean), // Filter out any null results
      total: householdIds.length,
      page,
      limit,
      totalPages: Math.ceil(householdIds.length / limit),
    };
  } catch (error) {
    console.error("Error getting all households:", error);
    throw error;
  }
}

export async function searchHouseholds(query) {
  try {
    const searchTerm = query.toLowerCase();
    let householdIds = new Set();

    // Search by address
    const addressMatchKeys = await redis.keys(
      `households:index:address:*${searchTerm}*`
    );
    for (const key of addressMatchKeys) {
      const ids = await redis.smembers(key);
      ids.forEach((id) => householdIds.add(id));
    }

    // Search by category tag
    const tagMatchKeys = await redis.keys(
      `households:index:tag:*${searchTerm}*`
    );
    for (const key of tagMatchKeys) {
      const ids = await redis.smembers(key);
      ids.forEach((id) => householdIds.add(id));
    }

    // Get full household data for matching IDs
    const households = await Promise.all(
      Array.from(householdIds).map((id) => getHousehold(id))
    );

    return households.filter(Boolean); // Filter out any null results
  } catch (error) {
    console.error("Error searching households:", error);
    throw error;
  }
}

export async function getHouseholdWithResidents(householdId) {
  try {
    // Get the household data
    const household = await getHousehold(householdId);

    if (!household) {
      return null;
    }

    // Get all residents in the household
    const residents = await getResidentsByHousehold(householdId);

    // Return combined data
    return {
      ...household,
      residents,
    };
  } catch (error) {
    console.error("Error getting household with residents:", error);
    throw error;
  }
}

export async function getHouseholdStats() {
  try {
    const householdIds = await redis.smembers("households:ids");
    const households = await Promise.all(
      householdIds.map((id) => getHouseholdWithResidents(id))
    );

    // Filter out any null results
    const validHouseholds = households.filter(Boolean);

    // Calculate various household statistics
    const stats = {
      totalHouseholds: validHouseholds.length,
      incomeGroups: {
        "Below 10k": 0,
        "10k-20k": 0,
        "20k-50k": 0,
        "50k-100k": 0,
        "Above 100k": 0,
      },
      householdSizeDistribution: {
        1: 0,
        "2-3": 0,
        "4-5": 0,
        "6+": 0,
      },
      averageHouseholdSize: 0,
      totalResidents: 0,
    };

    for (const household of validHouseholds) {
      const monthlyIncome = parseFloat(household.monthlyIncome);
      const residentCount = household.residents
        ? household.residents.length
        : 0;

      // Income groups
      if (monthlyIncome < 10000) stats.incomeGroups["Below 10k"]++;
      else if (monthlyIncome < 20000) stats.incomeGroups["10k-20k"]++;
      else if (monthlyIncome < 50000) stats.incomeGroups["20k-50k"]++;
      else if (monthlyIncome < 100000) stats.incomeGroups["50k-100k"]++;
      else stats.incomeGroups["Above 100k"]++;

      // Household size distribution
      if (residentCount === 1) stats.householdSizeDistribution["1"]++;
      else if (residentCount <= 3) stats.householdSizeDistribution["2-3"]++;
      else if (residentCount <= 5) stats.householdSizeDistribution["4-5"]++;
      else stats.householdSizeDistribution["6+"]++;

      // Count total residents
      stats.totalResidents += residentCount;
    }

    // Calculate average household size
    stats.averageHouseholdSize =
      stats.totalResidents / Math.max(1, stats.totalHouseholds);

    return stats;
  } catch (error) {
    console.error("Error getting household stats:", error);
    throw error;
  }
}
