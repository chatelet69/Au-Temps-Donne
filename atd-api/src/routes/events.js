const express                   = require('express');
const router                    = express.Router();
const EventController           = require("../controller/EventController");
const authMiddleware            = require("../middlewares/authMiddleware");
const isBeneficiaryMiddleware   = require('../middlewares/isBeneficiaryMiddleware');
const isAssoMiddleware          = require('../middlewares/isAssoMiddleware');
const eventController           = new EventController();

// GET

router.get("/events/getAllEvents", [authMiddleware], eventController.getAllEvents);

router.get("/events/getAllEventTypes", [authMiddleware], eventController.getAllEventTypes);

router.get("/events/event/:id", [authMiddleware], eventController.getEvent);

router.get("/events/getResumeNextEvents", [authMiddleware], eventController.getResumeNextEvents);

router.get("/events/marauding/:id/roadfile", [authMiddleware], eventController.getMaraudingRoadFile);

router.get("/events/event/:id/itineraryPoints", [authMiddleware], eventController.getEventItinerary);

router.get("/events/event/:id/contributors", [authMiddleware], eventController.getEventContributors);

router.get("/events/event/:id/stockElements", [authMiddleware], eventController.getEventStockElements);

router.get("/events/event/:id/beneficiaries", [authMiddleware], eventController.getBeneficiaries);

router.get("/events/getEventByContributors/:date", [authMiddleware], eventController.getEventByContributors);

router.get("/requestEvent/getRequestById/:requestId", [authMiddleware], eventController.getRequestById);

router.get("/requestEvent/getRequestById/", [authMiddleware], eventController.getAllRequests);

router.get("/requestEvent/getRequestByUserId/:userId", [authMiddleware], eventController.getRequestByUserId);

router.get("/events/getEventsByUser/:userId", [authMiddleware], eventController.getEventsByUser);

// POST

router.post("/events/addNewEvent", [authMiddleware], eventController.createEvent);

router.post("/events/marauding/:id/roadfile", [authMiddleware], eventController.createRoadFile);

router.post("/events/elderly/visit", [authMiddleware], eventController.visitElderly);

router.post("/events/event/:id/stockElements", [authMiddleware], eventController.addEventStockElement);

router.post("/events/event/:id/beneficiaries", [authMiddleware], eventController.addEventBeneficiary);

router.post("/events/requestEvent", [authMiddleware, isBeneficiaryMiddleware], eventController.createRequestEvent);

router.post("/events/event/:id/contributor", [authMiddleware, isBeneficiaryMiddleware], eventController.addEventContributor);

router.post("/events/event/:id/addTrajectPoint", [authMiddleware], eventController.addTrajectPoint);

// PATCH

router.patch("/events/event/:id/stockElements/:linkId", [authMiddleware], eventController.editEventStockElement);

router.patch("/requestEvent/accept/:requestId", [authMiddleware, isAssoMiddleware], eventController.acceptRequest);

router.patch("/requestEvent/refuse/:requestId", [authMiddleware, isAssoMiddleware], eventController.refuseRequest);

router.patch("/events/event/:id", [authMiddleware], eventController.editEvent);

router.patch("/events/event/:id/stockElements/:linkId/deliver", [authMiddleware], eventController.deliverStockElement);

router.patch("/events/event/:id/stockElements/:linkId/cancelDeliver", [authMiddleware], eventController.cancelDeliverStockElement);

router.patch("/events/event/:id/trajectPoint/:linkId", [authMiddleware], eventController.editTrajectPoint);

// DELETE

router.delete("/events/event/:id", [authMiddleware], eventController.deleteEvent);

router.delete("/events/event/:id/stockElements/:stockId", [authMiddleware], eventController.removeEventStockElement);

router.delete("/events/event/:id/beneficiaries/:linkId", [authMiddleware], eventController.removeEventBeneficiary);

router.delete("/events/event/:id/contributor/:contributorId", [authMiddleware, isBeneficiaryMiddleware], eventController.removeEventContributor);

router.delete("/requestEvent/delete/:requestId", [authMiddleware], eventController.removeRequest);

router.delete("/events/event/:id/trajectPoint/:linkId", [authMiddleware], eventController.removeTrajectPoint);

module.exports = router;