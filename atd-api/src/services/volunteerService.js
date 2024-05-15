const VolunteerRepo     = require("../repository/volunteerRepo");
const baseUrl           = require("../../config.json").baseUrl;
const form              = require("../utils/form.json");
const sha512            = require('js-sha512');
const UtilService       = require("./UtilService");
const UserRepository    = require("../repository/UserRepository");
const EventRepository   = require("../repository/EventRepository");
const utilService       = new UtilService();
const moment            = require("moment");
const MinIOService      = require("./MinIOService");
const defaultBucketName = require("../../config.json").defaultBucketName;
const fs                = require("fs");

class VolunteerService {
    repository;
    userRepository;
    eventRepository;
    minIOService;

    constructor() {
        this.repository = new VolunteerRepo();
        this.userRepository = new UserRepository();
        this.eventRepository = new EventRepository();
        this.minIOService = new MinIOService();
    }

    async createApplicationService(data, files) {
        try {
            let userData = utilService.separateDataByParams(data, form.requiredAndAuthorizedUserData);
            if (utilService.checkKeysInData(userData, form.requiredAndAuthorizedUserData, form.requiredAndAuthorizedUserData) === false) return "Des paramètres sont manquants ou sont faux 1";
            let salt = utilService.createSalt();
            let hash = sha512(salt + userData.password + salt);
            userData.password = hash;
            userData.pass_salt = salt;
            
            utilService.encodeData(userData);
            if(userData && userData.email){
                const res = await this.userRepository.getUserByEmail(userData.email);
                if(res && res[0] && res[0].email != undefined){
                    this.deleteFiles(files);
                    return "Erreur, données déjà existantes"
                } 
            }else{
                this.deleteFiles(files);
                return "Email manquant"
            }
            let id = await this.repository.createUserDb(userData);
            if (id && id[0] && id[0].id) {
                id = id[0].id;
            }else {
                this.deleteFiles(files);
                return "Erreur lors de la création du compte";
            }
            
            let licenses = utilService.separateDataByParams(data, form.authorizedLicenses);
            if (utilService.checkKeysInData(licenses, null, form.authorizedLicenses) === false) return "Des paramètres sont manquants ou sont faux 2";
            let applicationData = utilService.separateDataByParams(data, form.authorizedApplicationData);
            for (var f in files) {
                let verifFile = utilService.checkFile(files[f]);
                if (verifFile !== "ok") return verifFile;
                let newName = utilService.changeFilename(userData, files[f]);
                utilService.renameFile(files[f], newName);
                let minIoPath = "users-files/user-" + id + "/" + files[f].filename;
                if (files[f].fieldname == "cv" || files[f].fieldname == "motivation_letter" || files[f].fieldname == "criminal_record") applicationData[files[f].fieldname] = minIoPath;
            }
            if (applicationData.cv == ""){
                this.userRepository.deleteUserById(id);
                this.deleteFiles(files);
                return "CV manquant";
            } 
            if (applicationData.criminal_record == ""){
                this.userRepository.deleteUserById(id);
                this.deleteFiles(files);
                return "Casier judiciaire manquant";
            } 

            if (utilService.checkKeysInData(applicationData, form.requiredApplicationData, form.authorizedApplicationData) === false){
                console.log(applicationData)
                this.userRepository.deleteUserById(id);
                this.deleteFiles(files);
                return "Des paramètres sont manquants ou sont faux 3";
            } 
            applicationData.user_id_fk = id;
            
            utilService.encodeData(licenses);
            utilService.encodeData(applicationData);


            licenses.user_id_fk = id;
            await this.repository.createLicensesDb(licenses);
            await this.repository.createApplicationDb(applicationData);
            this.putMinIoFiles(files, id);
            return "ok";
        } catch (error) {
            this.deleteFiles(files);
            console.log(error);
            return "Erreur, données déjà existantes";
        }
    }

    deleteFiles(files) {
        try {
          setTimeout(() => {
            for (var f in files) {
              if(fs.existsSync(files[f].path)){
                fs.unlinkSync(files[f].path);
              }
            }
          }, "3000");
        } catch (error) {
          console.log(error)
        }
      }
    
