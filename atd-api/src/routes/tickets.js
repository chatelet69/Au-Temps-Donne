const express                   = require('express');
const router                    = express.Router();
const authMiddleware            = require('../middlewares/authMiddleware');
const isAssoMiddleware          = require("../middlewares/isAssoMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const TicketController          = require("../controller/TicketController");
const ticketsController         = new TicketController();

// GET

router.get("/api/tickets", [authMiddleware, isAssoMiddleware], ticketsController.getAllTickets);

router.get("/api/tickets/getTicketById/:id" , [authMiddleware, isAssoMiddleware], ticketsController.getTicketById);

router.get("/api/tickets/:id/chat", [authMiddleware, isAssoMiddleware], ticketsController.getTicketChat);

router.get("/api/tickets/:id/close", [authMiddleware, isAssoMiddleware], ticketsController.closeTicket);

router.get("/api/tickets/:id/open", [authMiddleware, isAssoMiddleware], ticketsController.openTicket);

router.get("/api/tickets/getTicketsByUser", [authMiddleware, isAssoMiddleware], ticketsController.getTicketsByUser);

// POST

router.post("/api/tickets/:id/chat", [authMiddleware, isAssoMiddleware], ticketsController.addNewTicketChat);

router.post("/api/tickets", [authMiddleware, isAssoMiddleware], ticketsController.createTicket);

// PUT

router.put("/api/tickets/:id/edit", [authMiddleware, isAssoMiddleware], ticketsController.changeTicketDifficulty);

// DELETE

router.delete("/api/tickets/:id" , [authMiddleware, authAdminMiddleware], ticketsController.deleteTicket);

module.exports = router;