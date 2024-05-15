import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
const baseUrl = require("./config.json").baseUrl;

function decodeCookie() {
  try {
      let decoded = null;
      if (Cookies.get("atdCookie")) decoded = jwtDecode(Cookies.get("atdCookie"));
      return decoded;
  } catch (error) {
    console.log(error);
  }
}

async function getUserLanguage() {
  try {
    let decoded = decodeCookie();
    if (decoded !== null) {
      let res = await fetch(`${baseUrl}/api/getLanguage/` + decoded.userId,{credentials: "include"});
      let data = await res.json();
      if (res.status === 200) {
        console.log(data.language)
        return data.language;
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue durant le changement de langue";
      }
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

i18n.use(initReactI18next).init({
  debug: true,
  fallbackLng: await getUserLanguage(),
  interpolation: {
    escapeValue: false,
  },
  resources: {},
});


const loadLanguageFiles = async () => {
  try {
    let res = await fetch(`${baseUrl}/api/getLanguages`);
    let data = await res.json();
    let languages = data.languages;
    for (let i = 0; i < languages.length; i++) {
      let res2 = await fetch(
        `${baseUrl}/api/getTraductionsByLanguage/` + languages[i].language_acr
      );
      let translated = await res2.json();
      let translatedData = translated.traductions.translation;
      i18n.addResourceBundle(
        translated.traductions.language,
        "translation",
        translatedData,
        true,
        true
      );
    }
  } catch (error) {
    console.log(error);
  }
};

await loadLanguageFiles();

export default i18n;
