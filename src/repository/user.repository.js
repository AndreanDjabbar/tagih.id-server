import { PrismaClient } from "../../prisma/generated/prisma/index.js";

const prisma = new PrismaClient();

class UserRepository {
  static async generateUserRoles() {
    await prisma.user_Role.createMany({
      data: [
        { id: 0, name: 'DEVELOPER' },
        { id: 1, name: 'ADMIN' },
        { id: 2, name: 'STAFF' },
        { id: 3, name: 'USER' },
      ],
      skipDuplicates: true,
    });
  }
}

export default UserRepository;
