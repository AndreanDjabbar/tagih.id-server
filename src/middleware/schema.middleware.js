import { responseError } from "../util/response.util.js";

const validateSchema = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
        });

        if (error) {
            const errorObject = {};
            error.details.forEach((err) => {
                errorObject[err.path.join('.')] = err.message;
            });
            return responseError(res, 400, "Validation Error", "validationErrors", errorObject);
        }

        next();
    }
}

export default validateSchema;