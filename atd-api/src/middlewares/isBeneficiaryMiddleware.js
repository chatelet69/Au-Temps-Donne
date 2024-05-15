const { ranks } = require("../utils/form.json");

const isBeneficiaryMiddleware = (req, res, next) => {
    const reqUser = req.user;
    if (!reqUser || reqUser.rank < ranks.beneficiary) return res.status(403).json({message: "Vous n'avez pas les droits nécessaires."});
    next();
};

module.exports = isBeneficiaryMiddleware;