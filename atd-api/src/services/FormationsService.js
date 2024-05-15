const FormationsRepo         = require("../repository/FormationsRepo");
const baseUrl               = require("../../config.json").baseUrl;
const UtilService           = require("./UtilService");
const utilService           = new UtilService();
const moment                = require('moment');

class FormationsService {
    repository;

    constructor() {
        this.repository = new FormationsRepo();
    };

    async checkAvailabilityResponsable(idResponsable, endDate, startDate){
        const result = await this.repository.checkAvailabilityResponsable(idResponsable, endDate, startDate);
        return {
            isAvailable: (result.length == 0),
            result: result
        };
    }

    async addFormationService(data){
        try {
            if (moment(data.date_start).isBefore(moment())) {
                return { error: "Création de la formation impossible" };
            } else if (moment(data.date_start).isAfter(data.date_end)) {
                return { error: "Création de la formation impossible"};
            }

            const result = await this.checkAvailabilityResponsable(data.responsable, data.date_end, data.date_start);
            if (result.isAvailable) {
                await this.repository.postFormation(data);
                return { message: "Formation ajoutée avec succès" };
            }else {
                return { error: "Création de la formation impossible" };
            }

        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async cancelFormationService(idFormation){
        try {
            // la suppression de la formation ne peut etre faite que par un admin
            const resultFormation = await this.repository.getFormationById(idFormation)
            if (resultFormation.length === 0) {
                return {error: "Cette formation n'existe pas"};
            }
            for (const key in idFormation) if (idFormation[key] === undefined) return {error: "Valeur manquante ou non identifiée"};
            this.repository.deleteFormation(idFormation);
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getFormationService(idFormation){
        try {
            let result = await this.repository.getFormationById(idFormation);
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getFormationAllService(){
        try {
            let result = await this.repository.getAllFormations();
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getFormationsByStartDateService(){
        try {
            let result = await this.repository.getFormationsByStartDate();
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getFormationsByParamsService(whereParams, orderParams){
        try {
            let result = await this.repository.getFormationsByParams(whereParams, orderParams);
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async editFormationService(data, idFormation) {
        try {
            // la modification de la formation ne peut etre faite que par un admin
            const resultFormation = (await this.repository.getFormationById(idFormation))[0]
            if (resultFormation) {
                if (data.date_start || data.date_end) {
                    if (data.date_start === undefined) data.date_start = moment(resultFormation.datetime_start).format("YYYY-MM-DD HH:mm:ss");
                    if (data.date_end === undefined) data.date_end = moment(resultFormation.datetime_end).format("YYYY-MM-DD HH:mm:ss");

                    if (moment(data.date_end).isBefore(data.date_start)) return {error: "La date de fin est avant la date de début"};
                    if (moment(data.date_end).isBefore(moment())) return {error: "La date de fin est dans le passé"};
                    if (moment(data.date_start).isBefore(moment())) return {error: "La date de début est dans le passé"};

                    if (data.user === undefined) data.user = resultFormation.user_id_fk;

                    const resultAvailability = await this.checkAvailabilityResponsable(data.user, data.date_end, data.date_start);
                    if (!(resultAvailability.isAvailable)) {
                        return {error: "modification impossible"};
                    }
                }
                const result = await this.repository.editFormationById(data, idFormation);
                return result;
            }else {
                return {error: "Cette formation n'existe pas"}; 
            }
        } catch (error) {
            return false;
        }
    }

    async inscriptionFormationService(data){
        try {
            const resultFormation = await this.repository.getFormationById(data.formation)
            if (resultFormation.length === 0) return {error: "Cette formation n'existe pas"};
            const resultInscrit = (await this.repository.countInscription(data.formation))[0]
            if(resultInscrit.nbInscrit >= resultFormation[0].nb_places) return {error: "Places indisponibles"};

            const resultAlreadyRegistered = await this.repository.getInscritRepo(data.formation, data.user)
            if(resultAlreadyRegistered[0].inscrit >= 1 ) {
                return {error: "Vous êtes déjà inscrit"};
            }

            const check = await this.repository.inscriptionFormation(data);
            if (check.affectedRows > 0) return { success: "inscription réussie" };
            else return { error: "Erreur durant l'ajout de l'inscrit" };
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getResumeNextFormationsService(amount) {
        try {
            if (Number.isNaN(amount)) amount = 3;
            else amount = (Number.parseInt(amount) < 3 || Number.parseInt(amount) > 12 ) ? 3 : Number.parseInt(amount);

            const data = await this.repository.getResumeNextFormationsDb(amount);
            if (data) return data;
            else return { error: "Erreur durant la récupération des données" };
        } catch (error) {
            return {error: "Erreur durant la récupération des données"};
        }
    }

    async getAllWorkPlaceService(){
        try {
            let result = await this.repository.getAllWorkPlaceRepo();
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getFuturFormationService(){
        try {
            let result = await this.repository.getFuturFormationsRepo();
            return result;
        } catch (error) {
            return {error: "Erreur"};
        }
    }

    async getAllInscritService(idFormation){
        try {
            let result = await this.repository.getAllInscritRepo(idFormation);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getInscritService(formation, user){
        try {
            let result = await this.repository.getInscritRepo(formation, user);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getAllCertificatFormationByIdService(idUser){
        try {
            let result = await this.repository.getAllCertificatFormationByIdRepo(idUser);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async addStatusFormationService(idUser){
        try {
            let result = await this.repository.addStatusFormationRepo(idUser);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async updateStatusUserFormationService(data, idUser){
        try {
            let result = await this.repository.updateStatusUserFormationRepo(data, idUser);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async updateStatusRegisterFormationService(status, idUser, idFormation){
        try {
            let result = await this.repository.updateStatusRegisterFormationRepo(status, idUser, idFormation);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getAllFormationsByUserService(user, date){
        try {
            if(user === undefined || date === undefined){
                return {error : "Erreur"}
            }
            let result = await this.repository.getAllFormationsByUserRepo(user, date);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }
}

module.exports = FormationsService;