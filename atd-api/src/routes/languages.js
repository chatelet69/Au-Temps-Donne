const express                   = require('express');
const router                    = express.Router();
const LanguagesController = require("../controller/languagesController")
const languagesController = new LanguagesController()
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");

// GET

router.get("/api/getLanguages", (req, res) => {
    languagesController.getLanguages(req, res);
});

router.get("/api/updateTraductions", [authMiddleware, authAdminMiddleware] ,(req, res) => {
    languagesController.updateTraductions(req, res);
});

router.get("/api/getTraductionsByLanguage/:language", (req, res) => {
    languagesController.getTraductionsByLanguage(req, res);
});

router.get("/api/getLanguage/:userId", [authMiddleware], (req, res) => {
    languagesController.getLanguageByUserId(req, res);
});

// POST

router.post("/api/addTraduction", [authMiddleware, authAdminMiddleware], (req, res) => {
    languagesController.addTraduction(req, res);
});

// PATCH

router.patch("/api/setLanguage/:userId", [authMiddleware], (req, res) => {
    languagesController.setLanguage(req, res);
});
// DELETE


module.exports = router;