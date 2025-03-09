// lib/redis.js
import { Redis } from "ioredis";

// Create Redis client with connection from environment variables
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export default redis;
