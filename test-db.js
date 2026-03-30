import { prisma } from "./lib/prisma"

async function testDB() {
  try {
    console.log("🔌 Testing database connection...");

    // 1. Simple query (replace with your model)
    const items = await prisma.menuItem.findMany({
      take: 5,
    });

    console.log("✅ Connection successful!");
    console.log("📦 Sample data:", items);

  } catch (error) {
    console.error("❌ Database test failed:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testDB();