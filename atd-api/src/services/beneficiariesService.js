const BeneficiariesRepo = require("../repository/beneficiariesRepo");
const baseUrl = require("../../config.json").baseUrl;
const form = require("../utils/form.json");
const sha512 = require("js-sha512");
const UtilService = require("./UtilService");
const utilService = new UtilService();
const VolunteerRepo = require("../repository/volunteerRepo");
const UserRepo = require("../repository/UserRepository");
const MinIOService = require("./MinIOService");
const defaultBucketName = require("../../config.json").defaultBucketName;
const fs = require("fs");

class BeneficiariesService {
  repository;
  volunteerRepo;
  userRepo;
  minIOService;

  constructor() {
    this.repository = new BeneficiariesRepo();
    this.volunteerRepo = new VolunteerRepo();
    this.userRepo = new UserRepo();
    this.minIOService = new MinIOService();
  }

  async createBeneficiary(data, files) {
    try {
      let userData = utilService.separateDataByParams(
        data,
        form.authorizedBeneficiariesData
      );
      if (
        utilService.checkKeysInData(
          userData,
          form.requiredBeneficiariesData,
          form.authorizedBeneficiariesData
        ) === false
      ) {
        this.deleteFiles(files);
        return "Des paramètres sont manquants ou sont faux 1";
      }
      let salt = utilService.createSalt();
      let hash = sha512(salt + userData.password + salt);
      userData.password = hash;
      userData.pass_salt = salt;

      utilService.encodeData(userData);
      if (userData.email) {
        const res = await this.userRepo.getUserByEmail(userData.email);
        if (res && res[0] && res[0].email) {
          this.deleteFiles(files);
          return "Erreur, données déjà existantes";
        }
      } else if (userData.username) {
        const res = await this.userRepo.getUserByUsername(userData.username);
        if (res && res.username) {
          this.deleteFiles(files);
          return "Erreur, données déjà existantes";
        }
      }

      let id = await this.volunteerRepo.createUserDb(userData);
      if (id && id[0] && id[0].id) {
        id = id[0].id;
      } else {
        this.deleteFiles(files);
        return "Erreur lors de la création du compte";
      }
      let applicationData = utilService.separateDataByParams(
        files,
        form.authorizedBeneficiaryApplicationData
      );
      applicationData.reason_application = data.reason_application;

      for (var f in files) {
        let verifFile = utilService.checkFile(files[f]);
        if (verifFile !== "ok") {
          this.userRepo.deleteUserById(id);
          this.deleteFiles(files);
          return verifFile;
        }
        let newName = utilService.changeFilename(userData, files[f]);
        utilService.renameFile(files[f], newName);
        let minIoPath = "users-files/user-" + id + "/" + files[f].filename;
        if (
          files[f].fieldname == "debts_proof" ||
          files[f].fieldname == "home_proof" ||
          files[f].fieldname == "payslip" ||
          files[f].fieldname == "situation_proof"
        ) {
          applicationData[files[f].fieldname] = minIoPath;
        }
      }

      if (
        utilService.checkKeysInData(
          applicationData,
          form.requiredBeneficiaryApplicationData,
          form.authorizedBeneficiaryApplicationData
        ) === false
      ) {
        this.userRepo.deleteUserById(id);
        this.deleteFiles(files);
        this.minIOService.deleteUserFolderByName(
          defaultBucketName,
          "users-files/user-" + id
        );
        return "Des paramètres sont manquants ou sont faux";
      }

      utilService.encodeData(applicationData);
      applicationData.user_id_fk = id;
      await this.repository.createBeneficiaryApplicationDb(applicationData);
      this.putMinIoFiles(files, id);
      return "ok";
    } catch (error) {
      this.deleteFiles(files);
      console.log(error);
      return "Une erreur est survenue lors de la création de votre candidature";
    }
  }

