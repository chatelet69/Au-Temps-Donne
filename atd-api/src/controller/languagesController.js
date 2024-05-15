const LanguageService = require("../services/languagesService");

class LanguagesController {
  service;
  constructor() {
    this.service = new LanguageService();
  }

  async getLanguages(req, res) {
    try {
      let languagesList = await this.service.getLanguagesServices();
      if (languagesList && languagesList.length > 0) {
        res.status(200).json({ languages: languagesList });
      } else {
        res.status(400).json({
          error: "Une erreur est survenue durant la récupération des languages",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant la récupération des languages",
      });
    }
  }

  async updateTraductions(req, res) {
    try {
      let result = await this.service.updateTraductionsServices();
      if (result) {
        res.status(200).json({ message: "Les traductions ont été mises à jour !" });
      } else {
        res.status(400).json({
          error: "Une erreur est survenue durant la modification des traductions",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant la modification des traductions",
      });
    }
  }

  async getTraductionsByLanguage(req, res) {
    try {
      const lang = req.params.language;
      let traduction = await this.service.getTraductionsByLanguageServices(
        lang
      );
      if (traduction) {
        res.status(200).json({ traductions: traduction });
      } else {
        res.status(400).json({
          error:
            "Une erreur est survenue durant la récupération des traductions",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant la récupération des traductions",
      });
    }
  }

  async addTraduction(req, res) {
    try {
      let result = await this.service.addTraductionService(req.body);
      if (result) {
        res.status(200).json({
          message: "Traduction ajoutée !",
        });
      } else {
        res.status(400).json({
          error: "Une erreur est survenue durant l'ajout de la traduction",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant l'ajout de la traduction",
      });
    }
  }
  async setLanguage(req, res) {
    try {
      let result = await this.service.setLanguageService(
        req.params.userId,
        req.user,
        req.body.language
      );
      if (result) {
        res.status(200).json({
          message: "Language modifié !",
        });
      } else {
        res.status(400).json({
          error: "Une erreur est survenue durant la modification de la langue",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant la modification de la langue",
      });
    }
  }
  async getLanguageByUserId(req, res) {
    try {
      let result = await this.service.getLanguageByUserIdService(
        req.params.userId,
      );
      if (result) {
        res.status(200).json({
          language: result,
        });
      } else {
        res.status(400).json({
          error: "Une erreur est survenue durant la récupération de la langue",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: "Une erreur est survenue durant la récupération de la langue",
      });
    }
  }
}

module.exports = LanguagesController;
