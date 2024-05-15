const FormationsService  = require("../services/FormationsService");
const baseURL            = require("../../config.json").baseUrl;

class FormationsController {
    service;

    constructor() {
        this.service = new FormationsService();
    };

    async addFormation(req, res) {
        try {
            const data = {
                title: req.body.title,
                work_place : req.body.work_place,
                date_start : req.body.date_start,
                date_end : req.body.date_end,
                nb_place : req.body.nb_place,
                type : req.body.type,
                responsable : req.body.user,
            }

            let resStatus = await this.service.addFormationService(data);
            if (resStatus.message) {
                res.status(200).json({message: resStatus.message});
            } else {
                res.status(500).json(resStatus);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error"});
        }
    };

    async cancelFormation(req, res){
        try {
            const idFormation = req.params.id;
            const result = await this.service.cancelFormationService(idFormation);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant l'annulation de la formation"});
        }
    }

    async getFormation(req, res){
        try {
            const idFormation = req.params.id;
            const result = await this.service.getFormationService(idFormation);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération de la formation"});
        }
    }

    async getAllFormations(req, res){
        try {
            const result = await this.service.getFormationAllService();
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des formations"});
        }
    }

    async getFormationsByStartDate(req, res){
        try {
            const result = await this.service.getFormationsByStartDateService();
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des formations"});
        }
    }

    async getFormationsByParams(req, res){
        try {
            const data = req.body;
            const orderKeys = ["datetime_start", "datetime_end"];
            const whereKeys = ["work_place_id_fk", "nb_places", "user_id_fk", "type", "status"];
            const orderParams = {};
            const whereParams = {};
            for (const key in data) {
                const value = data[key];
                if (orderKeys.includes(key)) orderParams[key] = value;
            }
            for (const key in data) {
                const value = data[key];
                if (whereKeys.includes(key)) whereParams[key] = value;
            }

            const result = await this.service.getFormationsByParamsService(whereParams, orderParams);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur "});
        }
    }

 
    async editFormations(req, res){
        try {
            const data = req.body;
            const idFormation = req.params.id;
            const result = await this.service.editFormationService(data, idFormation);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "Erreur durant la modification de la réservation"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la modification de la réservation"});
        }
    }

    async inscriptionFormation(req, res) {
        console.log("inscriptionFormation")
        try {
            const data = req.body;
            let resStatus = await this.service.inscriptionFormationService(data);
            console.log("resStatus", resStatus.error)
            if (resStatus.success) {
                res.status(200).json({message: "success"});
            } else {
                res.status(500).json({ error: resStatus.error });
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error"});
        }
    };

    async getResumeNextFormations(req, res) {
        try {
            const amount = (req.query && req.query.amount) ? req.query.amount : 3;
            let data = await this.service.getResumeNextFormationsService(amount);
            if (data && !data.error) res.status(200).json({ count: data.length, formations: data });
            else res.status(500).json({ error: ((data.error) ? data.error : "Erreur durant la récupération") });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erreur durant la récupération des prochaines formations" });
        }
    }

    async getAllWorkPlace(req, res) {
        try {
            const workPlaceData = await this.service.getAllWorkPlaceService();
            res.status(200).json(workPlaceData);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération des évènements"});
        }
    }

    async getFuturFormations(req, res) {
        try {
            const result = await this.service.getFuturFormationService();
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant l'annulation de la formation"});
        }
    }

    async getAllInscrit(req, res){
        try {
            const idFormation = req.params.id;
            const result = await this.service.getAllInscritService(idFormation);
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la recupération des inscrits"});
        }
    }

    async getInscrit(req, res){
        try {
            const user = req.body.user;
            const formation = req.body.formation;
            const result = await this.service.getInscritService(formation, user);
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la recupération des inscrits"});
        }
    }

    async getAllCertificatFormationByIdController(req, res){
        try {
            const idUser = req.params.id;
            const result = await this.service.getAllCertificatFormationByIdService(idUser);
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la recupération"});
        }
    }

    async addStatusFormationController(req, res){
        try {
            const idUser = req.params.id;
            const result = await this.service.addStatusFormationService(idUser);
            if (result) res.status(200).json({results : result});
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la recupération"});
        }
    }

    async updateStatusUserFormationController(req, res){
        try {
            const data = req.body;
            const idUser = req.params.id;
            const result = await this.service.updateStatusUserFormationService(data, idUser);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "Erreur durant la modification du statut"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la modification du statut"});
        }
    }

    async updateStatusRegisterFormationController(req, res){
        try {
            const status = req.body.status;
            const idUser = req.params.id;
            const idFormation = req.body.idFormation;
            console.log("status", status)
            console.log("idUser", idUser)
            console.log("idFormation", idFormation)
            const result = await this.service.updateStatusRegisterFormationService(status, idUser, idFormation);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "Erreur durant la modification du statut"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la modification du statut"});
        }
    }

    async getAllFormationsByUserController(req, res){
        try {
            const user = req.user.userId;
            const date = req.params.date
            const result = await this.service.getAllFormationsByUserService(user, date);
            if (result) res.status(200).json({ count: result.length, formations: result });
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la recupération"});
        }
    }
}

module.exports = FormationsController;