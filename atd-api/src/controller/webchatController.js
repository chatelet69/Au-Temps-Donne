const WebchatService     = require("../services/WebchatService");
const baseURL            = require("../../config.json").baseUrl;

class WebchatController {
    service;

    constructor() {
        this.service = new WebchatService();
    };

    async getAllMessagesController(req, res){
        try {
            const result = await this.service.getAllMessagesService();
            if (result) res.status(200).json({ count: result.length, messages: result });
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des messages"});
        }
    }

    async getMessageByIdController(req, res){
        try {
            const idMessage = req.params.id
            const result = await this.service.getMessageByIdService(idMessage);
            if (result) res.status(200).json({ count: result.length, message: result });
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des messages"});
        }
    }

    async postMessageController(req, res) {
        try {
            const data = {
                user : req.user,
                messageText : req.body.messageText,
                messageFile: req.files
            }
            let resStatus = await this.service.postMessageService(data);
            console.log("resStatus", resStatus)
            if (resStatus.message) {
                res.status(200).json({message: "Ajout réalisé avec succès"});
            } else {
                res.status(500).json({error: "error dans postMessageController"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "error postMessageController"});
        }
    };

    async deleteMessageController(req, res){
        try {
            const idMessage = req.params.id
            const result = await this.service.deleteMessageService(idMessage);
            if (result) res.status(200).json(result);
            else res.status(500).json({error: "error"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Erreur durant la récupération des messages"});
        }
    }

}

module.exports = WebchatController;