// src/app/api/residents/route.js
import { NextResponse } from "next/server";
import {
  createResident,
  getAllResidents,
  searchResidents,
  getDemographicStats,
} from "../../../../lib/models/resident";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify authentication
async function isAuthenticated(request) {
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

// Get all residents or search
export async function GET(request) {
  try {
    const user = await isAuthenticated(request);
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
      const residents = await searchResidents(search);
      return NextResponse.json({ residents });
    }

    // Handle stats case
    if (searchParams.get("stats") === "true") {
      const stats = await getDemographicStats();
      return NextResponse.json({ stats });
    }

    // Handle regular pagination case
    const result = await getAllResidents(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error getting residents:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get residents" },
      { status: 500 }
    );
  }
}

// Create a new resident
export async function POST(request) {
  try {
    const user = await isAuthenticated(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const residentData = await request.json();
    const residentId = await createResident(residentData);

    return NextResponse.json({ success: true, residentId }, { status: 201 });
  } catch (error) {
    console.error("Error creating resident:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create resident" },
      { status: 400 }
    );
  }
}
