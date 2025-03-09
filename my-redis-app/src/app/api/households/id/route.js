// src/app/api/households/[id]/route.js
import { NextResponse } from "next/server";
import {
  getHousehold,
  updateHousehold,
  deleteHousehold,
  getHouseholdWithResidents,
} from "../../../../../lib/models/household";
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

// Get a specific household
export async function GET(request, { params }) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeResidents = searchParams.get("residents") === "true";

    let household;

    if (includeResidents) {
      household = await getHouseholdWithResidents(id);
    } else {
      household = await getHousehold(id);
    }

    if (!household) {
      return NextResponse.json(
        { error: `Household with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ household });
  } catch (error) {
    console.error(`Error getting household ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get household" },
      { status: 500 }
    );
  }
}

// Update a household
export async function PUT(request, { params }) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id } = params;
    const householdData = await request.json();

    const updatedHousehold = await updateHousehold(id, householdData);

    return NextResponse.json({ success: true, household: updatedHousehold });
  } catch (error) {
    console.error(`Error updating household ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update household" },
      { status: 400 }
    );
  }
}

// Delete a household
export async function DELETE(request, { params }) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admin can delete households
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required for deletion" },
        { status: 403 }
      );
    }

    const { id } = params;

    const result = await deleteHousehold(id);

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error(`Error deleting household ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete household" },
      { status: 400 }
    );
  }
}
