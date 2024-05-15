const checkServerMiddleware = (req, res, next) => {
    const reqIp = (req.ip) ? req.ip : req.connection.remoteAddress;
    if (reqIp.localeCompare("::1") === 0 || reqIp.includes("127.0.0.1")) {
        next();
    } else {
        res.status(403).json({ error: "unauthorized" });
    }
};

module.exports = checkServerMiddleware;