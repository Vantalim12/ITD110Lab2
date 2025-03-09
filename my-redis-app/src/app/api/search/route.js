// src/app/api/search/route.js
import { NextResponse } from "next/server";
import { searchResidents } from "../../../../lib/models/resident";
import { searchHouseholds } from "../../../../lib/models/household";
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

// Combined search for residents and households
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
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Perform searches in parallel
    const [residents, households] = await Promise.all([
      searchResidents(query),
      searchHouseholds(query),
    ]);

    return NextResponse.json({
      results: {
        residents,
        households,
      },
      query,
    });
  } catch (error) {
    console.error("Error performing search:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
