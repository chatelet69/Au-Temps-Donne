const logMiddleware = (req, res, next) => {
    console.log(req.method, ":", req.originalUrl);
    // Garbage collector force usage
    //if (global.gc) global.gc();
    next();
}

module.exports = logMiddleware;