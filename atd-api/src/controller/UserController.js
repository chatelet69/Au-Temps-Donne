const UserService   = require("../services/UserService");
const form          = require("../utils/form.json");
const userService   = new UserService();
const { 
    sameSiteValue,
    secureValue,
    hostUrl,
    originUrl,
    maxAgeInHours 
}                   = require("../../config.json");

class UserController {
    async authLogin(req, res) {
        try {
            const { username, password } = req.body;
            const isBackOffice = req.body.backOffice;
            if (username !== undefined && password !== undefined) {
                const resLogin = await userService.authLoginService(username, password, isBackOffice);
                if (resLogin) {
                    res.status(200).cookie("atdCookie", resLogin, {
                        httpOnly: false, 
                        maxAge: (10000*360*maxAgeInHours), 
                        sameSite: sameSiteValue,
                        domain: originUrl.includes(req.get("origin")) ? '.'+hostUrl : "localhost",
                        secure: secureValue,
                        path: "/"
                    });
                    return res.json({message: "success", jwt: resLogin});
                }
            }
            res.status(403).json({error: "Impossible de se connecter avec ces identifiants"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la connexion"});
        }
    }

    async myUser(req, res) {
        try {
            const userId = req.user.userId;
            const userData = await userService.myUserService(userId);
            if (userData && userData.id) res.status(200).json(userData);
            else res.status(404).json({ error: "user_not_found" });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération du user"});
        }
    }

    async getAllUsers(req, res) {
        try {
            const filter = req.query.filter;
            const usersData = await userService.getAllUsersService(filter);
            res.status(200).json({count: usersData.length, users: usersData});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération des utilisateurs"});
        }
    }

    async getUserById(req, res, isFull) {
        try {
            const userId = req.params.id;
            //const isFull = (req.path.indexOf("/full") !== -1) ? true : false;
            const userData = await userService.getUserService(userId, isFull);
            if (!userData.error) res.status(200).json(userData);    // Si l'utilisateur existe
            else res.status(404).json({error: userData.error});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la récupération du user"});
        }
    }

    async register(req, res) {
        try {
            const registerData = req.body;
            const resRegister = await userService.registerService(registerData);
            if (resRegister && !resRegister.error) res.status(200).json({message: "success", jwt: resRegister});
            else res.status(400).json({error: "Erreur durant l'inscription (Utilisateur existant ou mauvaises données)"});
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant l'inscription"});
        }
    }

    async createUser(req, res) {
        try {
            const userData = req.body;
            const resCreatedUser = await userService.createUser(userData);
            if (resCreatedUser && !resCreatedUser.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resCreatedUser.error });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Erreur durant la création" });
        }
    }

    async search(req, res) {
        try {
            const data = req.query;
            if (Object.keys(data).length) {     // Renvoit un tableau des clés de l'objet, dont on récupère la taille
                const resData = await userService.search(data);
                res.status(200).json({ users: resData, count: resData.length });
            } else {
                res.status(400).json({error: "Paramètres de recherche manquants"});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la recherche"});
        }
    }

    async deleteUser(req, res) {
        try {
            const userIdDelete = req.params.id;
            const authUser = req.user;
            const resService = await userService.deleteUserService(userIdDelete, authUser);
            if (resService && resService.error === undefined) res.status(200).json({message: "Suppression validée avec succès"});
            else res.status(400).json({error: (resService.error) ? resService.error : form.errorDuringDelete });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la suppression"});
        }
    }

    async patchUser(req, res) {
        try {
            const data = {
                userIdReq: req.user.userId,
                userId: req.params.id,
                body: req.body,
                isAdmin: req.user.isAdmin
            };
            const check = await userService.getUserService(data.userId, false);
            if (check.id) { // Check si l'user existe
                let result = await userService.patchUserById(data.userId, data);
                if (result.message) res.status(200).json({message: "Modification réalisée avec succès !"});
                else res.status(400).json({error: result.error});
            } else {
                res.status(404).json({error: form.userNotFound});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Une erreur est survenue durant la modification de l'utilisateur."});
        }
    }

    async getUserFiles(req, res) {
        try {
            const userId = req.params.id;
            const userFiles = await userService.getUserFilesService(userId);
            if (userFiles && !userFiles.error) res.status(200).json({ count: userFiles.length, files: userFiles });
            else res.status(404).json({ error: "No User files found "});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération des fichiers" });
        }
    }

    async getUserFileByName(req, res) {
        try {
            const userId = req.params.id;
            const filename = req.query.filename;

            const fileLink = await userService.getUserFile(userId, filename);
            if (fileLink && !fileLink.error) res.status(200).json({ fileLink: fileLink });
            else res.status(404).json({ error: fileLink.error });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération du fichier" });
        }
    }

    async editUserFile(req, res) {
        try {
            const userId = req.params.id;
            const file = (req.files && req.files.length > 0) ? req.files[0] : null;
            const fileType = (file) ? file.fieldname : null;

            const fileLink = await userService.editUserFileService(userId, file, fileType);
            if (fileLink && !fileLink.error) res.status(200).json({ fileLink: fileLink });
            else res.status(404).json({ error: "Une erreur est survenue durant l'importation du fichier" });
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant l'importation du fichier" });
        }
    }

    async searchUsername(req, res){
        try {
            const username = req.params.username;
            let isUsernameExist = await userService.searchUsernameService(username);
            res.status(200).json({ usernameExist:  isUsernameExist});
        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération du username" });
        }
    }

    async searchEmail(req, res) {
        try {
            const email = req.params.email;
            const isEmailExist = await userService.searchEmailService(email);
            res.status(200).json({ emailExist: isEmailExist });
        } catch (error) {
            console.log("Error at @searchEmail : ", error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération du email" });
        }
    }

    async getUserPfp(req, res) {
        try {
            const userId = req.params.id;
            const userPfp = await userService.getUserPfpService(userId);
            if (userPfp && !userPfp.error) res.status(200).json({ userPfp: userPfp });
            else res.status(500).json({ error: userPfp.error });
        } catch (error) {
            console.log("Error at @getUserPfp : ", error);
            res.status(500).json({ error: "Une erreur est survenue durant la récupération de la photo de profil" });
        }
    }

    async deleteUserPfp(req, res) {
        try {
            const userId = req.params.id;
            const resService = await userService.deleteUserPfpService(userId);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resService.error });
        } catch (error) {
            console.log("Error at @deleteUserPfp : ", error);
            res.status(500).json({ error: "Une erreur est survenue durant la suppression de la photo de profil" });
        }
    }

    async sendForgotPassCode(req, res) {
        try {
            const login = req.body.email;
            const resService = await userService.sendForgotPassCodeService(login);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resService.error });
        } catch (error) {
            console.log("Error at @deleteUserPfp : ", error);
            res.status(500).json({ error: "Une erreur est survenue l'envoi du code" });
        }
    }

    async resetPassword(req, res) {
        try {
            const { email, password, code } = req.body;
            const resService = await userService.resetPasswordService(email, password, code);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(400).json({ error: resService.error });
        } catch (error) {
            console.log("Error at @deleteUserPfp : ", error);
            res.status(500).json({ error: "Une erreur est survenue durant le reset du mot de passe" });
        }
    }
}

module.exports = UserController;