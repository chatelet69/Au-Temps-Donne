const CollectsService  = require("../services/CollectsService.js");

class CollectsController {
    service;

    constructor() {
        this.service = new CollectsService();
    };


    async getAllCollectsController(req, res){
        try {
            const result = await this.service.getAllCollectsService();
            if (result) res.status(200).json({ count: result.length, collects: result });
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async getCollectByIdController(req, res){
        try {
            const idCollect = req.params.id;
            const result = await this.service.getCollectByIdService(idCollect);
            if (result) res.status(200).json(result);
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération de la collect"});
        }
    }

    async addCollectController(req, res) {
        try {
            const dataCollect = {
                start_date : req.body.collectData.start_date,
                end_date : req.body.collectData.end_date,
                driver : req.body.collectData.driver,
            }

            const partnersData = req.body.partners;

            console.log(dataCollect)
            console.log("aaaaa", partnersData)

            let resStatus = await this.service.addCollectService(dataCollect, partnersData);
            if (resStatus && !resStatus.error) {
                res.status(200).json({ message: "success", collectId: resStatus.collectId });
            } else {
                res.status(400).json(resStatus);
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error"});
        }
    };

    async addPartnerToCollectController(req, res) {
        try {
            const idCollect = req.body.id;
            const partners = req.body.partners;
            console.log("aaaaaaaaaaa",partners)
            let resStatus = await this.service.addPartnerToCollectService(idCollect, partners);
            if (resStatus.message) {
                res.status(200).json({message: "Ajout réalisé avec succès"});
            } else {
                res.status(400).json({error: "error"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error"});
        }
    };

    async addPartnerController(req, res) {
        console.log("addPartnerController")
        try {
            const data = {
                address : req.body.address,
                zip_code : req.body.zip_code,
                city : req.body.city,
                description : req.body.description,
            }
            let resStatus = await this.service.addPartnertService(data);
            if (resStatus.message) {
                res.status(200).json({message: "Ajout réalisé avec succès"});
            } else {
                res.status(500).json({error: "error dans addPartnerController 1"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error addPartnerController 2"});
        }
    };

    async editCollect(req, res){
        try {
            const Collectdata = req.body.collect;
            const partnerData = req.body.partners
            const idCollect = req.params.id;
            console.log("Collectdata", Collectdata)
            console.log("partnerDate", partnerData)
            console.log("idCollect", idCollect)
            
            const result = await this.service.editCollectService(Collectdata, partnerData, idCollect);
            if (result) res.status(200).json(result);
            else res.status(400).json({error: "Erreur durant la modification de la collect 1" });
        } catch (error) {
           console.log(error);
           res.status(500).json({error: "Erreur durant la modification de la collect 2"});
        }
    }

    async getNextCollectsController(req, res){
        console.log("getLastCollectsController")
        try {
            const results = await this.service.getNextCollectsService();
            if(results){
                res.status(200).json(results);
            }else{
                res.status(400).json({ error: "erreur lors de la récupération"});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "erreur lors de la récupération" });
        }
    }

    async deleteCollectController(req, res){
        console.log("deleteCollectController")
        try {
            const idCollect = req.params.id;
            console.log(idCollect)
            const result = await this.service.deleteCollectService(idCollect);
            res.status(200).json(result);
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant l'annulation de la formation"});
        }
    }

    async getAllPartnerController(req, res){
        try {
            const result = await this.service.getAllPartnerService();
            if (result) res.status(200).json({ count: result.length, result: result });
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }


    async getAllPartnerByTrajectController(req, res){
        try {
            const idCollect = req.params.id;
            const result = await this.service.getAllPartnerByTrajectService(idCollect);
            if (result) res.status(200).json({ count: result.length, result: result });
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async getShortestRouteController(req, res){
        try {
            const idCollect = req.params.id;
            const result = await this.service.getShortestRouteService(idCollect);
            if (result) res.status(200).json({result: result });
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async getAllStockByCollectController(req, res){
        try {
            const idCollect = req.params.id;
            const result = await this.service.getAllStockByCollectService(idCollect);
            if (result) res.status(200).json({ count: result.length, result: result });
            else res.status(400).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des collects"});
        }
    }

    async getCollectsByDriver(req, res){
        try {
            const collects = await this.service.getCollectsByDriverService(req.params.idDriver);
            if (!collects.error) res.status(200).json({ count: collects.length, collects: collects });
            else res.status(400).json({error: "Erreur durant la récupération des collectes"});
        } catch (error) {
            console.log("Error at @getCollectsByDriver : " + error);
            res.status(500).json({error: "Erreur durant la récupération des collectes"});
        }
    }
}

module.exports = CollectsController;