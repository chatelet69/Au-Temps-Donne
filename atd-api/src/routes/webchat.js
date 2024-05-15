const express                   = require('express');
const router                    = express.Router();
const WebchatController         = require("../controller/webchatController");
const authMiddleware            = require("../middlewares/authMiddleware");
const webchatController         = new WebchatController();


// GET 
router.get("/api/webchat/getAllMessages", [authMiddleware], (req, res) => {
    webchatController.getAllMessagesController(req, res);
});

router.get("/api/webchat/getMessageById/:id", [authMiddleware], (req, res) => {
    webchatController.getMessageByIdController(req, res);
});

// POST 
router.post("/api/webchat/postMessage", [authMiddleware], (req, res) => {
    webchatController.postMessageController(req, res);
});

// PATCH
router.patch("/api/webchat/deleteMessages/:id", (req, res) => {
    webchatController.deleteMessageController(req, res);
});


module.exports = router;