const UserRepository        = require("../repository/UserRepository");
const sha512                = require('js-sha512');
const jwt                   = require("jsonwebtoken");
const secret                = require("../../config.json").secretJwt;
const baseUrl               = require("../../config.json").baseUrl;
const maxAgeInHours         = require("../../config.json").maxAgeInHours;
const form                  = require("../utils/form.json");
const UtilService           = require("./UtilService");
const utilService           = new UtilService();
const MinIOService          = require("../services/MinIOService");
const VolunteerRepo         = require("../repository/volunteerRepo");
const EmailService          = require("./EmailService");
const minIoService          = new MinIOService();
const volunteerRepo         = new VolunteerRepo();

class UserService {
    userRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }

    async authLoginService(login, password, isBackOffice) {
        try {
            let authToken = false;
            const checkSalt = await this.userRepository.getSaltByLogin(login);
            if (checkSalt) {
                const hash = sha512(checkSalt.salt + password + checkSalt.salt);
                let loggedUser = await this.userRepository.checkLogin(login, hash);
                if (loggedUser.length > 0) {
                    loggedUser = loggedUser[0];

                    if (isBackOffice !== undefined && isBackOffice === "true")
                        if (loggedUser.rank < form.ranks.volunteer) return false;

                    const pfpLink = await minIoService.getUserPfpLink(loggedUser.id, null, (60 * 60) * 128, false);
                    if (pfpLink) loggedUser.pfp = pfpLink;
                    if (loggedUser) {
                        authToken = this.generateKey(loggedUser);
                        this.userRepository.insertLoginLogDb(login, true, null);
                    }
                }
            }
            return (authToken) ? authToken : false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async myUserService(userId) {
        try {
            let userData = false;
            if (userId != 0) userData = await this.userRepository.getFullUserById(userId);
            const pfpLink = await minIoService.getUserPfpLink(userId, null, (60 * 60) * 2, false);
            if (pfpLink) userData.pfp = pfpLink;
            let decodedUserData = utilService.decodeData(userData)
            return decodedUserData;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getAllUsersService(filter) {
        try {
            let usersData = false;
            if (!form.authorizedFilterUsersView.includes(filter)) filter = null;
            else filter = form.filtersViewRank[filter];

            //usersData = await this.userRepository.getAllUsers(filter);
            usersData = await UserRepository.getAllUsers(filter);
            usersData.forEach((user) => {
                for (const key in user) {
                    if (typeof user[key] == "string") user[key] = decodeURI(user[key]);
                }
            });
            return usersData;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async getUserService(userId, needFull) {
        try {
            let userData = false;
            if (needFull) userData = await this.userRepository.getFullUserById(userId);
            else userData = await this.userRepository.getUserById(userId);
            const pfpLink = await minIoService.getUserPfpLink(userId, null, null, false);
            if (userData) {
                if (pfpLink !== null) userData.pfp = pfpLink;
                return userData;
            }
            return { error: form.userNotFound };
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async registerService(registerData) {
        try {
            let returnVal = false;
            if (utilService.checkKeysInData(registerData, form.requiredRegisterKeys, form.requiredRegisterKeys)) {
                const checkUser = await this.userRepository.getUserByUsername(registerData.username);
                if (checkUser && checkUser.id) return { error: "Utilisateur existant" };
                registerData.password = sha512(registerData.password);
                registerData.rank = "user";
                const resDb = await this.userRepository.createUser(registerData);
                if (resDb.affectedRows) {
                    const userData = { id: resDb.insertId, username: registerData.username, rank: 1 }
                    returnVal = this.generateKey(userData);
                }
            }
            return returnVal;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async createUser(userData) {
        try {
            const required = ["username", "password", "name", "lastname", "birthday", "email", "rank"];
            if (utilService.checkKeysInData(userData, required, required)) {
                userData.salt = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
                userData.password = sha512(`${userData.salt}${userData.password}${userData.salt}`);
                const resDb = await this.userRepository.createUserDb(userData);
                if (resDb !== null && resDb.insertId) return true;
                else return { error: "Erreur durant la création" };
            } else {
                return { error: form.missingOrBadData };
            }
        } catch (error) {
            console.log(error);
            return { error: "Erreur durant la création" };
        }
    }

    async search(data) {
        try {
            let returnVal = false;
            if (utilService.checkKeysInData(data, null, form.authorizedKeysSearchUser)) {
                const resDb = await this.userRepository.searchUserBy(data, UserRepository.AND_SEARCH);
                if (resDb) {
                    returnVal = resDb;
                    for (const user in returnVal) returnVal[user].infos = `${baseUrl}/users/${returnVal[user].id}`;
                }
            }
            return (returnVal.length) ? returnVal : { message: form.userNotFound };
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async deleteUserById(userId) {
        try {
            const resDb = await this.userRepository.deleteUserById(userId);
            if (resDb !== null && resDb.affectedRows) return true;
            return false;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    async generateKey(userData) {
        let token = jwt.sign(
            {
                username: userData.username,
                rank: userData.rank,
                userId: userData.id,
                pfp: userData.pfp,
                name: userData.name,
                lastname: userData.lastname,
                lang: userData.language
            },
            secret, { expiresIn: maxAgeInHours + "h" });
        return token;
    }

    async patchUserById(userId, data) {
        try {
            let bodySize = Object.keys(data.body).length;
            if (bodySize > 0) {
                for (const key in data.body)
                    if (!form.userEditKeys.includes(key)) return { error: form.missingOrBadData };

                let checkData = utilService.checkEditUserData(userId, data.body);
                if (checkData.error) return checkData;

                if (data.isAdmin || data.userIdReq == userId && checkData === true) {
                    if (data.body.password || data.body.newPassword !== undefined) {
                        const checkSalt = await this.userRepository.getSaltById(userId);
                        if (checkSalt) {
                            const oldHashPass = sha512(checkSalt.salt + data.body.password + checkSalt.salt);
                            const checkOldPassword = await this.userRepository.checkLoginById(userId, oldHashPass);
                            if (checkOldPassword !== null && checkOldPassword.id !== undefined) {
                                data.body.password = sha512(checkSalt.salt + data.body.newPassword + checkSalt.salt);
                                delete data.body.newPassword;
                            } else return { error: "Mot de passe incorrect" };
                        }
                    }

                    const resDb = await this.userRepository.patchUserByIdDb(userId, data.body);
                    return (resDb.affectedRows) ? { message: "success" } : { error: "Modification impossible" };
                } else {
                    return { error: "Vous n'êtes pas habilité à faire cette action" };
                }
            } else {
                return { error: form.missingOrBadData };
            }
        } catch (error) {
            console.log(error);
            return { error: "Une erreur est survenue durant la modification de l'utilisateur." };
        }
    }

    async getUserFilesService(userId) {
        try {
            if (userId <= 0) return { error: form.errorDuringGet };
            const filesStream = await minIoService.getUserFiles(userId, null, 60 * 30);
            const fileObjects = await minIoService.getObjectsByStream(filesStream);
            if (fileObjects) {
                const finalFiles = [];
                fileObjects.forEach((file) => {
                    const currentFile = {
                        name: file.name,
                        size: file.size,
                        type: file.metadata["content-type"],
                        lastModified: file.lastModified
                    };
                    finalFiles.push(currentFile);
                });
                return finalFiles;
            } else {
                return { error: form.errorDuringGet };
            }
        } catch (error) {
            console.log(error);
            return { error: form.errorDuringGet };
        }
    }

    async getUserFile(userId, filename) {
        try {
            if (userId <= 0) return { error: form.errorDuringGet };
            const fileLink = await minIoService.getFileTempLink(null, filename, 60 * 60, false);
            if (fileLink) return fileLink;
            else return { error: form.errorDuringGet };
        } catch (error) {
            console.log(error);
            return { error: form.errorDuringGet };
        }
    }

    async checkAndRenameFile(file, userInfos) {
        let verifFile = utilService.checkFile(file);
        if (verifFile !== "ok") return false;
        let newName = utilService.changeFilename(userInfos, file);
        utilService.renameFile(file, newName);
        return true;
    }

    async editUserFileService(userId, file, fileType) {
        try {
            userId = Number.parseInt(userId);
            if (isNaN(userId) || userId <= 0) return { error: form.errorDuringGet };

            const user = await this.userRepository.getUserById(userId);
            if (user.id == undefined) return { error: form.userNotFound };

            if (fileType === "pfp") {
                let checkAndRenameRes = await this.checkAndRenameFile(file, user);
                if (checkAndRenameRes === false) return { error: form.errorDuringPost };

                const objectName = "users-pfp/user-" + userId + "-pfp.png";
                minIoService.putFile(null, objectName, file.path, file);
                utilService.deleteFile(file);

                //setTimeout(() => {}, 4000);
                const pfpLink = await minIoService.getUserPfpLink(userId, null, 300, false);
                if (pfpLink !== null) return pfpLink;
            }

            return { error: form.errorDuringPost };
        } catch (error) {
            console.log(error);
            return { error: form.errorDuringPost };
        }
    }

    async searchUsernameService(username) {
        try {
            if (username && username.length > 0) {
                let isUsernameExist = await this.userRepository.searchUsernameRepo(username);
                if (isUsernameExist && isUsernameExist[0] && isUsernameExist[0].username.length > 0) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log("Error at @searchUsernameService :", error);
            return false;
        }
    }

    async searchEmailService(email) {
        try {
            if (email && email.length > 0) {
                let isEmailExist = await this.userRepository.searchEmailRepo(email);
                if (isEmailExist && isEmailExist[0] && isEmailExist[0].email.length > 0) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.log("Error at @searchEmailService :", error);
            return false;
        }
    }

    async getUserPfpService(userId) {
        try {
            userId = Number.parseInt(userId);
            if (isNaN(userId)) return { error: "ID passé incorrect" };

            const user = await this.userRepository.getUserById(userId);
            if (user !== null && user.id !== undefined) {
                const userPfpLink = await minIoService.getUserPfpLink(userId, null, null, false);
                if (userPfpLink !== null) return userPfpLink;
            }

            return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at @getUserPfpService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async deleteUserPfpService(userId) {
        try {
            userId = Number.parseInt(userId);
            if (isNaN(userId)) return { error: "ID passé incorrect" };

            const user = await this.userRepository.getUserById(userId);
            if (user !== null && user.id !== undefined) {
                const checkPfpExist = await minIoService.getUserPfpLink(userId, null, 60, false);
                if (checkPfpExist.includes("default-pfp")) return { error: "Aucune photo de profil trouvée" };

                const pfpPath = "users-pfp/user-" + userId + "-pfp.png";
                await minIoService.deleteUserFolderByName(null, pfpPath, null, false);
                return true;
            }

            return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at @getUserPfpService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async deleteUserService(userIdToDelete, authUser) {
        try {
            userIdToDelete = Number.parseInt(userIdToDelete);
            if (isNaN(userIdToDelete)) return { error: "Id de l'utilisateur incorrect" };

            const formations = await volunteerRepo.getFormationsById(authUser.userId);
            if ((formations && formations.recruitement == 1) || authUser.rank > 4 || userIdToDelete == authUser.userId) {
                const userCheck = await this.userRepository.getUserById(userIdToDelete);
                if (userCheck && userCheck.id && userCheck.rank < authUser.rank) {
                    const userFiles = await minIoService.getUserFiles(userIdToDelete, null);
                    const fileObjects = await minIoService.getObjectsByStream(userFiles);
                    if (fileObjects.length > 0) {
                        fileObjects.forEach(async (file) => {
                            await minIoService.deleteUserFolderByName(null, file.name);
                        })
                    }
                    const resDb = await this.deleteUserById(userIdToDelete);
                    if (resDb) return true; 
                } else {
                    return { error: "Utilisateur introuvable ou permissions manquantes" };
                }
            }
            return { error: form.errorDuringDelete };
        } catch (error) {
            console.log("Error at @deleteUserService :", error);
            return { error: form.errorDuringDelete };
        }
    }

    async sendForgotPassCodeService(login) {
        try {
            let checkUserExist = await this.userRepository.getUserByEmail(login);
            if (checkUserExist.length > 0) {
                checkUserExist = checkUserExist[0];
                const code = Math.floor(Math.random() * (99999 - 10000 + 1) + 10000);
                const resDb = await this.userRepository.insertForgotPassCode(checkUserExist.id, code);
                if (resDb !== null && resDb.affectedRows) {
                    const resEmail = await EmailService.sendCodeVerifMail(login, code);
                    if (resEmail) return true;
                }
            }
            return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at @sendForgotPassCodeService :", error);
            return { error: form.errorDuringGet };
        }
    }

    async resetPasswordService(email, password, code) {
        try {
            if (email === undefined || password === undefined || code === undefined) return { error: form.missingOrBadData };
            if (password.length > 40) return { error: "Mot de passe dépassant la longueur autorisée (40 caractères)" };

            const user = await this.userRepository.getUserByForgotPassCode(email, code);
            if (user !== null && user.id !== undefined) {
                const hash = sha512(user.pass_salt + password + user.pass_salt);
                const resDb = await this.userRepository.patchUserByIdDb(user.id, { password: hash, forget_code: 0 });
                if (resDb !== null && resDb.affectedRows) return true;
            }
            return { error: form.errorDuringPost };
        } catch (error) {
            console.log("Error at @resetPasswordService :", error);
            return { error: form.errorDuringPost };
        }
    }
}

module.exports = UserService;