      putMinIoFiles(files, id) {
        for (var f in files) {
          let minIoPath = "users-files/user-" + id + "/" + files[f].filename;
          if (
            files[f].fieldname == "cv" ||
            files[f].fieldname == "motivation_letter" ||
            files[f].fieldname == "criminal_record"
          ) {
            this.minIOService.putFile(
              defaultBucketName,
              minIoPath,
              files[f].path,
              files[f]
            );
          }
        }
        this.deleteFiles(files);
      }

    async changeApplicationService(userInfos, idApplication, newStatus, newRank) {
        try {
            let formations = await this.repository.getFormationsById(userInfos.userId);
            if ((formations && formations.recruitement == 1) || userInfos.rank>4) {
                let verifVolunteerApplicationStatus = await this.repository.getVolunteerApplicationById(idApplication);
                console.log(verifVolunteerApplicationStatus)
                if(!verifVolunteerApplicationStatus || verifVolunteerApplicationStatus.length==0) return "Mauvais Id";
                let statusCandid = verifVolunteerApplicationStatus[0].status;
                if (statusCandid == 0) {
                    await this.repository.changeApplicationStatus(idApplication, newStatus);    //status application : 0 = en attente, 1 = validé, 2 = refusé
                    let userId = await this.repository.getUserIdByApplication(idApplication);
                    userId = userId[0].user_id_fk;
                    await this.repository.changeRankUser(userId, newRank);
                    if(newStatus == 1) await this.repository.setFormationById(userId);
                    return "ok";
                } else {
                    return "La candidature a déjà été traitée";
                }
            } else {
                return form.volunteerApplicationError;
            }
        } catch (error) {
            console.log(error);
            return form.volunteerApplicationError;
        }
    }

    async addNewDisponibilityService(volunteerId, data) {
        try {
            let res = { error: "Erreur" };
            if (volunteerId != 0) {
                let checkType = false;
                const checkDates = await this.repository.getDisponibilitiesByVolunteerDateDb(volunteerId, data.startDate, data.endDate);
                if (checkDates && checkDates.length > 0) return { error: "Dates déjà réservées ou dépassées" };

                let checkPast = this.checkDispoDatesPast(data.startDate, data.endDate);
                if (checkPast !== true) return checkPast;

                if (data.description.length > 255 && data.description.length == 0) return { error: form.tooHighLengthString };

                if (data.disponibility_type === "disponibility") {
                    const closeStartDate = moment(data.endDate).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");
                    const closeEndDate = moment(data.startDate).add(-30, "minutes").format("YYYY-MM-DD HH:mm:ss");
                    let checkClosesDispoDates = await this.repository.getClosesDispoDates(volunteerId, data.startDate, 
                                                                                          closeStartDate, data.startDate, closeEndDate);
                    if (checkClosesDispoDates && checkClosesDispoDates.length <= 2) {
                        checkClosesDispoDates.forEach(async (closeDate) => {
                            if (closeDate.datetime_end >= closeEndDate && closeDate.datetime_end <= data.startDate) {
                                data.startDate = closeDate.datetime_start;
                            } else if (closeDate.datetime_start <= closeStartDate && closeDate.datetime_start >= data.endDate) {
                                data.endDate = closeDate.datetime_end;
                            }
                            await this.repository.deleteDisponibilityByIdDb(volunteerId, closeDate.id);
                        });
                    }
                    data.type = 1;
                } else {
                    const planningTypes = await this.eventRepository.getAllEventTypesDb();
                    for (let i = 0; i < planningTypes.length; i++) {
                        if (planningTypes[i].name === data.type) {
                            checkType = true;
                            data.type = 0;
                            break;
                        }
                    }
                    if (!checkType) return { error: form.missingOrBadData };
                }

                res = await this.repository.addNewDisponibilityDb(volunteerId, data.startDate, data.endDate, data.description, data.type, null);
                if (res.insertId != 0) res = true;
            }
            return res;
        } catch (error) {
            console.log(error);
            return { error: form.errorAddDispo };
        }
    }

