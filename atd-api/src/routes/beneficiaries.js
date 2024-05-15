const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const BeneficiariesController = require("../controller/beneficiariesController");
const beneficiariesController = new BeneficiariesController();

router.post("/api/beneficiaries/registerBeneficiaries",(req, res) => {
    beneficiariesController.addNewBeneficiary(req, res);
});

router.get("/api/beneficiaries/allBeneficiariesApplications", [authMiddleware], (req, res) => {
    beneficiariesController.getAllBeneficiaries(req, res);
});

router.get("/api/beneficiaries/getBeneficiaryApplications/:beneficiaryId", [authMiddleware], (req, res) => {
    beneficiariesController.getBeneficiaryApplicationById(req, res);
});

router.get("/api/minIO/getFileByName", [authMiddleware], (req, res) => {
    beneficiariesController.getFileByName(req,res);
})

router.patch("/api/beneficiaryApplication/accept/:idApplication", [authMiddleware], (req, res) => {
    beneficiariesController.acceptBeneficiaryById(req, res);
});

router.patch("/api/beneficiaryApplication/refuse/:idApplication", [authMiddleware], (req, res) => {
    beneficiariesController.refuseBeneficiaryById(req, res);
});

router.patch("/api/beneficiaryApplication/update/:userId", [authMiddleware], (req, res) => {
    beneficiariesController.updateBeneficiaryApplication(req, res);
});

module.exports = router