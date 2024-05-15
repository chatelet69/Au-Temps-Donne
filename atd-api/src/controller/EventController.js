const EventService  = require("../services/EventService");
const form          = require("../utils/form.json");

class EventController {
    eventService;

    constructor() {
        this.eventService = new EventService();
    }

    getAllEvents = async (req, res) => {
        try {
            const filter = req.query.filter;
            const userId = req.user.userId;
            const eventsData = await this.eventService.getAllEventsService(filter, userId);
            res.status(200).json({ count: eventsData.length, events: eventsData });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération des évènements"});
        }
    }

    getAllEventTypes = async (req, res) => {
        try {
            const eventTypesData = await this.eventService.getAllEventTypesService();
            res.status(200).json(eventTypesData);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération des évènements"});
        }
    }

    getEvent = async (req, res) => {
        try {
            const eventId = req.params.id;
            const event = await this.eventService.getEventService(eventId);
            if (event && !event.error) res.status(200).json(event);
            else res.status(400).json({ error: (event.error) ? event.error : "Erreur durant la récupération" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des évènements" });
        }
    }

    getResumeNextEvents = async (req, res) => {
        try {
            const amount = (req.query && req.query.amount) ? req.query.amount : 3;
            const events = await this.eventService.getResumeNextEventsService(amount);
            if (events && !events.error) res.status(200).json({count: events.length, events: events});
            else res.status(400).json({ error: (events.error) ? events.error : "Erreur durant la récupération" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des évènements" });
        }
    }

    getMaraudingRoadFile = async (req, res) => {
        try {
            const eventId = req.params.id;
            const roadFile = this.eventService.getMaraudingRoadFileService(eventId);
            if (roadFile && roadFile !== null) res.status(200).json({link: roadFile});
            else res.status(400).json({ error: form.errorDuringGet });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    createEvent = async (req, res) => {
        try {
            const authorId = req.user.userId;
            const eventData = req.body;
            if (eventData.ok) delete eventData.ok;

            const resEventCreation = await this.eventService.createEventService(authorId, eventData);
            if (resEventCreation && !resEventCreation.error) res.status(200).json({ message: "success", enventId: resEventCreation.eventId });
            else res.status(400).json({ error: (resEventCreation.error) ? resEventCreation.error : form.errorDuringCreatingEvent });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringCreatingEvent });
        }
    }

    createRoadFile = async (req, res) => {
        try {
            const eventId = req.params.id;
            const itineraryPoints = req.body;
            const roadFile = await this.eventService.createRoadFileService(eventId, itineraryPoints, true);
            if (roadFile && !roadFile.error) res.status(200).json({ waypoints: roadFile, length: roadFile.length });
            else res.status(400).json({ error: "Erreur durant la création de l'itinéraire de l'évènement" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erreur durant la création de l'itinéraire de l'évènement" });
        }
    }

    getEventItinerary = async (req, res) => {
        try {
            const eventId = req.params.id;
            const isOptimized = req.query.optimized;
            const data = await this.eventService.getEventItineraryService(eventId, isOptimized);
            if (data && !data.error) res.status(200).json({ 
                waypoints: data.waypoints, length: data.waypoints.length, geometry: data.geometry 
            });
            else res.status(400).json({ error: "Erreur durant la récupération de l'itinéraire" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erreur durant la récupération de l'itinéraire" });
        }
    }

    getEventContributors = async (req, res) => {
        try {
            const eventId = req.params.id;
            const contributors = await this.eventService.getEventContributorsService(eventId);
            if (contributors && !contributors.error) res.status(200).json({ contributors: contributors, length: contributors.length });
            else res.status(400).json({ error: "Erreur durant la récupération des intervenants" });
        } catch (error) {
            console.log("Error at Controller @getEventContributors :", error);
            res.status(500).json({ error: "Erreur durant la récupération des intervenants" });
        }
    }

    visitElderly = async (req, res) => {
        try {
            const visit = await this.eventService.visitElderlyService(req.user, req.body);
            if (visit && !visit.error) res.status(200).json({ message: "Visite reçue !" });
            else res.status(400).json({ error: "Erreur durant la déclaration de la visite" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erreur durant la déclaration de la visite" });
        }
    }

    getEventStockElements = async (req, res) => {
        try {
            const eventId = req.params.id;
            const stockElements = await this.eventService.getEventStockElementsService(eventId);
            if (stockElements && !stockElements.error) res.status(200).json({ count: stockElements.length, stocks: stockElements });
            else res.status(400).json({ error: "Erreur durant la récupération des stocks de l'évènement" });
        } catch (error) {
            console.log("Error at Controller @getEventStockElements :", error);
            res.status(500).json({ error: "Erreur durant la récupération des stocks de l'évènement" });
        }
    }
    
    addEventStockElement = async (req, res) => {
        try {
            const eventId = req.params.id;
            const stockData = req.body;

            const stockElements = await this.eventService.addEventStockElementService(eventId, stockData);
            if (stockElements && !stockElements.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: stockElements.error });
        } catch (error) {
            console.log("Error at Controller @addEventStockElements :", error);
            res.status(500).json({ error: "Erreur durant l'ajout d'un stock à l'évènement" });
        }
    }

    createRequestEvent = async (req, res) => {
        try {
            const request = await this.eventService.createRequestEventService(req.body)
            if(request && !request.error) res.status(200).json({ message: "success" });
            else res.status(404).json({ error: request.error });
        } catch (error) {
            console.log("Error from @createRequestEvent : " + error)
            res.status(500).json({ error: "Erreur durant l'envoi de la demande" });
        }
    }

    removeEventStockElement = async (req, res) => {
        try {
            const eventId = req.params.id;
            const stockId = req.params.stockId;
            const stockElements = await this.eventService.removeEventStockElementService(eventId, stockId);
            if (stockElements && !stockElements.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: "Erreur durant le retrait de l'élément" });
        } catch (error) {
            console.log("Error at Controller @removeEventStockElement :", error);
            res.status(500).json({ error: "Erreur durant le retrait de l'élément" });
        }
    }
  
    deleteEvent = async (req, res) => {
        try {
            const eventId = req.params.id;
            const resService = await this.eventService.deleteEventService(eventId);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: "Erreur durant la suppresion de l'évènement" });
        } catch (error) {
            console.log("Error at Controller @removeEventStockElement :", error);
            res.status(500).json({ error: "Erreur durant la suppresion de l'évènement" });
        }
    }

    getBeneficiaries = async (req, res) => {
        try {
            const eventId = req.params.id;
            const beneficiaries = await this.eventService.getBeneficiariesService(eventId);
            if (beneficiaries && !beneficiaries.error) res.status(200).json({ count: beneficiaries.length, beneficiaries: beneficiaries });
            else res.status(500).json({ error: "Erreur durant la récupération des bénéficiaires" });
        } catch (error) {
            console.log("Error at Controller @getBeneficiaries :", error);
            res.status(500).json({ error: "Erreur durant la récupération des bénéficiaires" });
        }
    }


    addEventBeneficiary = async (req, res) => {
        try {
            const eventId = req.params.id;
            const beneficiaryId = req.body.beneficiaryId;

            const resBeneficiary = await this.eventService.addEventBeneficiaryService(eventId, beneficiaryId);
            if (resBeneficiary && !resBeneficiary.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resBeneficiary.error });
        } catch (error) {
            console.log("Error at Controller @addEventBeneficiary :", error);
            res.status(500).json({ error: "Erreur durant l'ajout du bénéficiaire" });
        }
    }

    removeEventBeneficiary = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const resService = await this.eventService.deleteEventBeneficiaryService(eventId, linkId);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: "Erreur durant la suppresion du bénéficiaire" });
        } catch (error) {
            console.log("Error at Controller @removeEventBeneficiary :", error);
            res.status(500).json({ error: "Erreur durant la suppresion du bénéficiaire" });
        }
    }

    editEventStockElement = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const stockData = req.body;

            const resService = await this.eventService.editEventStockElementService(eventId, linkId, stockData);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resService.error });
        } catch (error) {
            console.log("Error at Controller @editEventStockElement :", error);
            res.status(500).json({ error: "Erreur durant la modificatin du stock de l'évènement" });
        }
    }
    
    acceptRequest = async (req, res) => {
        try {
            const responsable = (req.body.responsable) ? req.body.responsable : null;
            const resRequest = await this.eventService.acceptRequestService(req.params.requestId, responsable);
            if (resRequest && !resRequest.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resRequest.error });
        } catch (error) {
            console.log("Error at Controller @acceptRequest :", error);
            res.status(500).json({ error: "Erreur durant l'acceptation de la demande" });
        }
    }

    refuseRequest = async (req, res) => {
        try {
            const resRequest = await this.eventService.refuseRequestService(req.params.requestId, req.user);
            if (resRequest && !resRequest.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resRequest.error });
        } catch (error) {
            console.log("Error at Controller @refuseRequest :", error);
            res.status(500).json({ error: "Erreur durant le refus de la demande" });
        }
    }

    getRequestById = async (req, res) => {
        try {
            const requestId = req.params.requestId;
            const resRequest = await this.eventService.getRequestByIdService(requestId, req.user);
            if (resRequest && !resRequest.error) res.status(200).json({ request: resRequest });
            else res.status(500).json({ error: resRequest.error });
        } catch (error) {
            console.log("Error at Controller @getRequestById :", error);
            res.status(500).json({ error: "Erreur durant la récupération de la requête" });
        }
    }

    getAllRequests = async (req, res) => {
        try {
            const resRequest = req.query.waiting ? await this.eventService.getAllWaitingRequestsService(req.user) : await this.eventService.getAllRequestsService(req.user)
            if (resRequest && !resRequest.error) res.status(200).json({ count: resRequest.length, requests: resRequest });
            else res.status(500).json({ error: resRequest.error });
        } catch (error) {
            console.log("Error at Controller @getAllRequests :", error);
            res.status(500).json({ error: "Erreur durant la récupération des requêtes" });
        }
    }

    getRequestByUserId = async (req, res) => {
        try {
            const userId = req.params.userId
            const resRequest = req.query.waiting ? await this.eventService.getWaitingRequestByUserIdService(userId, req.user) : await this.eventService.getRequestByUserIdService(userId, req.user);
            if (resRequest && !resRequest.error) res.status(200).json({ count: resRequest.length, request: resRequest });
            else res.status(500).json({ error: resRequest.error });
        } catch (error) {
            console.log("Error at Controller @getRequestByUserId :", error);
            res.status(500).json({ error: "Erreur durant la récupération des requêtes" });
        }
    }

    getEventByContributors = async (req, res) => {
        try {
            const contributorId = req.user.userId;
            const date = req.params.date
            const events = await this.eventService.getEventByContributorsService(contributorId, date);
            if (events && !events.error) res.status(200).json({ count: events.length, events: events });
            else res.status(500).json({ error: "Erreur durant la récupération des évènements" });
        } catch (error) {
            console.log("Error at Controller @getBeneficiaries :", error);
            res.status(500).json({ error: "Erreur durant la récupération des évènements" });
        }
    }

    addEventContributor = async (req, res) => {
        try {
            const eventId = req.params.id;
            const userId = req.user.userId;
            const resAddContributor = await this.eventService.addEventContributorService(eventId, userId);
            if (resAddContributor && !resAddContributor.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resAddContributor.error });
        } catch (error) {
            console.log("Error at Controller @addEventContributor :", error);
            res.status(500).json({ error: "Erreur durant l'inscription" });
        }
    }

    removeEventContributor = async (req, res) => {
        try {
            const eventId = req.params.id;
            const userId = req.user.userId;
            const contributorId = req.params.contributorId;
            const resRemoveContributor = await this.eventService.removeEventContributorService(eventId, userId, contributorId);
            if (resRemoveContributor && !resRemoveContributor.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resRemoveContributor.error });
        } catch (error) {
            console.log("Error at Controller @removeEventContributor :", error);
            res.status(500).json({ error: "Erreur durant l'inscription" });
        }
    }

    editEvent = async (req, res) => {
        try {
            const eventId = req.params.id;
            const userId = req.user.userId;
            const data = req.body;
            const resEditService = await this.eventService.editEventService(eventId, userId, data);
            if (resEditService && !resEditService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resEditService.error });
        } catch (error) {
            console.log("Error at Controller @editEvent :", error);
            res.status(500).json({ error: "Erreur durant la modification" });
        }
    }
    
    getEventsByUser = async (req, res) => {
        try {
            const userId = req.params.userId;
            const resEvents = await this.eventService.getEventsByUserService(userId, req.user);
            if (resEvents && !resEvents.error) res.status(200).json({ count: resEvents.length, events: resEvents });
            else res.status(500).json({ error: resEvents.error });
        } catch (error) {
            console.log("Error at Controller @getEventsByUser :", error);
            res.status(500).json({ error: "Erreur durant la récupération des évènements" });
        }
    }

    removeRequest = async (req, res) => {
        try {
            const requestId = req.params.requestId;
            const resEvents = await this.eventService.removeRequestService(requestId, req.user);
            if (resEvents && !resEvents.error) res.status(200).json({ message: "Requête supprimée avec succès !" });
            else res.status(500).json({ error: resEvents.error });
        } catch (error) {
            console.log("Error at Controller @removeRequest :", error);
            res.status(500).json({ error: "Erreur durant la suppression de la requête" });
        }
    }

    deliverStockElement = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const data = req.body;
            const resEvents = await this.eventService.deliverStockElementService(eventId, linkId, data);
            if (resEvents && !resEvents.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resEvents.error });
        } catch (error) {
            console.log("Error at Controller @deliverStockElement :", error);
            res.status(500).json({ error: "Erreur durant la livraison de l'élément" });
        }
    }

    cancelDeliverStockElement = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const data = req.body;
            const resEvents = await this.eventService.cancelDeliverStockElementService(eventId, linkId, data);
            if (resEvents && !resEvents.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resEvents.error });
        } catch (error) {
            console.log("Error at Controller @deliverStockElement :", error);
            res.status(500).json({ error: "Erreur durant la livraison de l'élément" });
        }
    }

    addTrajectPoint = async (req, res) => {
        try {
            const eventId = req.params.id;
            const data = req.body;
            const resService = await this.eventService.addEventTrajectPointService(eventId, data);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resService.error });
        } catch (error) {
            console.log("Error at Controller @addTrajectPoint :", error);
            res.status(500).json({ error: "Erreur durant l'ajout du point" });
        }
    }

    removeTrajectPoint = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const resService = await this.eventService.remvoveEventTrajectPointService(eventId, linkId);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resService.error });
        } catch (error) {
            console.log("Error at Controller @removeTrajectPoint :", error);
            res.status(500).json({ error: "Erreur durant l'ajout du point" });
        }
    }

    editTrajectPoint = async (req, res) => {
        try {
            const eventId = req.params.id;
            const linkId = req.params.linkId;
            const data = req.body;
            const resService = await this.eventService.editEventTrajectPointService(eventId, linkId, data);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(500).json({ error: resService.error });
        } catch (error) {
            console.log("Error at Controller @editTrajectPoint :", error);
            res.status(500).json({ error: "Erreur durant la modification du point" });
        }
    }
}

module.exports = EventController;