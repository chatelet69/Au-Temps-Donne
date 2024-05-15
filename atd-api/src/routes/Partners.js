const express                   = require('express');
const router                    = express.Router();
const PartnersController       = require("../controller/PartnersController");
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const partnersController       = new PartnersController();

// GET
router.get("/api/partners/getAllPartners", (req, res) => {
    partnersController.getAllPartnersController(req, res);
});

router.get("/api/partners/getPartner/:id", (req, res) => {
    partnersController.getPartnerByIdController(req, res);
});

// PATCH
router.patch("/api/partners/deletePartner/:id", (req, res) => {
    partnersController.deletePartnerController(req, res);
});

router.patch("/api/partners/editPartner/:id", (req, res) => {
    partnersController.editPartnerController(req, res);
});

module.exports = router; 