  deleteFiles(files) {
    try {
      setTimeout(() => {
        for (var f in files) {
          if (fs.existsSync(files[f].path)) {
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
        files[f].fieldname == "debts_proof" ||
        files[f].fieldname == "home_proof" ||
        files[f].fieldname == "payslip" ||
        files[f].fieldname == "situation_proof"
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

  async getAllBeneficiariesApplicationsService(userInfo) {
    try {
      const formations = await this.volunteerRepo.getFormationsById(
        userInfo.userId
      );
      if ((formations && formations.recruitement == 1) || userInfo.rank > 4) {
        let res =
          await this.repository.getAllBeneficiariesApplicationsRepository();
        if (res.length == 0) {
          return "noCandid";
        } else {
          for (let i = 0; i < res.length; i++) {
            res[i] = utilService.decodeData(res[i]);
          }
          return res;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async changeBeneficiaryApplicationService(
    userInfos,
    idApplication,
    newStatus,
    newRank
  ) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      if ((formations && formations.recruitement == 1) || userInfos.rank > 4) {
        let verifApplicationStatus =
          await this.repository.getBeneficiaryApplicationById(idApplication);
        console.log("APP : " + verifApplicationStatus[0]);
        if (verifApplicationStatus[0].status == 0) {
          await this.repository.changeBeneficiaryApplicationStatus(
            idApplication,
            newStatus
          ); //status application : 0 = en attente, 1 = validé, 2 = refusé
          let userId = verifApplicationStatus[0].userId;
          await this.volunteerRepo.changeRankUser(userId, newRank);
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

  async getBeneficiaryApplicationByUserIdService(userInfos, beneficiaryId) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      let beneficiaryApplication =
        await this.repository.getBeneficiaryApplicationByUserId(
          beneficiaryId
        );
        let decodedInfos = utilService.decodeData(beneficiaryApplication[0]);
      if ((formations && formations.recruitement == 1) || userInfos.rank > 4 || (decodedInfos.userId == userInfos.userId)) {
        return decodedInfos;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getFileByNameService(userInfos, filename) {
    try {
      let formations = await this.volunteerRepo.getFormationsById(
        userInfos.userId
      );
      let ownerFileId = filename.split("/")[1];
      ownerFileId = ownerFileId.split("-")[1];
      if ((formations && formations.recruitement == 1) || userInfos.rank > 4 || userInfos.userId == ownerFileId) {
        let link = await this.minIOService.getFileTempLink(defaultBucketName, filename, null, null);
        if (link == null) return false;
        return link;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateBeneficiaryApplicationByIdService(userInfos, userId, body, files){
    try {
      console.log(userInfos, userId, body, files)
        if(userId > 0){
            let result = await this.repository.getBeneficiaryApplicationByUserId(userId);
            if (result[0].id) {
                if (result[0].userId == userInfos.userId) {
                    body = utilService.encodeData(body);
                    let paramsUpdated = utilService.separateDataByParams(body, form.authorizedBeneficiaryApplicationData);
                    if(files){
                        let nameLastname = await this.userRepo.getUserById(userInfos.userId);
                        userInfos.name = nameLastname.name;
                        userInfos.lastname = nameLastname.lastname;
                        for (var f in files) {
                            let verifFile = utilService.checkFile(files[f]);
                            if (verifFile !== "ok") return false;
                            let newName = utilService.changeFilename(userInfos, files[f]);
                            utilService.renameFile(files[f], newName)
                            let minIoPath = "users-files/user-" + userId + "/" + files[f].filename;
                            if (files[f].fieldname == "situation_proof" || files[f].fieldname == "debts_proof" || files[f].fieldname == "home_proof" || files[f].fieldname == "payslip"){
                                await this.minIOService.deleteUserFolderByName(defaultBucketName, result[0][files[f].fieldname]);
                                paramsUpdated[files[f].fieldname] = minIoPath;
                            } 
                        }
                    }
                    if(files){
                        this.putMinIoFiles(files, userId);
                    }
                    result = await this.repository.updateBeneficiaryApplicationByUserId(userId, paramsUpdated);
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
}

module.exports = BeneficiariesService;
