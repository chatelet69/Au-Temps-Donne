const express                   = require('express');
const router                    = express.Router();
const CollectsController        = require("../controller/CollectsController");
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const isAssoMiddleware = require('../middlewares/isAssoMiddleware');
const collectsController        = new CollectsController();


// GET
router.get("/api/collects/allCollects", (req, res) => {
    collectsController.getAllCollectsController(req, res);
});

router.get("/api/collects/:id", (req, res) => {
    collectsController.getCollectByIdController(req, res);
});

router.get("/api/collects/get/getNextCollect",(req, res)=>{
    collectsController.getNextCollectsController(req, res);
})

router.get("/api/collects/get/getAllPartner",(req, res)=>{
    collectsController.getAllPartnerController(req, res);
})

router.get("/api/collects/get/getAllPartner",(req, res)=>{
    collectsController.getAllPartnerController(req, res);
})

router.get("/api/collects/get/getAllPartnerByTraject/:id",(req, res)=>{
    collectsController.getAllPartnerByTrajectController(req, res);
})

router.get("/api/collects/get/getShortestRoute/:id",(req, res)=>{
    collectsController.getShortestRouteController(req, res);
})

router.get("/api/collects/get/getAllStockByCollect/:id",(req, res)=>{
    collectsController.getAllStockByCollectController(req, res);
})

router.get("/api/collects/get/getCollectsByDriver/:idDriver", [authMiddleware, isAssoMiddleware], (req, res)=>{
    collectsController.getCollectsByDriver(req, res);
})

// POST
router.post("/api/collects/addCollect", (req, res) => {
    collectsController.addCollectController(req, res);
});

router.post("/api/collects/addPartner", (req, res) => {
    collectsController.addPartnerController(req, res);
})

router.post("/api/collects/addPartnerToCollect", (req, res) => {
    collectsController.addPartnerToCollectController(req, res);
})

// PATCH
router.patch("/api/collects/editCollect/:id",(req, res) => {
    collectsController.editCollect(req, res);
})

router.patch('/api/collects/delete/:id',(req, res) => {
    collectsController.deleteCollectController(req, res);
})

module.exports = router;