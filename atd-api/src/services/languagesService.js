const translate = require("deepl");
const LanguageRepo = require("../repository/languagesRepo");
const fs = require("fs");
const authorizedLanguages = require("../utils/form.json").authorizedLanguages;
const keyDeepl = require("../../config.json").deeplKey;

class LanguageService {
  repository;
  constructor() {
    this.repository = new LanguageRepo();
  }

  async getLanguagesServices() {
    try {
      let languagesList = await this.repository.getLanguagesRepo();
      return languagesList;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getTraductionsByLanguageServices(lang) {
    try {
      lang = lang.toUpperCase();
      let result = await this.getLanguagesServices();
      let isLanguage = false;
      for (let i = 0; i < result.length; i++) {
        if (result && result[i].language_acr.indexOf(lang) != -1) {
          isLanguage = true;
        }
      }
      if (isLanguage) {
        const data = fs.readFileSync("./languages/" + lang + ".json", {
          encoding: "utf-8",
          flag: "r",
        });
        return JSON.parse(data);
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async updateTraductionsServices(){
    try {
      let frSentences = await this.getTraductionsByLanguageServices("FR");
      let languageList = await this.getLanguagesServices();
      for (let i = 0; i < languageList.length; i++) {
        if(languageList[i].language_acr == "FR") languageList.splice(i, 1)
      }
      console.log(languageList)
        if (frSentences) {
          await Promise.all(languageList.map(async (language)=>{
            let acr = language.language_acr
            if(fs.existsSync("./languages/" + acr + ".json")){
              fs.unlink("./languages/" + acr + ".json", (err) => {
                if (err) throw err;
                console.log("fichier supprimé")
              });
            }

            let tradJson = {
              language: acr,
              translation: {},
            };
            
            for (let key in frSentences.translation) {
              try {
                const translationResult = await translate({
                  free_api: true,
                  text: frSentences.translation[key],
                  target_lang: acr,
                  auth_key: keyDeepl,
                });
                tradJson.translation[key] = translationResult.data.translations[0].text;
              } catch (error) {
                console.log(error);
              }
            }

            fs.writeFileSync(
              "./languages/" + acr + ".json",
              JSON.stringify(tradJson, null, 2)
            );
          }))
          return true;
        }
        return false;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async addTraductionService(langInfos) {
    try {
      console.log(langInfos)
      const acr = langInfos.language_acr.toUpperCase();
      let language_name = null;
      if (acr && acr.length <= 5) {
        let verifLanguage = false;
        for (let i = 0; i < authorizedLanguages.length; i++) {
          if (authorizedLanguages[i][0].indexOf(acr) != -1) {
            verifLanguage = true;
            language_name = authorizedLanguages[i][1];
            break;
          }
        }
        if (verifLanguage) {
          let frSentences = await this.getTraductionsByLanguageServices("FR");
          if (frSentences) {
            let tradJson = {
              language: acr,
              translation: {},
            };
            for (let key in frSentences.translation) {
              try {
                const translationResult = await translate({
                  free_api: true,
                  text: frSentences.translation[key],
                  target_lang: acr,
                  auth_key: keyDeepl,
                });
                tradJson.translation[key] =
                  translationResult.data.translations[0].text;
              } catch (error) {
                console.log(error);
              }
            }
            fs.writeFileSync(
              "./languages/" + acr + ".json",
              JSON.stringify(tradJson, null, 2)
            );
            let result = await this.repository.addLanguageDb(
              acr,
              language_name
            );
            if (result) return true;
            else return false;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async setLanguageService(userConcernedId, userInfos, language) {
    try {
      if (userInfos.userId == userConcernedId) {
        if (language) {
          language = language.split(":")[0];
          console.log(language);
          let language_arc = language.toUpperCase();
          if (language_arc.length <= 5) {
            let verifLanguage = false;
            for (let i = 0; i < authorizedLanguages.length; i++) {
              if (authorizedLanguages[i][0].indexOf(language_arc) != -1) {
                verifLanguage = true;
                break;
              }
            }
            if (verifLanguage) {
              await this.repository.setLanguageRepo(
                language_arc,
                userConcernedId
              );
              return true;
            }
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async getLanguageByUserIdService(userId) {
    try {
      if (userId && userId > 0) {
        let language = await this.repository.getLanguageByUserIdRepo(userId);
        if(language && language[0] && language[0].language){
          return language[0].language;
        }else{
          return false;
        }
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
module.exports = LanguageService;
