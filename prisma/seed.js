import { PrismaClient } from "./generated/prisma/index.js";
import UserRepository from "../src/repository/user.repository.js";
import logger from "../src/config/logger.config.js";

const prisma = new PrismaClient();

const seed = async () => {
    try {
        await UserRepository.generateUserRoles();
        logger.info("User roles seeded successfully.");
    } catch (error) {
        logger.error("Seeding failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
};

seed();