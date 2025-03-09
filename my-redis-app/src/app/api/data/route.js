import { NextResponse } from "next/server";
import redis from "../../../../lib/redis";

export async function GET() {
  try {
    // Example: Get all keys with a specific pattern
    const keys = await redis.keys("*");
    const data = {};

    // Get values for each key
    for (const key of keys) {
      data[key] = await redis.get(key);
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { key, value } = await request.json();
    await redis.set(key, value);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
