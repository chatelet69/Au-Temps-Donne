const WebchatRepo           = require("../repository/WebchatRepo");
const baseUrl               = require("../../config.json").baseUrl;
const UtilService           = require("./UtilService");
const MinIoService      = require("./MinIOService");
const moment                = require('moment');

class WebchatService {
    repository;
    utilService;
    minioService;

    constructor() {
        this.utilService = new UtilService();
        this.repository = new WebchatRepo();
        this.minioService = new MinIoService();
    };

    async getAllMessagesService(){
        try {
            let result = await this.repository.getAllMessagesRepo();
            for(let i = 0; i < result.length; i++){
                if(result[i].message_type === 1){
                    result[i].message = await this.minioService.getFileTempLink(null, result[i].message, null, null);                }            
            }
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async getMessageByIdService(idMessage){
        try {
            let result = await this.repository.getMessageByIdRepo(idMessage);
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async checkAndRenameFile(file, userInfos) {
        let verifFile = this.utilService.checkFile(file);
        if (verifFile !== "ok") return false;
        let newName = this.utilService.changeFilename(userInfos, file);
        this.utilService.renameFile(file, newName);
        return true;
    }

    async postMessageService(data) {
        try {
            let result = false;
            if (data.messageText !== undefined) {
                data.type = 0;
                data.message = data.messageText;
                result = await this.repository.postMessageRepo(data);
            }

            if (data.messageFile !== undefined && data.messageFile.length > 0) {
                data.messageFile = data.messageFile[0];
                let result = await this.checkAndRenameFile(data.messageFile, data.user);
                if (result === false) return { error: "error during checkAndRenameFile" };

                let message = "users-files/user-" + data.user.userId + "/webchat/message-" +data.user.userId+"/"+data.messageFile.filename;
                message = message.replaceAll(" ", "-");
                this.minioService.putFile(null, message, data.messageFile.path, data.messageFile);
                data.message = message;
                data.type = 1;
                const resultAddFile = await this.repository.postMessageRepo(data);
                if (!resultAddFile.insertId) {
                    this.utilService.deleteFiles(data.messageFile);
                    return { error: "erreur" };
                }
                this.utilService.deleteFiles(data.messageFile);
                return { message: "Message envoyé avec succès !" };  
            }
            if(result.insertId){
                return { message: "Message envoyé avec succès !" };  
            }
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

    async addFormatipostMessageServiceonService(data){
        try {
            await this.repository.postFormation(data);
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }


    async deleteMessageService(idMessage){
        try {
            const resMessage = await this.getMessageByIdService(idMessage)
            if(resMessage.length === 0){
                return { error: "Ce message n'existe pas !" };
            }
            if(resMessage[0].status === 0){
                return { error: "Ce message est déjà supprimé !" };
            }
            let result = await this.repository.deleteMessageRepo(idMessage);
            console.log(result)
            return result;
        } catch (error) {
            console.log(error);
            return {error: "Erreur"};
        }
    }

}

module.exports = WebchatService;