import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Prisma CLI doesn't load .env.local automatically (that's Next.js behaviour).
// We load it here so DATABASE_URL / DIRECT_URL are available to migration commands.
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL,
  },
});
