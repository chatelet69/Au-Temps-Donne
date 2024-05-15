const PartnersService  = require("../services/PartnersService.js");
const baseURL            = require("../../config.json").baseUrl;

class PartnersController {
    service;

    constructor() {
        this.service = new PartnersService();
    };


    async getAllPartnersController(req, res){
        try {
            const result = await this.service.getAllPartnersService();
            if (result) res.status(200).json({ count: result.length, results: result });
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async getPartnerByIdController(req, res){
        try {
            const idPartner = req.params.id;
            const result = await this.service.getPartnerByIdService(idPartner);
            if (result) res.status(200).json({ result });
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async deletePartnerController(req, res){
        console.log("deletePartnerController")
        try {
            const idPartner = req.params.id;
            const result = await this.service.deletePartnerService(idPartner);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant l'annulation de la formation"});
        }
    }

    async editPartnerController(req, res){
        console.log("passe dans editPartnerController")
        try {
            const data = req.body;
            const idPartner = req.params.id;
            console.log("data1 : ",data)
            const result = await this.service.editPartnerService(data, idPartner);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "Erreur durant la modification du partenaire"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la modification du partenaire"});
        }
    }

    
      
     
}

module.exports = PartnersController;