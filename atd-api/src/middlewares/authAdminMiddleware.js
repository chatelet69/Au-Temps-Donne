const authAdminMiddleware = (req, res, next) => {
    const reqUser = req.user;
    if (!reqUser || reqUser.rank < "8") return res.status(403).json({message: "Vous n'avez pas les droits nécessaires."});
    next();
};

module.exports = authAdminMiddleware;