    async getAllPlanningOfDayService(query, datesObjectLength) {
        try {
            let dispos = null;
            if ((query.startDate && !query.endDate) || (query.endDate && !query.startDate))
                return { error: "Une des deux dates est manquante" };

            let userId = (query.userId) ? Number.parseInt(query.userId) : null;
            if (query.startDate && query.endDate && datesObjectLength >= 2) {
                dispos = await this.repository.getAllPlanningOfDayDb(query.startDate, query.endDate, userId);
            } else {
                dispos = await this.repository.getAllPlanningOfDayDb(null, null, userId);
            }
            return (dispos !== null) ? dispos : { error: form.errorGetDisposOfDay };
        } catch (error) {
            console.log(error);
            return { error: "Erreur" };
        }
    }

    async getNextDispoByVolunteerService(volunteerId) {
        try {
            let dispos = null;
            if (volunteerId !== 0) {
                const volunteer = await this.userRepository.getUserById(volunteerId);
                if (volunteer && volunteer.rank >= form.ranks.volunteer)
                    dispos = await this.repository.getNextDisponibilitiesByVolunteerDb(volunteerId);
                else return { error: "Cet utilisateur n'est pas un bénévole" };
            }
            return (dispos !== null) ? dispos : { error: "Erreur durant la récupération des disponibilités" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur" };
        }
    }

    async getAllMessagesService() {
        try {
            let messages = await this.repository.getAllMessagesDb();
            messages.forEach(element => { element.message_content = decodeURI(element.message_content); });
            return messages;
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la récupération des messages" };
        }
    }

    async sendMessageService(data) {
        try {
            let resCheck = false;
            const check = utilService.checkMessageData(data);
            if (check && !check.error) {
                if (check.message !== null) resCheck = await this.repository.sendMessageDb(data.authorId, check.message, 1);
                if (check.filePath !== null) {
                    utilService.renameFile(data.file, check.filePath);
                    resCheck = await this.repository.sendMessageDb(data.authorId, check.filePath, 2);
                }
            } else {
                return check;
            }

            return resCheck;
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant l'envoi du message" };
        }
    }

    async deleteDisponibilityByIdService(volunteerId, dispoId) {
        try {
            let resDb = await this.repository.deleteDisponibilityByIdDb(volunteerId, dispoId);
            if (resDb.affectedRows > 0) return true;
            else return { error: "Suppression impossible (Disponibilité inexistante ou droit insuffisant)" }
        } catch (error) {
            console.log(error);
            return { error: "Erreur" };
        }
    }

    async deleteMessageByIdService(volunteerId, messageId) {
        try {
            let checkMessage = await this.repository.getMessageById(messageId);
            if (checkMessage && checkMessage.authorId == volunteerId) {
                if (checkMessage.message_type === form.messageTypes.file) utilService.deleteFile(checkMessage.message_content);
                let resDb = await this.repository.deleteMessageByIdDb(volunteerId, messageId);
                if (resDb.affectedRows > 0) return true;
            }

            return { error: "Suppression impossible (Message inexistant ou droit insuffisant)" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur" };
        }
    }

    async getAllVolunteersService() {
        try {
            const data = await this.repository.getAllVolunteersDb();
            if (data) return data;
            else return { error: "Erreur de récupération en base de données" };
        } catch (error) {
            console.log(error);
            return { error: "Erreur" };
        }
    }

    checkDispoDatesPast(startDate, endDate) {
        try {
            let startDateFormatted = utilService.formatDateToMoment(startDate, true, true);
            let endDateFormatted = utilService.formatDateToMoment(endDate, true, true);
            let checkPast = utilService.checkDatesPast(startDateFormatted, endDateFormatted);
            if (checkPast !== true) return checkPast;
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getApplicationByIdService(userInfos, idApplication) {
        try {
            if (idApplication > 0 && userInfos) {
                let result = await this.repository.getVolunteerApplicationById(idApplication);
                if(result == undefined) return false;
                result = utilService.decodeData(result[0]);
                if (result.id == userInfos.userId) return result;
    
                if (userInfos.rank > 2) {
                    let formations = await this.repository.getFormationsById(userInfos.userId);
                    if ((formations && formations.recruitement == 1) || userInfos.rank>4) {
                        return result;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async deleteApplicationByIdService(userInfos, idApplication) {
        try {
            if (idApplication > 0 && userInfos) {
                let result = await this.repository.getVolunteerApplicationById(idApplication);
                if (result[0].id) {
                    if (result[0].user_id_fk == userInfos.userId) {
                        await this.repository.deleteVolunteerApplicationById(idApplication);
                        return "ok";
                    }
    
                    if (userInfos.rank > 2) {
                        let formations = await this.repository.getFormationsById(userInfos.userId);
                        if ((formations && formations.recruitement == 1) || userInfos.rank>4) {
                            await this.repository.deleteVolunteerApplicationById(idApplication);
                            return "ok";
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async updateApplicationByIdService(userInfos, userId, body, files){
        try {
            if(userId > 0){
                let result = await this.repository.getApplicationByUserId(userId);
                if (result[0].id) {
                    if (result[0].userId == userInfos.userId) {
                        body = utilService.encodeData(body);
                        let paramsUpdated = utilService.separateDataByParams(body, form.authorizedApplicationData);
                        if(files){
                            let nameLastname = await this.userRepository.getUserById(userInfos.userId);
                            userInfos.name = nameLastname.name;
                            userInfos.lastname = nameLastname.lastname;
                            for (var f in files) {
                                let verifFile = utilService.checkFile(files[f]);
                                if (verifFile !== "ok") return false;
                                let newName = utilService.changeFilename(userInfos, files[f]);
                                utilService.renameFile(files[f], newName)
                                let minIoPath = "users-files/user-" + userId + "/" + files[f].filename;
                                if (files[f].fieldname == "cv" || files[f].fieldname == "motivation_letter" || files[f].fieldname == "criminal_record"){
                                    await this.minIOService.deleteUserFolderByName(defaultBucketName, result[0][files[f].fieldname]);
                                    paramsUpdated[files[f].fieldname] = minIoPath;
                                } 
                            }
                        }
                        if(files){
                            this.putMinIoFiles(files, userId);
                        }
                        result = await this.repository.updateApplicationByUserId(userId, paramsUpdated);
                        console.log(paramsUpdated)
                        return "ok";
                    }else{
                        return false;
                    }
                }else{
                    return false;
                }
            }else{
                return false;
            }
        } catch (error) {
            console.log(error)
            return false;
        }
    }

    async getAllApplicationsService(userInfos){
        try {
            const formations = await this.repository.getFormationsById(userInfos.userId);
            if((formations && formations.recruitement == 1) || userInfos.rank>4){
                let res = await this.repository.getAllUsersApplicationsRepository();
                if(res.length == 0){
                    return "Il n'y a pas de candidatures disponibles...";
                }else{
                    for (let i = 0; i < res.length; i++) {
                        res[i] = utilService.decodeData(res[i]);
                    }
                    return res;
                }
            }else{
                return false;
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }
    
    async getApplicationsByStatusService(params, userInfos){
        try {
            const formations = await this.repository.getFormationsById(userInfos.userId);
            if(params.status){
                if((formations && formations.recruitement == 1) || userInfos.rank>4){
                    let res = await this.repository.getApplicationsByStatusRepository(params.status);
                    if(res.length == 0){
                        return "noCandid";
                    }else{
                        for (let i = 0; i < res.length; i++) {
                            res[i] = utilService.decodeData(res[i]);
                        }
                        return res;
                    }
                }else{
                    return false;
                }
            }else{
                return false;
            }
        } catch (error) {
            console.log(error)
            return false
        }
    }

    async getFormationsByIdService(params, rank, userId){
        try {
            if(params.id > 0){
                if(rank > 2){
                    const formations = await this.repository.getFormationsById(userId);
                    return formations;
                }
            }else{
                return false;
            }
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getLastVolunteerApplications(amount) {
        try {
            if (Number.isNaN(amount)) amount = 3;
            else amount = (Number.parseInt(amount) < 3 || Number.parseInt(amount) > 12 ) ? 3 : Number.parseInt(amount);

            const data = await this.repository.getLastVolunteerApplications(amount);
            if (data) return data;
            else return false;
        } catch (error) {
            console.log("Error at @getLastVolunteerApplications : ", error);
            return false;
        }
    }

    async getPlanningByService(userId, filters) {
        try {
            for (let key in filters) {
                if (!form.planningFiltersKeys.includes(key)) return { error: "unauthorized key" };
                filters[key] = "%"+filters[key]+"%";
            }

            const planningFiltered = await this.repository.searchUserPlanningByDb(userId, filters);
            return planningFiltered;
        } catch (error) {
            console.log("Error at @getPlanningByService : ", error);
            return { error: "Erreur durant la récupération du planning" };
        }
    }

    async editDisponibilityService(userId, planningId, data) {
        try {
            let res = { error: form.errorEditPlanning };
            if (userId !== 0) {
                const planningElement = await this.repository.getPlanningElementById(userId, planningId);
                if (!planningElement.id) return res;

                let checkProcess = await this.midProcessDisponibility(userId, data);
                if (checkProcess.error) return checkProcess;
                data = checkProcess;

                await this.repository.deleteDisponibilityByIdDb(userId, planningId);
                res = await this.repository.addNewDisponibilityDb(userId, data.startDate, data.endDate, data.description, data.type, null);
                if (res.insertId != 0) res = true;
            }
            return res;
        } catch (error) {
            console.log(error);
            return { error: form.errorAddDispo };
        }
    }

    async midProcessDisponibility(userId, data) {
        let checkType = false;
        const checkDates = await this.repository.getDisponibilitiesByVolunteerDateDb(userId, data.startDate, data.endDate);
        data.type = (data.disponibility_type === "disponibility") ? 1 : 0;

        if (checkDates && checkDates.length > 0) {
            if (data.disponibility_type === "disponibility") {
                const closeStartDate = moment(data.endDate).add(30, "minutes").format("YYYY-MM-DD HH:mm:ss");
                const closeEndDate = moment(data.startDate).add(-30, "minutes").format("YYYY-MM-DD HH:mm:ss");
                let checkClosesDispoDates = await this.repository.getClosesDispoDates(userId, data.startDate, 
                                                                                      closeStartDate, data.startDate, closeEndDate);
                if (checkClosesDispoDates && checkClosesDispoDates.length <= 2) {
                    checkClosesDispoDates.forEach(async (closeDate) => {
                        if (closeDate.datetime_end >= closeEndDate && closeDate.datetime_end <= data.startDate) {
                            data.startDate = closeDate.datetime_start;
                        } else if (closeDate.datetime_start <= closeStartDate && closeDate.datetime_start >= data.endDate) {
                            data.endDate = closeDate.datetime_end;
                        }
                        await this.repository.deleteDisponibilityByIdDb(userId, closeDate.id);
                    });
                }
                data.type = 1;
            } else return { error: "Dates déjà réservées ou dépassées" };
        }

        let checkPast = this.checkDispoDatesPast(data.startDate, data.endDate);
        if (checkPast !== true) return checkPast;

        if (data.description.length > 255 && data.description.length == 0) return { error: form.tooHighLengthString };

        if (data.disponibility_type === "activity") {
            const planningTypes = await this.eventRepository.getAllEventTypesDb();
            for (let i = 0; i < planningTypes.length; i++) {
                if (planningTypes[i].name === data.type) {
                    checkType = true;
                    data.type = 0;
                    break;
                }
            }
            if (!checkType) return { error: form.missingOrBadData };
        }

        return data;
    }

    async getApplicationByUserIdService(userId) {
        try {
            const data = await this.repository.getApplicationByUserId(userId)
            if(data.length>0) return data;
            else return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getPlanningElementService(userId, planningId) {
        try {
            const planning = await this.repository.getPlanningElementById(userId, planningId);
            if (planning !== undefined) return planning;
            else return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

module.exports = VolunteerService;