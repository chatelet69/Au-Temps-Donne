const express                   = require('express');
const router                    = express.Router();
const UserController            = require("../controller/UserController");
const authMiddleware            = require("../middlewares/authMiddleware");
const authAdminMiddleware       = require("../middlewares/authAdminMiddleware");
const userController            = new UserController();

// GET

router.get("/users", [authMiddleware, authAdminMiddleware], (req, res) => {
    userController.getAllUsers(req, res);
});

router.get("/users/:id", [authMiddleware, authAdminMiddleware], (req, res) => {
    userController.getUserById(req, res, false);
});

router.get("/users/:id/full", [authMiddleware, authAdminMiddleware], (req, res) => {
    userController.getUserById(req, res, true);
});

router.get("/users/:id/files", [authMiddleware], (req,res) => {
    userController.getUserFiles(req, res);
});

router.get("/users/:id/file", [authMiddleware], userController.getUserFileByName);

router.get("/api/me", [authMiddleware], (req, res) => {
    userController.myUser(req, res);
});

//router.get("/logout", [authMiddleware], userController.logout);

router.get("/users/isUsernameExist/:username", (req, res) => {
    userController.searchUsername(req, res)
});

router.get("/users/isEmailExist/:email", (req, res) => {
    userController.searchEmail(req, res)
});

router.use("/users/search/by", [authMiddleware, authAdminMiddleware], userController.search);

router.get("/users/:id/pfp", [authMiddleware], userController.getUserPfp);

// POST

router.post("/users/create", [authMiddleware, authAdminMiddleware], userController.createUser);

router.post("/register", userController.register);

router.post("/login", userController.authLogin);

router.post("/users/:id/file", [authMiddleware], userController.editUserFile);

router.post("/askForgotPassCode", userController.sendForgotPassCode);

router.post("/resetPassword", userController.resetPassword);

// DELETE

router.delete("/users/:id", [authMiddleware], userController.deleteUser);

router.delete("/users/:id/pfp", [authMiddleware], userController.deleteUserPfp);

// PATCH

router.patch("/users/:id", [authMiddleware], userController.patchUser);

module.exports = router;