import path from "node:path";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  SEND_CONCURRENCY: z.coerce.number().int().min(1).max(25).default(10),
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = env.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);
