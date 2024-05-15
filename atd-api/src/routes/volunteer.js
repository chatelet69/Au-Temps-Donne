const express                   = require('express');
const router                    = express.Router();
const authMiddleware            = require('../middlewares/authMiddleware');
const VolunteerController       = require("../controller/volunteerController");
const volunteerController       = new VolunteerController();

// GET

router.get("/api/volunteer/allVolunteers", [authMiddleware], (req, res) => {
    volunteerController.getAllVolunteers(req, res);
});

router.get('/api/volunteers/volunteerApplication/:idApplication', [authMiddleware], (req, res) => {
    volunteerController.getApplicationById(req, res);
})

router.get("/api/volunteers/allVolunteerApplication", [authMiddleware], (req, res) => {
    volunteerController.getAllApplications(req, res);
});

router.get("/api/volunteers/lastVolunteerApplications", [authMiddleware], (req, res) => {
    volunteerController.getLastVolunteerApplications(req, res);
});

router.get("/api/volunteer/getFormations/:id", [authMiddleware], (req, res) => {
    volunteerController.getFormationById(req, res);
});

router.get("/api/volunteers/volunteerApplicationByStatus/:status", [authMiddleware], (req, res) => {
    volunteerController.getApplicationsByStatus(req, res);
});

router.get("/api/volunteers/getAllPlanningOfDay", [authMiddleware], (req, res) => {
    volunteerController.getAllPlanningOfDay(req, res);
});

router.get("/api/volunteers/chat/allMessages", [authMiddleware], (req, res) => {
    volunteerController.getAllMessages(req, res);
});

router.get("/api/volunteers/getNextDispoByVolunteer", [authMiddleware], (req, res) => {
    volunteerController.getNextDispoByVolunteer(req, res);
});

router.get("/api/volunteers/planning", [authMiddleware], (req, res) => {
    volunteerController.getPlanning(req, res);
});

router.get("/api/volunteer/getApplicationByUserId/:userId", [authMiddleware], (req, res) => {
    volunteerController.getApplicationByUserId(req, res);
});

router.get("/api/volunteers/disponibility/:id", [authMiddleware], (req, res) => {
    volunteerController.getPlanningElementById(req, res);
});

// POST

router.post('/api/volunteers/registerVolunteer', (req, res) => {
    volunteerController.createApplication(req, res);
});

router.post("/api/volunteers/chat/sendMessage", [authMiddleware], (req, res) => {
    volunteerController.sendMessage(req, res);
});

router.post("/api/volunteer/addNewDisponibility", [authMiddleware], (req, res) => {
    volunteerController.addNewDisponibility(req, res);
});

// PATCH 
  
router.patch('/api/volunteers/volunteerApplication/accept/:idApplication', [authMiddleware], (req, res) => {
    volunteerController.acceptApplication(req, res);
})

router.patch('/api/volunteers/volunteerApplication/refuse/:idApplication', [authMiddleware], (req, res) => {
    volunteerController.refuseApplication(req, res);
})

router.patch('/api/volunteers/volunteerApplication/update/:userId', [authMiddleware], (req, res) => {
    volunteerController.updateApplication(req, res);
})

router.patch("/api/volunteers/disponibility/:id", [authMiddleware], (req, res) => {
    volunteerController.editDisponibilityById(req, res);
});

// DELETE

router.delete("/api/volunteer/disponibility/:id", [authMiddleware], (req, res) => {
    volunteerController.deleteDisponibilityById(req, res);
});

router.delete("/api/volunteer/chat/message/:id", [authMiddleware], (req, res) => {
    volunteerController.deleteMessageById(req, res);
});
  
router.delete('/api/volunteers/volunteerApplication/:idApplication', [authMiddleware], (req, res) => {
    volunteerController.deleteApplicationById(req, res);
});

module.exports = router;