// src/app/api/residents/[id]/route.js
import { NextResponse } from "next/server";
import {
  getResident,
  updateResident,
  deleteResident,
} from "../../../../../lib/models/resident";
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

// Get a specific resident
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
    const resident = await getResident(id);

    if (!resident) {
      return NextResponse.json(
        { error: `Resident with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({ resident });
  } catch (error) {
    console.error(`Error getting resident ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to get resident" },
      { status: 500 }
    );
  }
}

// Update a resident
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
    const residentData = await request.json();

    const updatedResident = await updateResident(id, residentData);

    return NextResponse.json({ success: true, resident: updatedResident });
  } catch (error) {
    console.error(`Error updating resident ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update resident" },
      { status: 400 }
    );
  }
}

// Delete a resident
export async function DELETE(request, { params }) {
  try {
    const user = await isAuthenticated();
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admin can delete residents
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin privileges required for deletion" },
        { status: 403 }
      );
    }

    const { id } = params;

    const result = await deleteResident(id);

    return NextResponse.json({ success: result });
  } catch (error) {
    console.error(`Error deleting resident ${params.id}:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to delete resident" },
      { status: 400 }
    );
  }
}
