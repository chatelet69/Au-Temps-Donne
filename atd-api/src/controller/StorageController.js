const StorageService    = require("../services/StorageService");
const baseURL           = require("../../config.json").baseUrl;
const form              = require("../utils/form.json");

class StorageController {
    storageService;

    constructor() {
        this.storageService = new StorageService();
    };

    getAllWarehouses = async(req, res) => {
        try {
            const warehousesList = await this.storageService.getAllWarehousesService();
            if (warehousesList && !warehousesList.error) res.status(200).json({warehouses: warehousesList});
            else res.status(404).json({ error: (warehouses.error) ? warehouses.error : form.errorDuringGet });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    getAllWorkPlaces = async(req, res) => {
        try {
            const workPlaces = await this.storageService.getAllWorkPlacesService();
            if (workPlaces && !workPlaces.error) res.status(200).json({count: workPlaces.length, workPlaces: workPlaces});
            else res.status(404).json({ error: (workPlaces.error) ? workPlaces.error : form.errorDuringGet });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getTotalStock(req, res){
        try {
            const result = await this.storageService.getTotalStockService(req.user);
            if(result){
                res.status(200).json({count: result.length, stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getStockByType(req, res){
        try {
            const result = await this.storageService.getStockByTypeService(req.user, req.params);
            if(result){
                res.status(200).json({count: result.length, stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getStockGroupByType(req, res){
        try {
            const result = await this.storageService.getStockGroupByTypeService(req.user);
            if(result){
                res.status(200).json({count: result.length, stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getStockById(req, res){
        try {
            const result = await this.storageService.getStockByIdService(req.user, req.params);
            if(result){
                res.status(200).json({stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }
    
    async getNearDlcProducts(req, res){
        try {
            const result = await this.storageService.getNearDlcProductsService(req.user);
            if(result){
                res.status(200).json({count: result.length, stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }
    
    async getDlcProducts(req, res){
        try {
            const result = await this.storageService.getDlcProductsService(req.user);
            if(result){
                res.status(200).json({count: result.length, stock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }
    async receptCollectProducts(req, res){
        try {
            const result = await this.storageService.receptCollectProductsService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Produits récéptionnés avec succès !"});
            }else{
                res.status(400).json({ error: "Erreur durant la réception"});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Erreur durant la réception" });
        }
    }

    async updateStockByProduct(req, res){
        try {
            const result = await this.storageService.updateStockByProductService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Stock du produit modifié avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringPatch});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringPatch });
        }
    }

    async moveStockByProduct(req, res){
        try {
            const result = await this.storageService.moveStockByProductService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Stock du produit déplacé avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringPatch});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringPatch });
        }
    }

    async getCollectProduct(req, res){
        try {
            console.log(req.body)
            const result = await this.storageService.getCollectProductService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Produits récupérés avec succès ! N'oubliez pas de les re scanner à l'arrivée."});
            }else{
                res.status(400).json({ error: form.errorDuringPost});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringPost });
        }
    }
    
    async addManuallyProduct(req, res){
        try {
            const result = await this.storageService.addManuallyProductService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Produits ajouté avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringPost});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringPost });
        }
    }
    
    async addStockInLocation(req, res){
        try {
            const result = await this.storageService.addStockInLocationService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Produits ajouté avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringPost});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringPost });
        }
    }

    async deleteStockById(req, res){
        try {
            const result = await this.storageService.deleteStockByIdService(req.user, req.body);
            if(result){
                res.status(200).json({message: "Produits supprimé avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringDelete});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringDelete });
        }
    }
    async getMissingStock(req, res){
        try {
            const result = await this.storageService.getMissingStockService(req.user, req.query);
            if(result){
                res.status(200).json({count: result.length, missingStock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getLastStock(req, res){
        try {
            const result = await this.storageService.getLastStockService(req.user, req.query);
            if(result){
                res.status(200).json({lastStock: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getAmountStock(req, res){
        try {
            const result = await this.storageService.getAmountStockService();
            if(result){
                res.status(200).json({result: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async getEvolutionStock(req, res){
        try {
            const result = await this.storageService.getEvolutionStockService();
            if(result){
                res.status(200).json({result: result});
            }else{
                res.status(400).json({ error: form.errorDuringGet});
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    async addEvolutionStock(req, res){
        try {
            const result = await this.storageService.addEvolutionStockService();
            if(result.message){
                res.status(200).json({message: "Produits ajouté avec succès !"});
            }else{
                res.status(400).json({ error: form.errorDuringPost});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringPost });
        }
    }

    async getExpectedFlow(req, res) {
        try {
            const result = await this.storageService.getExpectedFlowService();
            if (result && !result.error) res.status(200).json({ count: result });
            else res.status(500).json({ error: form.errorDuringGet});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }
}

module.exports = StorageController;