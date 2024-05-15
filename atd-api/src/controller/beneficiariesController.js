const BeneficiariesService  = require("../services/beneficiariesService");
const form                  = require("../utils/form.json");
const moment                = require("moment");
const fs = require('fs').promises;

class BeneficiariesController{
    service;
    constructor(){
        this.service = new BeneficiariesService();
    }

    async addNewBeneficiary(req, res){
        try {
           const result = await this.service.createBeneficiary(req.body, req.files);
            if(result == "ok"){
                res.status(200).json({message: "Votre candidature a été créée avec succès !"});
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue lors de la création de votre candidature."});
        }
    }

    async getAllBeneficiaries(req, res){
        try {
            let result = await this.service.getAllBeneficiariesApplicationsService(req.user);
            if(result != false){
                if(result != "noCandid"){
                    res.status(200).json({count: result.length, applications: result});
                }else{
                    res.status(200).json({count: 0, applications: false});
                }
            }else{
                res.status(400).json({error: "Une erreur est survenue durant la récupération des candidatures."})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération des candidatures."})
        }
    }

    async acceptBeneficiaryById(req, res){
        try {
            let result = await this.service.changeBeneficiaryApplicationService(req.user, req.params.idApplication, 1, 2); // 1 = candid acceptée, 2 = rank bénéficiaire pour le user
            if(result == "ok"){
                res.status(200).json({message: "Candidature acceptée !"});
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: form.updateApplicationError})
        }
    }

    async refuseBeneficiaryById(req, res){
        try {
            let result = await this.service.changeBeneficiaryApplicationService(req.user, req.params.idApplication, 2, 1); // 1 = candid refusée, 1 = rank user pour le user
            if(result == "ok"){
                res.status(200).json({message: "Candidature refusée !"});
            }else{
                res.status(400).json({error: result});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: form.updateApplicationError})
        }
    }

    async getBeneficiaryApplicationById(req, res){
        try {
            let result = await this.service.getBeneficiaryApplicationByUserIdService(req.user, req.params.beneficiaryId);
            if(result != false){
                res.status(200).json({application: result});
            }else{
                res.status(400).json({error: "Une erreur est survenue lors de la récupération de la candidature"})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue lors de la récupération de la candidature"})
        }
    }
    async getFileByName(req,res){
        try {
            let result = await this.service.getFileByNameService(req.user, req.query.filename);
            if(result != false){
                res.status(200).json({link: result});
            }else{
                res.status(400).json({error: "Une erreur est survenue lors de la récupération du fichier"})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue lors de la récupération du fichier"})
        }
    }
    async updateBeneficiaryApplication(req, res){
        try {
            let result = await this.service.updateBeneficiaryApplicationByIdService(req.user, req.params.userId, req.body, req.files)
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
}
module.exports = BeneficiariesController;