const VolunteerService  = require("../services/volunteerService");
const baseURL           = require("../../config.json").baseUrl;
const forms             = require("../utils/form.json");
const moment            = require("moment");

class VolunteerController {
    service;

    constructor(){
        this.service = new VolunteerService();
    }
    
    async createApplication(req, res){
        try {
            let result = await this.service.createApplicationService(req.body, req.files);
            if(result == "ok"){
                res.status(200).json({message: "Candidature envoyée avec succès !"})
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.createApplicationError})
        }
        
    }

    async acceptApplication(req, res){
        try {
            let result = await this.service.changeApplicationService(req.user, req.params.idApplication, 1, 4); // 1 = candid acceptée, 4 = rank bénévole pour le user
            if(result == "ok"){
                res.status(200).json({message: "Candidature acceptée !"});
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.updateApplicationError})
        }
    }

    async refuseApplication(req, res){
        try {
            let result = await this.service.changeApplicationService(req.user, req.params.idApplication, 2, 1); // 2 = candid refusée, 1 = toujours le rank user
            if(result == "ok"){
                res.status(200).json({message: "Candidature refusée."});
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.updateApplicationError})
        }
    }

    async addNewDisponibility(req, res) {
        try {
            const userId = req.user.userId;
            const body = req.body;
            let resStatus = await this.service.addNewDisponibilityService(userId, body);
            if (!resStatus.error && resStatus === true) res.status(200).json({message: "success"});
            else res.status(500).json(resStatus);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorAddDispo});
        }
    }

    async sendMessage(req, res) {
        try {
            const data = {
                message: req.body.message, 
                file: req.files[0],
                authorId: req.user.userId
            };
            const resMessage = await this.service.sendMessageService(data);
            if (resMessage && !resMessage.error) res.status(200).json({message: "success"});
            else res.status(403).json({error: resMessage.error});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant l'envoi du message"});
        }
    }

    async getAllPlanningOfDay(req, res) {
        try {
            const queryData = req.query;
            const querySize = Object.keys(queryData).length;
            const disponibilities = await this.service.getAllPlanningOfDayService(queryData, querySize);
            
            if (!disponibilities.error) res.status(200).json({
                count: disponibilities.length, 
                date: (queryData.startDate) ? queryData.startDate : moment().format("DD/MM/YYYY"),
                disponibilities: disponibilities
            });
            else res.status(403).json({error: disponibilities.error});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorGetDisposOfDay});
        }
    }

    async getAllMessages(req, res) {
        try {
            const messages = await this.service.getAllMessagesService();
            if (!messages.error) res.status(200).json({count: messages.length, messages: messages});
            else res.status(404).json({error: "Erreur durant la récupération des messages"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des messages"});
        }
    }

    async getNextDispoByVolunteer(req, res) {
        try {
            const volunteerId = req.user.userId;
            
            const resService = await this.service.getNextDispoByVolunteerService(volunteerId);
            if (resService && !resService.error) res.status(200).json({volunteerId: volunteerId, count: resService.length, dispos: resService});
            else res.status(400).json({error: ((resService.error) ? resService.error : "Erreur durant la récupération")});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorGetDisposOfDay});
        }
    }

    async deleteDisponibilityById(req, res) {
        try {
            const volunteerId = req.user.userId;
            const dispoId = req.params.id;

            if (volunteerId === 0 || dispoId === 0) res.status(400).json({error: "Erreur dans la requête (Dispo ou utilisateur inexistant"});
            
            const resService = await this.service.deleteDisponibilityByIdService(volunteerId, dispoId);
            if (resService && !resService.error) res.status(200).json({message: "success"});
            else res.status(400).json({error: ((resService.error) ? resService.error : forms.errorDuringDelete)});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorDuringDelete});
        }
    }

    async deleteMessageById(req, res) {
        try {
            const volunteerId = req.user.userId;
            const messageId = req.params.id;

            if (messageId === 0 || volunteerId === 0) res.status(400).json({error: "Erreur dans la requête (Message ou utilisateur inexistant"});
            
            const resService = await this.service.deleteMessageByIdService(volunteerId, messageId);
            if (resService && !resService.error) res.status(200).json({message: "success"});
            else res.status(400).json({error: ((resService.error) ? resService.error : forms.errorDuringDelete)});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorDuringDelete});
        }
    }

    async getAllVolunteers(req, res) {
        try {
            if (req.user.userId === 0) res.status(400).json({error: "Utilisateur inexistant"});
            
            const volunteers = await this.service.getAllVolunteersService();
            if (volunteers && !volunteers.error) res.status(200).json({count: volunteers.length, volunteers: volunteers});
            else res.status(400).json({error: ((volunteers.error) ? volunteers.error : forms.errorDuringGet)});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: forms.errorDuringGet});
        }
    }

    async getApplicationById(req, res){
        try {
            let result = await this.service.getApplicationByIdService(req.user, req.params.idApplication);
            if(result != false){
                res.status(200).json({Candidature : result});
            }else{
                res.status(400).json({error: "Erreur durant la récupération de la candidature"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération de la candidature"});
        }
    }
    
    async deleteApplicationById(req, res){
        try {
            let result = await this.service.deleteApplicationByIdService(req.user, req.params.idApplication);
            if(result != false){
                res.status(200).json({message: "Candidature supprimée !"});
            }else{
                res.status(400).json({error: "Erreur durant la suppression de la candidature"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la suppression de la candidature"});
        }
    }

    async updateApplication(req, res){
        try {
            let result = await this.service.updateApplicationByIdService(req.user, req.params.userId, req.body, req.files)
            if(result != false){
                res.status(200).json({message: "Candidature modifiée !"});
            }else{
                res.status(400).json({error: "Erreur durant la modification de votre candidature"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la modification de votre candidature"});
        }
    }

    async getAllApplications(req, res){
        try {
            let result = await this.service.getAllApplicationsService(req.user);
            if(result != false){
                res.status(200).json({count: result.length, applications: result});
            }else{
                res.status(400).json({error: "Une erreur est survenue durant la récupérations des candidatures."})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupérations des candidatures."})
        }
    }

    async getApplicationsByStatus(req, res){
        try {
            let result = await this.service.getApplicationsByStatusService(req.params, req.user);
            if(result != false){
                if(result == "noCandid"){
                    res.status(200).json({count: 0, applications: []});
                }else{
                    res.status(200).json({count: result.length, applications: result});
                }
            }else{
                res.status(400).json({error: "Une erreur est survenue durant la récupérations des candidatures."})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupérations des candidatures."})
        }
    }

    async getFormationById(req, res){
        try {
            let result = await this.service.getFormationsByIdService(req.params, req.user.rank, req.user.userId);
            if(result != false){
                res.status(200).json({formations: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupérations des formations."})
        }
    }

    async getLastVolunteerApplications(req, res) {
        try {
            const amount = (req.query && req.query.amount) ? req.query.amount : 3;
            let result = await this.service.getLastVolunteerApplications(amount);
            if(result) res.status(200).json({count: result.length, applications: result});
            else res.status(404).json({ error: "Erreur durant la récupération des candidatures" });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des candidatures"})
        }
    }

    async getPlanning(req, res) {
        try {
            const filters = req.query;
            const userId = req.user.userId;

            let resStatus = await this.service.getPlanningByService(userId, filters);
            if (resStatus && !resStatus.error) res.status(200).json({plannings: resStatus, count: resStatus.length});
            else res.status(404).json({ error: "not_found" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: forms.errorEditPlanning });
        }
    }

    async editDisponibilityById(req, res) {
        try {
            const userId = req.user.userId;
            const body = req.body;
            const dispoId = req.params.id;

            let resStatus = await this.service.editDisponibilityService(userId, dispoId, body);
            if (resStatus && !resStatus.error) res.status(200).json({message: "success"});
            else res.status(500).json({ error: (resStatus.error) ? resStatus.error : forms.errorEditPlanning });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: forms.errorEditPlanning });
        }
    }
  
    async getApplicationByUserId(req, res) {
        try {
            const userId = req.params.userId;
            let result = await this.service.getApplicationByUserIdService(userId);
            if(result) res.status(200).json({application: result});
            else res.status(404).json({ error: "Erreur durant la récupération de la candidature" });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération de la candidature"})
        }
    }

    async getPlanningElementById(req, res) {
        try {
            const userId = req.user.userId;
            const planningId = req.params.id;

            let planning = await this.service.getPlanningElementService(userId, planningId);
            if (planning) res.status(200).json(planning);
            else res.status(404).json({ error: "Element non trouvé (ou permissions insuffisantes)" });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération de l'élément"});
        }
    }
}

module.exports = VolunteerController;