import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Convert any category text → valid Prisma enum
function mapCategory(text?: string) {
  if (!text) return "OTHER";

  const t = text.toLowerCase();

  if (t.includes("cereal") || t.includes("grain")) return "GRAINS";
  if (t.includes("vegetable")) return "VEGETABLES";
  if (t.includes("fruit")) return "FRUITS";
  if (t.includes("dairy")) return "DAIRY";
  if (t.includes("spice")) return "SPICES";
  if (t.includes("herb")) return "HERBS";
  if (t.includes("nut")) return "NUTS";

  // Pulses, lentils, legumes → LEGUMES
  if (
    t.includes("pulse") ||
    t.includes("lentil") ||
    t.includes("legume") ||
    t.includes("dal")
  )
    return "LEGUMES";

  if (t.includes("meat") || t.includes("chicken") || t.includes("mutton"))
    return "MEAT";

  if (t.includes("fish")) return "FISH";

  return "OTHER";
}

async function main() {
  console.log("🌱 Starting Ayurveda Food Seed...");

  const filePath = path.join(__dirname, "green.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const foods = JSON.parse(raw);

  console.log(`📦 Found ${foods.length} food items. Seeding...\n`);

  for (const item of foods) {
    try {
      // Check duplicate by name
      const exists = await prisma.food.findFirst({
        where: { name: item.name },
      });

      if (exists) {
        console.log(`⏭ Skipped: ${item.name}`);
        continue;
      }

      await prisma.food.create({
        data: {
          name: item.name,
          category: mapCategory(item.category),

          calories: item.calories ?? null,
          protein: item.protein ?? null,
          carbs: item.carbs ?? null,
          fat: item.fat ?? null,

          rasa: item.rasa ?? null,
          virya: item.virya ?? null,
          guna: item.guna ?? null,
          vipaka: item.vipaka ?? null,

          vata: item.vata ?? 0,
          pitta: item.pitta ?? 0,
          kapha: item.kapha ?? 0,

          dietaryNotes: item.dietaryNotes ?? null,
          imageUrl: item.imageUrl ?? null,
        },
      });

      console.log(`✔ Added: ${item.name}`);
    } catch (err) {
      console.error(`❌ Error inserting ${item.name}:`, err);
    }
  }

  console.log("\n🌱 Food seeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
