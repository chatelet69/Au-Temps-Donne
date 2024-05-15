const express                   = require('express');
const router                    = express.Router();
const FormationsController      = require("../controller/FormationsController");
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const formationsController      = new FormationsController();

// GET

router.get("/api/getResumeNextFormations", [authMiddleware], (req, res) => {
    formationsController.getResumeNextFormations(req, res);
});

router.get('/api/formations/getFormation/:id', (req, res) => {
    formationsController.getFormation(req, res);
});

router.get('/api/formations', (req, res) => {
    formationsController.getAllFormations(req, res);
});
router.get('/api/formations/getFormationsByStartDate', (req, res) => {
    formationsController.getFormationsByStartDate(req, res);
});
router.get('/api/formations/getFormationsByParams', (req, res) => {
    formationsController.getFormationsByParams(req, res);
});

router.get('/api/getAllWorkPLace', [authMiddleware],(req, res) => {
    formationsController.getAllWorkPlace(req, res);
});

router.get('/api/formations/getFuturFormations', (req, res) => {
    formationsController.getFuturFormations(req, res);
});

router.get('/api/formations/getInscrits/:id', (req, res) => {
    formationsController.getAllInscrit(req, res);
});

router.get('/api/formations/getInscrit', (req, res) => {
    formationsController.getInscrit(req, res);
});

router.get('/api/formations/getAllCertificatFormationById/:id', (req, res) => {
    formationsController.getAllCertificatFormationByIdController(req, res);
});

router.get('/api/formations/getAllFormationsByUser/:date', [authMiddleware] ,(req, res) => {
    formationsController.getAllFormationsByUserController(req, res);
});

// POST
router.post('/api/formations/', [authMiddleware, authAdminMiddleware], (req, res) => {
    formationsController.addFormation(req, res);
});

router.post('/api/formationsRegister', (req, res) => {
    formationsController.inscriptionFormation(req, res);
});

router.post('/api/formation/addStatusFormation/:id', (req, res) => {
    formationsController.addStatusFormationController(req, res);
});

// PATCH 

router.patch('/api/formations/cancel/:id',(req, res) => {
    formationsController.cancelFormation(req, res);
})

router.patch("/api/formations/:id",(req, res) => {
    formationsController.editFormations(req, res);
})

router.patch("/api/formations/updateStatusUserFormation/:id",(req, res) => {
    formationsController.updateStatusUserFormationController(req, res);
})

router.patch("/api/formations/updateStatusRegisterFormation/:id",(req, res) => {
    formationsController.updateStatusRegisterFormationController(req, res);
})

 

module.exports = router;