const jwt       = require("jsonwebtoken");
const config    = require("../../config.json");
const secret    = config.secretJwt;

const authMiddleware = (req, res, next) => {
    let authToken = req.headers.authorization;
    let finalCookie = null;
    if (req.headers.cookie) {
        let cookies = req.headers.cookie.split(";");
        cookies.forEach((cookie) => {
            if (cookie.indexOf("atdCookie") !== -1) finalCookie = cookie.split("=")[1];
        })
    }

    if (authToken || finalCookie !== null) {
        try {
            if (!authToken && finalCookie) authToken = finalCookie;
            const infos = jwt.verify(authToken, secret);
            req.user = infos;
            const reqUser = req.user;
            if (!reqUser || reqUser.userId == 0 || reqUser.userId == undefined) return res.status(403).json({message: "unauthorized"});
            req.user.token = authToken;
            req.user.isAdmin = (infos.rank >= 8) ? true : false;
            next();
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "expired_token"});
        }
    } else {
        return res.status(403).json({error: "unauthenticated"});
    }
};

module.exports = authMiddleware;