import { PrismaClient, UserRole, Verified } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");
    const hashedPassword = await bcrypt.hash('password123', 12);

  const user = {
    name: "Super Admin",
    email: "superadmin@ayurcare.com",
    role: UserRole.SUPER_ADMIN,
    password: hashedPassword,
    is_verified: Verified.VERIFIED,
  };

  await prisma.user.create({ data: user });

  console.log("🌱 Seed completed!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
