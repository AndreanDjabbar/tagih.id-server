import UserRepository from "../repository/user.repository.js";
import bcrypt from "bcrypt";

class UserService {
    static async getMyUserData(currentUserID) {
        const user = await UserRepository.getById(currentUserID);
        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }
        return {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            restaurantId: user.restaurant_id,
        };
    }
}

export default UserService;