// src/app/api/households/route.js
import { NextResponse } from "next/server";
import {
  createHousehold,
  getAllHouseholds,
  searchHouseholds,
  getHouseholdStats,
} from "../../../../lib/models/household";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify authentication
async function isAuthenticated() {
  const token = cookies().get("auth-token")?.value;

  if (!token) {
    return false;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    return false;
  }
}

// Get all households or search
export async function GET(request) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Handle search case
    if (search) {
      const households = await searchHouseholds(search);
      return NextResponse.json({ households });
    }

    // Handle stats case
    if (searchParams.get("stats") === "true") {
      const stats = await getHouseholdStats();
      return NextResponse.json({ stats });
    }

    // Handle regular pagination case
    const result = await getAllHouseholds(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting households:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get households" },
      { status: 500 }
    );
  }
}

// Create a new household
export async function POST(request) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const householdData = await request.json();
    const householdId = await createHousehold(householdData);

    return NextResponse.json({ success: true, householdId }, { status: 201 });
  } catch (error) {
    console.error("Error creating household:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create household" },
      { status: 400 }
    );
  }
}
