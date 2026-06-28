import { responseError } from "../util/response.util.js";
import logger from "../config/logger.config.js";

const authorizedRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!roles.includes(userRole)) {
            logger.warn(`User ${req.user.userID} with role ${userRole} attempted to access restricted resource`);
            return responseError(res, 403, "You do not have permission to access this resource", "error", "FORBIDDEN");
        }

        next();
    }
}

export default authorizedRoles;