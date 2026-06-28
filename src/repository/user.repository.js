import postgreSQL from "../config/postgres.config.js";

class UserRepository {
  static async getByEmail(email) {
    const [user] = await postgreSQL`
            SELECT * FROM public."User" 
            WHERE LOWER(email) = LOWER(${email})
        `;
    return user;
  }

  static async getById(id) {
    const [user] = await postgreSQL`
            SELECT * FROM public."User" WHERE id = ${id}
        `;
    return user;
  }

  static async getByRoleAndRestaurantId(role, restaurantId) {
    const users = await postgreSQL`
            SELECT id, name, email, role
            FROM public."User" 
            WHERE restaurant_id = ${restaurantId} AND role = ${role}
        `;
    return users;
  }

  static async getByRolesAndRestaurantId(roles, restaurantId) {
    const users = await postgreSQL`
            SELECT id, name, email, role
            FROM public."User" 
            WHERE restaurant_id = ${restaurantId} AND role IN ${postgreSQL(roles)}
        `;
    return users;
  }

  static async create({
    name,
    email,
    password,
    role = "USER",
    is_verified = false,
    restaurantId = null,
  }) {
    const [newUser] = await postgreSQL`
            INSERT INTO public."User" (
                id, name, email, password, role, is_verified, restaurant_id, created_at, updated_at
            )
            VALUES (
                gen_random_uuid(), 
                ${name}, 
                ${email}, 
                ${password}, 
                ${role}, 
                ${is_verified}, 
                ${restaurantId}, 
                NOW(), 
                NOW()
            )
            RETURNING id, name, email, role, restaurant_id, created_at
        `;
    return newUser;
  }

  static async delete(id) {
    await postgreSQL`
            DELETE FROM public."User" WHERE id = ${id}
        `;
  }

  static async updateUser(id, updateFields) {
    if (Object.keys(updateFields).length === 0) {
      throw new Error("No fields to update");
    }

    const keys = Object.keys(updateFields);
    const values = Object.values(updateFields);

    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(", ");

    const [updatedUser] = await postgreSQL.unsafe(
      `
            UPDATE public."User"
            SET ${setClause}, "updated_at" = NOW()
            WHERE "id" = $1
            RETURNING id, name, email, created_at, updated_at, is_verified
        `,
      [id, ...values]
    );

    return updatedUser;
  }
}

export default UserRepository;
