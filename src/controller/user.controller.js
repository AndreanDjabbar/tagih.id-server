import UserService from "../service/user.service.js";
import { responseSuccess } from "../util/response.util.js"; 

export const getMyUserDataController = async (req, res) => {  
    const userID = req.user.userID; 
    if(!userID) {
        const error = new Error("User ID not found in token");
        error.statusCode = 400;
        throw error;
    }
    const result = await UserService.getMyUserData(userID);
    return responseSuccess(
        res,
        200,
        "My user data retrieved successfully",
        "data",
        {
            user: result
        }
    );
};