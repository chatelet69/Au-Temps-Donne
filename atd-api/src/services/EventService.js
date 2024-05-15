const EventRepository       = require("../repository/EventRepository");
const form                  = require("../utils/form.json");
const MinIOService          = require("../services/MinIOService");
const UserRepository        = require("../repository/UserRepository");
const VolunteerRepo         = require("../repository/volunteerRepo");
const UtilService           = require("./UtilService");
const StorageRepository     = require("../repository/StorageRepository");
const moment                = require("moment");
const mapKey                = process.env.MAPBOX_KEY;

class EventService {
    eventRepository;
    minIoService;
    userRepository;
    volunteerRepo;
    storageRepo;
    utilService;

    constructor() {
        this.minIoService = new MinIOService();
        this.userRepository = new UserRepository();
        this.eventRepository = new EventRepository();
        this.volunteerRepo = new VolunteerRepo();
        this.storageRepo = new StorageRepository();
        this.utilService = new UtilService();
    }

    async getAllEventsService(filter, userId) {
        try {
            if (filter === undefined || !form.getEventsFilters.includes(filter)) filter = "all";
            let eventsData = null;
            if (filter === "all") eventsData = await this.eventRepository.getAllEventsDb();
            else eventsData = await this.eventRepository.getAllEventsFilteredDb(filter, userId);

            if (eventsData !== null) return eventsData;
            else return { error: "Erreur durant la récupération des données" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la récupération des données" };
        }
    }

    async getAllEventTypesService() {
        try {
            const eventTypesData = await this.eventRepository.getAllEventTypesDb();
            if (eventTypesData) return eventTypesData;
            else return { error: "Erreur durant la récupération des données" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la récupération des données" };
        }
    }

    async getEventService(eventId) {
        try {
            if (eventId === 0 || isNaN(Number.parseInt(eventId)))
                return { error: "Identifiant de l'évènement incorrect" };
            const eventData = await this.eventRepository.getEventByIdDb(eventId);
            if (eventData) return eventData;
            else return { error: "Erreur durant la récupération des données" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la récupération des données" };
        }
    }

    async getResumeNextEventsService(amount) {
        try {
            if (Number.isNaN(amount)) amount = 3;
            else amount = (Number.parseInt(amount) < 1 || Number.parseInt(amount) > 12) ? 3 : Number.parseInt(amount);
            const eventsData = await this.eventRepository.getResumeNextEventsDb(amount);
            if (eventsData) return eventsData;
            else return { error: "Erreur durant la récupération des données" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la récupération des données" };
        }
    }

    async getMaraudingRoadFileService(eventId) {
        try {
            if (eventId <= 0) return { error: "Evènement introuvable" };
            const maraudingRoadFile = await this.minIoService.getEventFileTempLink(eventId, "road-file", "pdf");
            if (maraudingRoadFile) return maraudingRoadFile;
            else return { error: form.errorDuringGet };
        } catch (error) {
            console.log(error);
            return { error: form.errorDuringGet };
        }
    }

    async createRoadFileService(eventId, itineraryPointsData, needDbInsert) {
        try {
            if (eventId <= 0) return { error: "Evènement introuvable" };
            if (itineraryPointsData.length <= 0) return { error: "Données de l'itinéraires invalides ou manquantes" };
            const coords = [];

            for (let point of itineraryPointsData) {
                const baseMapUrl = "https://api.mapbox.com/geocoding/v5/mapbox.places";
                const finalUrl = `${baseMapUrl}/France,${point.city},${point.zip_code},${point.address.replaceAll(" ", "%20")},.json?limit=1&access_token=${mapKey}`;
                const res = await fetch(finalUrl);
                const data = await res.json();
                if (data && data.features && data.features.length > 0) {
                    point.lng = data.features[0].center[0];
                    point.lat = data.features[0].center[1];
                }
                if (needDbInsert) {
                    let resStatus = await this.eventRepository.insertNewTrajectPoint(eventId, point);
                    if (!resStatus || !resStatus.insertId) return { error: "Erreur durant l'ajout de l'itinéraire, contactez un administrateur" };
                }
                coords.push({ lng: data.features[0].center[0], lat: data.features[0].center[1] });
            };

            if (coords.length > 0) return coords;
            else return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at createRoadFileService : ", error);
            return { error: form.errorDuringGet };
        }
    }

    async checkEventDispoResponsable(responsableId, startDate, endDate) {
        try {
            const checkDisponiblityResponsable = await this.volunteerRepo.getPlanningElementsByVolunteerDateDb(responsableId, startDate, endDate);
            if (checkDisponiblityResponsable.length > 0) return { error: "Le responsable est déjà occupé à cette date" };
            return true;
        } catch (error) {
            console.log("error at checkEventDispoResponsable : ", error);
            return { error: "Erreur du serveur ! Contactez un administrateur" };
        }
    }

    async addContributorsEventPlanning(responsableId, eventId, dates, contributors) {
        try {
            let status = true;
            this.volunteerRepo.addNewDisponibilityDb(responsableId, dates.startDate, dates.endDate, `Responsable Event ${eventId}`, 0, eventId);

            if (contributors !== undefined && contributors.length > 0) {
                contributors.forEach(async (contributor) => {
                    const checkContributorDispo = await this.volunteerRepo.getPlanningElementsByVolunteerDateDb(
                        contributor.id, dates.startDate, dates.endDate
                    );
                    if (checkContributorDispo.length > 0) status = { contributor_occupied: true };
                    else this.volunteerRepo.addNewDisponibilityDb(contributor.id, dates.startDate, 
                                                                dates.endDate, `${contributor.type} Event ${eventId}`, 0, eventId);
                });
            }
            return status;
        } catch (error) {
            console.log("error at addContributorsEventPlanning : ", error);
            return { error: "Erreur du serveur ! Contactez un administrateur" };
        }
    }

    async createEventService(authorId, eventData) {
        try {
            let userCheckPerms = await this.userRepository.getUserRankById(authorId);
            if (userCheckPerms === undefined || userCheckPerms.rank < 4) return { error: form.missingPerms };
            const checkData = UtilService.checkSearchedKeys(eventData, form.requiredEventKeys, form.authorizedEventKeys);

            if (checkData) {
                const dates = UtilService.formatEventDates(eventData);
                const responsableId = Number.parseInt(eventData.responsable);
                const responsable = await this.userRepository.getUserById(responsableId);
                if (responsable.id !== responsableId || responsable === null || responsable.id === null) return { error: "Responsable non trouvé" };
                eventData.responsable = responsable.id;

                const checkDispoRespo = await this.checkEventDispoResponsable(responsableId, dates.startDate, dates.endDate);
                if (checkDispoRespo.error) return checkDispoRespo;

                const contributors = eventData.contributors;
                if (typeof contributors === "object") {
                    contributors.forEach((contributor) => {
                        if (!UtilService.checkSearchedKeys(contributor, ["name", "type"], ["name", "type"]))
                            return { error: form.errorDuringCreatingEvent };
                        contributor.id = Number.parseInt(contributor.name);
                    });
                }

                const createdEventId = await this.eventRepository.createEventDb(eventData);
                if (createdEventId.insertId) {
                    const eventId = createdEventId.insertId;
                    if (contributors !== undefined && contributors.length > 0) {
                        contributors.forEach(async (contributor) => {
                            await this.eventRepository.addEventContributorDb(eventId, Number.parseInt(contributor.name), contributor.type);
                        });
                    }

                    await this.addContributorsEventPlanning(responsableId, eventId, dates, contributors);
                    if (eventData.waypoints !== undefined && typeof eventData.waypoints === "object") {
                        const waypoints = eventData.waypoints;
                        const coordsCheck = await this.createRoadFileService(eventId, waypoints, true);
                        if (coordsCheck.error !== undefined) return coordsCheck;
                    }
                    return { eventId: createdEventId.insertId };
                }
            }
            return { error: form.errorDuringCreatingEvent };
        } catch (error) {
            console.log("Error at Service createEventService : ", error);
            return { error: form.errorDuringGet };
        }
    }

    async getEventItineraryService(eventId, isOptimized) {
        try {
            isOptimized = (isOptimized !== undefined && isOptimized === "true") ? true : false;
            const event = await this.eventRepository.getEventByIdDb(eventId);
            if (event !== null && event.id !== undefined) {
                let dataToBeReturned = {};
                const waypoints = await this.eventRepository.getEventItineraryDb(eventId);
                dataToBeReturned.waypoints = waypoints;
                if (isOptimized && waypoints.length > 0) {
                    let formatedPoints = "";
                    waypoints.forEach((waypoint, i) => { 
                        formatedPoints += `${waypoint.lng},${waypoint.lat}`;
                        if (i < (waypoints.length-1)) formatedPoints += ";";
                    });
                    const res = await fetch(`https://api.mapbox.com/optimized-trips/v1/mapbox/walking/${formatedPoints}?access_token=${mapKey}`);
                    const data = await res.json();
                    dataToBeReturned.geometry = data.trips[0].geometry;
                }
                return dataToBeReturned;
            } else {
                return { error: "Evènement introuvable" };
            }
            return { error: "Itinéraire impossible à récupérer" };
        } catch (error) {
            console.log("Error at @getEventItineraryService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async getEventContributorsService(eventId) {
        try {
            const event = await this.eventRepository.getEventByIdDb(eventId);
            if (event !== null) {
                const contributors = await this.eventRepository.getEventContributorsDb(eventId);
                return contributors;
            } else {
                return { error: "Evènement introuvable" };
            }
        } catch (error) {
            console.log("Error at Service @getEventContributorsService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async visitElderlyService(userInfos, body) {
        try {
            let formations = await this.volunteerRepo.getFormationsById(
                userInfos.userId
              );
              if (!body.idElderly || body.idElderly == "") return false;
              body.idElderly = parseInt(body.idElderly)
              if ((!formations || formations.old_people == 0) && userInfos.rank < 5) return false;
              let result = await this.eventRepository.visitElderlyIdRepo(body.idElderly, userInfos.userId);
              if (result) {
                return result;
              } else return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getEventStockElementsService(eventId) {
        try {
            eventId = Number.parseInt(eventId);
            const stockElements = await this.eventRepository.getEventStockElementsDb(eventId);
            stockElements.forEach((element) => { element.name = decodeURI(element.name); });
            return (stockElements !== null) ? stockElements : { error: "Evènement introuvable" };
        } catch (error) {
            console.log("Error at Service @getEventStockElementsService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async addEventStockElementService(eventId, stockData) {
        try {
            let resDb = null;
            eventId = Number.parseInt(eventId);
            const stockAmount = Number.parseInt(stockData.amount);
            const stockIdToAdd = Number.parseInt(stockData.stockId);
            const event = await this.eventRepository.getEventByIdDb(eventId);
            let stock = await this.storageRepo.getStockByIdRepo(stockIdToAdd);
            if (stock.length > 0) stock = stock[0];

            // Checking the date as well as the amount added
            if (event === undefined) return { error: "Evènement introuvable" };
            if (moment().isAfter(moment(event.end_datetime))) return { error: "Cet évènement est déjà fini" };
            if (stock.amount < stockData.amount) return { error: "Le montant demandé dépasse celui en stock" };

            if (stock !== undefined && stock.stockId === stockIdToAdd) {
                // Checking the amount already used in other events
                const checkEventsStocks = await this.eventRepository.getEventStocksByStockDb(stockIdToAdd);
                const totalAmount = Number.parseInt(checkEventsStocks.totalAmount);
                if (!isNaN(totalAmount) && (stock.amount - checkEventsStocks.totalAmount) < stockAmount)
                    return { error: "Le montant demandé n'est pas disponible" };
    
                resDb = await this.eventRepository.addEventStockElementDb(eventId, stockIdToAdd, stockAmount);
            }
            return (resDb !== null && resDb.insertId !== 0) ? true : { error: form.errorDuringPost };
        } catch (error) {
            console.log("Error at Service @addEventStockElementService :", error);
            return { error: form.errorDuringPost };
        }
    }

    async removeEventStockElementService(eventId, stockId) {
        try {
            eventId = Number.parseInt(eventId);
            stockId = Number.parseInt(stockId);
            const resDb = await this.eventRepository.deleteEventStockElementDb(eventId, stockId);
            return (resDb !== null && resDb.affectedRows > 0) ? true : { error: form.errorDuringDelete };
        } catch (error) {
            console.log("Error at Service @removeEventStockElementService :", error);
            return { error: form.errorDuringDelete };
        }
    }

    async deleteEventService(eventId) {
        try {
            eventId = Number.parseInt(eventId);
            const resDb = await this.eventRepository.deleteEventDb(eventId);
            return (resDb !== null && resDb.affectedRows > 0) ? true : { error: form.errorDuringDelete };
        } catch (error) {
            console.log("Error at Service @deleteEventService :", error);
            return { error: form.errorDuringDelete };
        }
    }

    async getBeneficiariesService(eventId) {
        try {
            eventId = Number.parseInt(eventId);
            const resDb = await this.eventRepository.getBeneficiariesDb(eventId);
            return (resDb !== null) ? resDb : { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at Service @getBeneficiariesService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async addEventBeneficiaryService(eventId, beneficiaryId) {
        try {
            eventId = Number.parseInt(eventId);
            beneficiaryId = Number.parseInt(beneficiaryId);
            if (isNaN(beneficiaryId) || isNaN(eventId)) return { error: form.missingOrBadData };
            const event = await this.eventRepository.getEventByIdDb(eventId);
            const beneficiaryUser = await this.userRepository.getUserById(beneficiaryId);

            if (event === null || event.id !== eventId) return { error: "Evènement introuvable" };
            if (beneficiaryUser === null || beneficiaryUser.length === 0) return { error: "Bénéficiaire introuvable" };

            const check = await this.eventRepository.checkEventBeneficiaryPresence(eventId, beneficiaryId);
            if (check.length > 0) return { error: "Ce bénéficiaire est déjà inscrit" };

            const resDb = await this.eventRepository.addEventBeneficiaryDb(eventId, beneficiaryId);
            if (resDb !== null && resDb.insertId > 0) return true;
            else return { error: form.errorDuringPost };
        } catch (error) {
            console.log("Error at Service @addEventBeneficiaryService :", error);
            return { error: form.errorDuringPost };
        }
    }

    async deleteEventBeneficiaryService(eventId, linkId) {
        try {
            eventId = Number.parseInt(eventId);
            linkId = Number.parseInt(linkId);
            const resDb = await this.eventRepository.deleteEventBeneficiaryDb(eventId, linkId);
            return (resDb !== null && resDb.affectedRows > 0) ? true : { error: form.errorDuringDelete };
        } catch (error) {
            console.log("Error at Service @deleteEventBeneficiaryService :", error);
            return { error: form.errorDuringDelete };
        }
    }

    async editEventStockElementService(eventId, linkId, stockData) {
        try {
            let resDb = null;
            eventId = Number.parseInt(eventId);
            if (isNaN(eventId) || stockData === null) return { error: form.missingOrBadData };

            const newStockAmount = Number.parseInt(stockData.newAmount);
            const stockIdToEdit = Number.parseInt(stockData.stockId);
            const event = await this.eventRepository.getEventByIdDb(eventId);
            let stock = await this.storageRepo.getStockByIdRepo(stockIdToEdit);
            if (stock.length > 0) stock = stock[0];

            // Checking the date as well as the amount added
            if (event === undefined) return { error: "Evènement introuvable" };
            if (moment().isAfter(moment(event.end_datetime))) return { error: "Cet évènement est déjà fini" };
            if (stock.amount < newStockAmount) return { error: "Le montant demandé dépasse celui en stock" };

            if (stock !== undefined && stock.stockId === stockIdToEdit) {
                // Checking the amount already used in other events
                const checkEventsStocks = await this.eventRepository.getEventStocksByStockDb(stockIdToEdit);
                const totalAmount = Number.parseInt(checkEventsStocks.totalAmount);
                if (!isNaN(totalAmount) && (stock.amount - totalAmount) < newStockAmount) 
                    return { error: "Le montant demandé n'est pas disponible" };

                resDb = await this.eventRepository.editEventStockElementDb(eventId, stockIdToEdit, newStockAmount);
            }
            return (resDb !== null && resDb.affectedRows > 0) ? true : { error: form.errorDuringPatch };
        } catch (error) {
            console.log("Error at Service @editEventStockElementService :", error);
            return { error: form.errorDuringPatch };
        }
    }

    async createRequestEventService(body) {
        try {
            let type_event = body.type_event_id_fk
            let beneficiary_id = body.beneficiary_id_fk
            let description = body.description
            let place = body.place
            let start_datetime = body.start_datetime
            let end_datetime = body.end_datetime
            if(!type_event || !beneficiary_id || !description || !place || !start_datetime || !end_datetime) return {error: "Arguments manquants"}
            let start = new Date(start_datetime.split(" ")[0])
            let end = new Date(end_datetime.split(" ")[0])
            let today = new Date(moment().format('YYYY-MM-DD'))
            if(start <= today || end <= today) return {error: "Mauvaise date, réservez au moins un jour à l'avance"}
            if(end<start) return {error: "Mauvaise date, la date de fin est avant le début"}
            if(isNaN(type_event) || isNaN(beneficiary_id)) return {error: "Mauvais types de données"}
            const resDb = await this.eventRepository.createRequestEventDb(type_event, beneficiary_id, description, place, start_datetime, end_datetime);
            return (resDb !== null) ? true : { error: "Une erreur est survenue lors de l'ajout en base de donnée" };
        } catch (error) {
            console.log("error at Service @createRequestEventService :" + error)
            return { error: "Erreur durant l'envoi" };
        }
    }

    async acceptRequestService(requestId, responsable){
        try {
            if(!requestId) return {error: "Mauvais type"};
            let request = await this.eventRepository.getRequestByIdForDb(requestId);
            if(request.length==0) return {error: "Cette requête n'existe pas"};
            request = request[0]
            request = this.utilService.decodeData(request)
            if(request.status != 0) return {error: "Requête déjà traitée"};
            let volunteer = await this.userRepository.getUserById(responsable);
            if(!volunteer || volunteer.rank<3) return {error: "Mauvais responsable"};
            let result = await this.eventRepository.changeRequestStatusDb(1, requestId);
            if(result.affectedRows==0) return { error: "Erreur durant l'acceptation" };
            let eventData = {}
            eventData["event_type"] = request.type_event_id_fk
            eventData["title"] = "Requête de " + request.username + " pour " + request.type_event
            eventData["start_datetime"] = request.start_datetime
            eventData["end_datetime"] = request.end_datetime
            eventData["responsable"] = responsable
            eventData["place"] = request.place
            eventData["description"] = request.description
            console.log(eventData["event_type"])
            let event = await this.eventRepository.createEventWithIdActiviyDb(eventData);
            if(event.affectedRows==0){
                await this.eventRepository.changeRequestStatusDb(0, requestId);
                return { error: "Erreur durant l'acceptation" };
            } 
            let assignBeneficiary = await this.eventRepository.addEventBeneficiaryDb(event[0].id, request.beneficiary_id)
            if(assignBeneficiary.affectedRows==0){
                await this.eventRepository.deleteEventDb(eventData);
                await this.eventRepository.changeRequestStatusDb(1, requestId);
                return { error: "Erreur durant l'acceptation" };
            } 
            return true;
        } catch (error) {
            console.log("Error at @acceptRequestService : " + error)
            return { error: "Erreur durant l'acceptation" };
        }
    }

    async refuseRequestService(requestId, userInfos){
        if(!requestId) return {error: "Mauvais type"};
        let request = await this.eventRepository.getRequestByIdForDb(requestId);
        if(request.length==0) return {error: "Cette requête n'existe pas"};
        request = request[0]
        request = this.utilService.decodeData(request)
        if(request.status != 0) return {error: "Requête déjà traitée"};
        let volunteer = await this.userRepository.getUserById(userInfos.userId);
        if(!volunteer || volunteer.rank<3) return {error: "Mauvais responsable"};
        let result = await this.eventRepository.changeRequestStatusDb(2, requestId);
        if(result.affectedRows==0) return { error: "Erreur durant l'acceptation" };
        return true;
    }

    async getRequestByIdService(requestId, userInfos) {
        try {
            if(!requestId) return { error: "Mauvais id" }
            let request = await this.eventRepository.getRequestByIdDb(requestId);
            if(request.length==0) return {error: "Cette requête n'existe pas"};
            request = request[0]
            request = this.utilService.decodeData(request)
            if(userInfos.rank<3 && request.beneficiary_id != userInfos.userId) return {error: "Droits insuffisants"};
            return request
        } catch (error) {
            console.log("Error at @getRequestByIdService : " + error)
            return { error: "Erreur durant la récupération" };
        }
    }

    async getAllRequestsService(userInfos) {
        try {
            if(userInfos.rank<3) return {error: "Droits insuffisants"};
            let request = await this.eventRepository.getAllRequestsDb();
            for (let i = 0; i < request.length; i++) {
                request[i] = this.utilService.decodeData(request[i])
            }
            return request
        } catch (error) {
            console.log("Error at @getAllRequestsService : " + error)
            return { error: "Erreur durant la récupération" };
        }
    }

    async getAllWaitingRequestsService(userInfos) {
        try {
            if(userInfos.rank<3) return {error: "Droits insuffisants"};
            let request = await this.eventRepository.getAllWaitingRequestsDb();
              for (let i = 0; i < request.length; i++) {
                request[i] = this.utilService.decodeData(request[i])
            }
            return request
        } catch (error) {
            console.log("Error at @getAllRequestsService : " + error)
            return { error: "Erreur durant la récupération" };
        }
    }

    async getRequestByUserIdService(userId, userInfos) {
        try {
            if(!userId) return { error: "Mauvais id" }
            let user = await this.userRepository.getUserById(userId);
            if(!user) return {error: "Utilisateur inconnu"};

            let request = await this.eventRepository.getRequestByUserIdDb(userId);
            for (let i = 0; i < request.length; i++) {
                request[i] = this.utilService.decodeData(request[i])
            }
            return request
        } catch (error) {
            console.log("Error at @getRequestByUserIdService : " + error)
            return { error: "Erreur durant la récupération" };
        }
    }

    async getEventByContributorsService(contributorId, date) {
        console.log("passe dans getEventByContributorsService")
        try {
            if(!contributorId) return { error: "Mauvais id" }
            let user = await this.userRepository.getUserById(contributorId);
            if(!user) return {error: "Utilisateur inconnu"};

            let request = await this.eventRepository.getEventByContributorsRepo(contributorId, date);
            return request
        } catch (error) {
            console.log("Error at @getEventByContributorsService : " + error)
            return { error: "Erreur durant la récupération" };
        }
    }

    async addEventContributorService(eventId, userId) {
        try {
            eventId = Number.parseInt(eventId);
            const event = await this.eventRepository.getEventByIdDb(eventId);
            const user = await this.userRepository.getUserById(userId);

            if (event === null || user.id === undefined) return { error: "Evènement ou utilisateur introuvable" };

            const startDate = event.start_datetime;
            const endDate = event.end_datetime;
            const checkUserDispo = await this.volunteerRepo.getPlanningElementsByVolunteerDateDb(userId, startDate, endDate);
            if (checkUserDispo.length > 0) return { error: "Vous êtes déjà occupé à cette Date / Heure" };

            const resAddContributor = await this.eventRepository.addEventContributorDb(eventId, userId, "contributor");
            const resDb = await this.volunteerRepo.addNewDisponibilityDb(userId, startDate, endDate, `Event ${event.id}`, 0, eventId);
            
            if (resAddContributor && resAddContributor.insertId !== undefined && resDb && resDb.insertId !== undefined) 
                return true;

            return { error: "Erreur durant l'inscription" };
        } catch (error) {
            console.log("Error at @addEventContributorService : ", error);
            return { error: "Erreur durant l'inscription" };
        }
    }

    async removeEventContributorService(eventId, userId, contributorId) {
        try {
            eventId = Number.parseInt(eventId);
            contributorId = (contributorId === undefined) ? 0 : Number.parseInt(contributorId);
            const event = await this.eventRepository.getEventByIdDb(eventId);
            const user = await this.userRepository.getUserById(userId);

            if (event === null || user.id === undefined) return { error: "Evènement ou utilisateur introuvable" };

            const endDate = moment(event.end_datetime);
            if (endDate.isBefore(moment())) return { error: "Cet évènement est déjà fini" };

            const resRemoveContributor = await this.eventRepository.deleteEventContributorDb(eventId, userId);
            let planningElementCheck = await this.volunteerRepo.getPlanningElementByEventAndUser(eventId, contributorId);
            if (planningElementCheck !== null && planningElementCheck.id !== undefined) 
                planningElementCheck = await this.volunteerRepo.deleteDisponibilityByIdDb(userId, planningElementCheck.id);

            if (resRemoveContributor && resRemoveContributor.affectedRows > 0) return true;

            return { error: "Erreur durant la désinscription" };
        } catch (error) {
            console.log("Error at @removeEventContributorService : ", error);
            return { error: "Erreur durant la désinscription" };
        }
    }

    async editEventService(eventId, userId, data) {
        try {
            eventId = Number.parseInt(eventId);
            if (isNaN(eventId)) return { error: "Id de l'évènement incorrect" };
            if (Object.keys(data).length <= 0) return { error: form.missingOrBadData };

            const event = await this.eventRepository.getEventByIdDb(eventId);
            const user = await this.userRepository.getUserById(userId);

            if (event === null || user.id === undefined) return { error: "Evènement ou utilisateur introuvable" };
            let endDate = moment(event.end_datetime);
            let startDate = moment(event.start_date);
            if (endDate.isBefore(moment())) return { error: "Cet évènement est déjà fini" };

            if (UtilService.checkSearchedKeys(data, null, form.authorizedEditEventKeys)) {
                if (data.start_date !== undefined || data.start_date !== undefined) {
                    const resCheckDate = UtilService.checkDatesPast(
                        (data.start_date !== undefined) ? data.start_date : null,
                        (data.end_date !== undefined) ? data.end_date : null
                    );
                    if (resCheckDate.error) return resCheckDate;
                    if (data.end_date !== undefined) endDate = data.end_date;
                    if (data.start_date !== undefined) startDate = (data.start_date !== undefined) ? data.start_date : event.start_date;
                }

                if (data.responsable !== undefined) {
                    const dates = UtilService.formatEventDates({ start_datetime: startDate, end_datetime: endDate });
                    const dispoRespo = await this.checkEventDispoResponsable(Number.parseInt(data.responsable), dates.startDate, dates.endDate);
                    if (dispoRespo.error !== undefined) return dispoRespo;
                }

                const resDb = await this.eventRepository.editEventDb(eventId, data);
                if (resDb !== null && resDb.affectedRows > 0) return true;
            } else { return { error: form.missingOrBadData }; }

            return { error: form.errorDuringPatch };
        } catch (error) {
            console.log("Error at @editEventService : ", error);
            return { error: form.errorDuringPatch };
        }
    }

    async getWaitingRequestByUserIdService(userId, userInfos) {
        try {
            if(!userId) return { error: "Mauvais id" };
            let user = await this.userRepository.getUserById(userId);
            if(!user) return {error: "Utilisateur inconnu"};

            let request = await this.eventRepository.getWaitingRequestByUserIdDb(userId);
            for (let i = 0; i < request.length; i++) {
                request[i] = this.utilService.decodeData(request[i]);
            }
            return request;
        } catch (error) {
            console.log("Error at @getWaitingRequestByUserIdService : " + error);
            return { error: "Erreur durant la récupération" };
        }
    }

    async getEventsByUserService(userId, userInfos) {
        try {
            if(!userId) return {error: "Mauvais id"};
            let user = await this.userRepository.getUserById(userId);
            if(!user) return {error: "Utilisateur inconnu"};

            let events = await this.eventRepository.getEventsByUserDb(userId);
            for (let i = 0; i < events.length; i++) {
                events[i] = this.utilService.decodeData(events[i]);
            }
            return events
        } catch (error) {
            console.log("Error at @getEventsByUserService : " + error);
            return { error: "Erreur durant la récupération" };
        }
    }

    async removeRequestService(requestId, userInfos){
        try {
            if (!requestId || requestId=="") return { error: "Mauvais id" };
            let request = await this.getRequestByIdService(requestId, userInfos);
            if (!request.length == 0) return { error: "Requête inexistante" };
            if (userInfos.rank < 3 && request.beneficiary_id != userInfos.userId) return { error: "Droits insuffisants" };
            let resRemove = await this.eventRepository.removeRequestDb(requestId);
            if (resRemove.affectedRows == 0 || !resRemove.affectedRows) return { error: "Erreur durant la suppression" };
            else return true;
        } catch (error) {
            console.log("Error at @removeRequestService : " + error);
            return { error: "Erreur durant la suppression" };
        }
    }

    async deliverMidProcess(eventId, linkId, data) {
        try {
            eventId = Number.parseInt(eventId);
            linkId = Number.parseInt(linkId);
            if (Object.keys(data).length !== 2) return { error: form.missingOrBadData };

            const event = await this.eventRepository.getEventByIdDb(eventId);
            if (event !== null && event.id !== undefined) return { event: event, eventId: eventId, linkId: linkId };
            else return { error: "Evènement introuvable" };
        } catch (error) {
            console.log("Error at @deliverMidProcess : " + error);
            return { error: "Erreur durant l'opération sur le stock" };
        }
    }

    async deliverStockElementService(eventId, linkId, data) {
        try {
            const resMidProcess = await this.deliverMidProcess(eventId, linkId, data);
            if (resMidProcess.error !== undefined) return resMidProcess;

            const link = await this.eventRepository.getEventStockElementByIdDb(resMidProcess.linkId);
            if (link !== null && link.stockId === data.stockId && link.eventId === resMidProcess.eventId) {
                const resDb = await this.eventRepository.changeEventStockStatus(resMidProcess.eventId, resMidProcess.linkId, form.eventElementStockStatus.delivered);
                const resStock = await this.storageRepo.removeAmountStockDb(link.amount, link.stockId);
                if (resDb !== null && resDb.affectedRows > 0 && resStock !== null && resStock.affectedRows > 0) 
                    return true;
            }

            return { error: "Erreur durant la sortie du stock" };
        } catch (error) {
            console.log("Error at @deliverStockElementService : " + error);
            return { error: "Erreur durant la sortie du stock" };
        }
    }

    async cancelDeliverStockElementService(eventId, linkId, data) {
        try {
            const resMidProcess = await this.deliverMidProcess(eventId, linkId, data);
            if (resMidProcess.error !== undefined) return resMidProcess;

            const link = await this.eventRepository.getEventStockElementByIdDb(resMidProcess.linkId);
            if (link !== null && link.stockId === data.stockId && link.eventId === resMidProcess.eventId) {
                const resDb = await this.eventRepository.changeEventStockStatus(resMidProcess.eventId, resMidProcess.linkId, form.eventElementStockStatus.pending);
                const resStock = await this.storageRepo.updateStockByProductRepo(link.amount, { id: link.stockId });
                if (resDb !== null && resDb.affectedRows > 0 && resStock !== null && resStock.affectedRows > 0) 
                    return true;
            }

            return { error: "Erreur durant la remise en stock" };
        } catch (error) {
            console.log("Error at @cancelDeliverStockElementService : " + error);
            return { error: "Erreur durant la remise en stock" };
        }
    }

    async addEventTrajectPointService(eventId, data) {
        try {
            eventId = Number.parseInt(eventId);
            if (isNaN(eventId)) return { error: "ID de l'évènement incorrect" };
            if (Object.keys(data).length !== 3 || !UtilService.checkSearchedKeys(data, form.eventPointKeys, form.eventPointKeys)) 
                return { error: form.missingOrBadData };

            const event = await this.eventRepository.getEventByIdDb(eventId);
            if (event !== null && event.id !== undefined) {
                const check = await this.eventRepository.getEventItineraryByAddress(eventId, `%${data.address}%`);
                if (check.length > 0) return { error: "Cette adresse est déjà dans l'évènement" };

                const coordsCheck = await this.createRoadFileService(eventId, [data], true);
                if (coordsCheck.error === undefined && coordsCheck.length > 0) return true;
            }

            return { error: "Erreur durant l'ajout du point" };
        } catch (error) {
            console.log("Error at @addEventTrajectPointService : " + error);
            return { error: "Erreur durant l'ajout du point" };
        }
    }

    async remvoveEventTrajectPointService(eventId, linkId) {
        try {
            eventId = Number.parseInt(eventId);
            linkId = Number.parseInt(linkId);
            if (isNaN(eventId) || isNaN(linkId)) return { error: "Un des ID passés est un incorrect" };

            const checkLink = await this.eventRepository.getEventItineraryPointByIdDb(eventId, linkId);
            if (checkLink !== null && checkLink.id !== undefined) {
                const resDb = await this.eventRepository.deleteIitineraryPointByIdDb(eventId, linkId);
                if (resDb !== null && resDb.affectedRows > 0) return true;
            }

            return { error: "Erreur durant la suppression du point" };
        } catch (error) {
            console.log("Error at @addEventTrajectPointService : " + error);
            return { error: "Erreur durant la suppression du point" };
        }
    }

    async editEventTrajectPointService(eventId, linkId, data) {
        try {
            eventId = Number.parseInt(eventId);
            linkId = Number.parseInt(linkId);
            if (isNaN(eventId) || isNaN(linkId)) return { error: "Un des ID passés est un incorrect" };
            if (!UtilService.checkSearchedKeys(data, null, form.eventPointKeys)) return { error: form.missingOrBadData };

            const element = await this.eventRepository.getEventItineraryPointByIdDb(eventId, linkId);
            if (element !== null && element.id !== undefined) {
                if (data.address !== undefined) {
                    const check = await this.eventRepository.getEventItineraryByAddress(eventId, `%${data.address}%`);
                    if (check.length > 0) return { error: "Cette adresse est déjà dans l'évènement" };
                }

                if (data.city === undefined) data.city = element.city;
                if (data.address === undefined) data.address = element.address;
                if (data.zip_code === undefined) data.zip_code = element.zip_code;

                const coordsCheck = await this.createRoadFileService(eventId, [data], false);
                if (coordsCheck.error === undefined && coordsCheck.length > 0) {
                    data.lng = coordsCheck[0].lng;
                    data.lat = coordsCheck[0].lat;
                    const resDb = await this.eventRepository.editTrajectPointDb(eventId, linkId, data);
                    if (resDb !== null && resDb.affectedRows > 0) return true;
                }
            }

            return { error: "Erreur durant la modification du point" };
        } catch (error) {
            console.log("Error at @editEventTrajectPoint : " + error);
            return { error: "Erreur durant la modification du point" };
        }
    }
}

module.exports = EventService;