import { execSync } from "child_process";

const port = process.env.PORT || "3000";
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("⚠️  DATABASE_URL not set — skipping prisma db push. App will start but DB features will be disabled.");
} else {
  console.log("✓ DATABASE_URL found — running prisma db push...");
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("✓ Database schema synced.");
  } catch (e) {
    console.error("prisma db push failed:", e.message);
    // Don't crash — let the app start anyway
  }
}

console.log(`Starting Next.js on port ${port}...`);
execSync(`npx next start -p ${port}`, { stdio: "inherit" });
