const haltTimeoutMiddleware = (req, res, next) => {
    if (!req.timedout) {
        next();
    }
    return;
};

export default haltTimeoutMiddleware