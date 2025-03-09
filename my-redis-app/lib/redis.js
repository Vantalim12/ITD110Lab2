// lib/redis.js
import { Redis } from "ioredis";
import { initializeAdmin } from "./models/user";

// Create Redis client with connection from environment variables
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Initialize the admin user when the Redis connection is established
redis.on("connect", () => {
  console.log("Redis connected, initializing admin user...");
  initializeAdmin().catch(console.error);
});

export default redis;
