import logger from "../../logs/logger.js";
import postgres from "postgres";
import {PrismaClient} from '../../prisma/generated/prisma/index.js';
import { POSTGRE_PORT, DATABASE_URL } from "../util/env.util.js";
const prisma = new PrismaClient();

const testPostgresConnection = async() => {
    try {
        await prisma.$connect();
        logger.info(`PostgreSQL connected on PORT: ${POSTGRE_PORT}`);
    } catch(e) {
        logger.error(`PostgreSQL connection error: ${e.message}`);
        process.exit(1);
    }
}
testPostgresConnection();

const connectionString = DATABASE_URL;

const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
});

const postgreSQL = client;

export const closeConnection = async () => {
    await client.end({ timeout: 5 });
};

export const prismaClient = prisma;
export default postgreSQL;