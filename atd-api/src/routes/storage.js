const express                   = require('express');
const router                    = express.Router();
const authMiddleware            = require('../middlewares/authMiddleware');
const checkServerMiddleware     = require('../middlewares/checkServerMiddleware');
const StorageController         = require("../controller/StorageController");
const storageController         = new StorageController();

// GET

router.get("/api/warehouses/getAll", storageController.getAllWarehouses);

router.get("/api/work_places/getAll", storageController.getAllWorkPlaces);

router.get("/api/warehouse/getTotalStock", [authMiddleware], (req, res) => {
    storageController.getTotalStock(req, res);
});

router.get("/api/warehouse/getStockByType/:type", [authMiddleware], (req, res) => {
    storageController.getStockByType(req, res);
});

router.get("/api/warehouse/getStockGroupByType", [authMiddleware], (req, res) => {
    storageController.getStockGroupByType(req, res);
});

router.get("/api/warehouse/getStockById/:id", [authMiddleware], (req, res) => {
    storageController.getStockById(req, res);
});

router.get("/api/warehouse/getMissingStock", [authMiddleware], (req, res) => {
    storageController.getMissingStock(req, res);
});

router.get("/api/warehouse/getNearDlcProducts", [authMiddleware], (req, res) => {
    storageController.getNearDlcProducts(req, res);
});

router.get("/api/warehouse/getDlcProducts", [authMiddleware], (req, res) => {
    storageController.getDlcProducts(req, res);
});

router.get("/api/warehouse/getLastStock", [authMiddleware], (req, res) => {
    storageController.getLastStock(req, res);
});

router.get("/api/warehouse/getAmountStock", [authMiddleware], (req, res) => {
    storageController.getAmountStock(req, res);
});

router.get("/api/warehouse/getEvolutionStock", [authMiddleware], (req, res) => {
    storageController.getEvolutionStock(req, res);
});

router.get("/api/warehouse/getExpectedFlow", [authMiddleware], (req, res) => {
    storageController.getExpectedFlow(req, res);
});

// POST

router.get("/api/warehouse/addEvolutionStock", [checkServerMiddleware], (req, res) => {
    storageController.addEvolutionStock(req, res);
});

// POST
router.post("/api/warehouse/getCollectProduct", [authMiddleware], (req, res) => {
    storageController.getCollectProduct(req, res);
});

router.post("/api/warehouse/addManuallyProduct", [authMiddleware], (req, res) => {
    storageController.addManuallyProduct(req, res);
});

router.post("/api/warehouse/addStockInLocation", [authMiddleware], (req, res) => {
    storageController.addStockInLocation(req, res);
});

// PATCH

router.patch("/api/warehouse/receptCollectProducts", [authMiddleware], (req, res) => {
    storageController.receptCollectProducts(req, res);
});

router.patch("/api/warehouse/updateStockByProduct", [authMiddleware], (req, res) =>{
    storageController.updateStockByProduct(req, res);
});

router.patch("/api/warehouse/moveStockByProduct", [authMiddleware], (req, res) =>{
    storageController.moveStockByProduct(req, res);
});

// DELETE

router.delete("/api/warehouse/deleteStockById", [authMiddleware], (req, res) => {
    storageController.deleteStockById(req, res);
});

module.exports = router;