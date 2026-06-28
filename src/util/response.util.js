export const responseSuccess = (res, status = 200, message = "Success", key = null, data = null) => {
    if (key === null || key === undefined) {
        key = "data";
    }
    return res.status(status).json({
        success: true,
        message: message,
        [key]: data,
    });
};

export const responseError = (res, status = 400, message, key = null, error = null) => {
    if (key === null || key === undefined) {
        key = "error";
    }
    return res.status(status).json({
        success: false,
        message: message,
        [key]: error,
    });
};