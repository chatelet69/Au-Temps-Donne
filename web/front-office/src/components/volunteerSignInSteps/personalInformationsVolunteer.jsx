import React from "react";
import FileBeneficiarySignIn from "./additionalInfoVolunteer";
import DispoSignInVolunteer from "./dispoSignInVolunteer";
const baseUrl = require("../../config.json").baseUrl;

const PersonnalInformationsVolunteer = (props) => {
  function formatDate(date) {
    let tmpDate = date.split("-");
    date = tmpDate[2] + "/" + tmpDate[1] + "/" + tmpDate[0];
    return date;
  }

  async function isUsernameExist(checkUsername) {
    try {
      let res = await fetch(
        `${baseUrl}/users/isUsernameExist/` + checkUsername,
        {
          method: "GET",
          mode: "cors",
          headers: {
            //"Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
        }
      );
      let data = await res.json();
      if (res.status === 200) {
        if (data.usernameExist == false) {
          document.getElementById("errorMsg").textContent = "";
          return false;
        } else {
          document.getElementById("errorMsg").textContent =
            "Username déjà existant";
          return true;
        }
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue lors de la verification du username";
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function isEmailExist(email) {
    try {
      let res = await fetch(
        `${baseUrl}/users/isEmailExist/` + email,
        {
          method: "GET",
          mode: "cors",
          headers: {
            //"Content-Type": "multipart/form-data",
            "Access-Control-Allow-Origin": "origin",
            Accept: "*/*",
            "Access-Control-Allow-Credentials": "true",
          },
          credentials: "include",
        }
      );
      let data = await res.json();
      if (res.status === 200) {
        if (data.emailExist == false) {
          document.getElementById("errorMsg").textContent = "";
          return false;
        } else {
          document.getElementById("errorMsg").textContent =
            "Email déjà utilisé";
          return true;
        }
      } else {
        document.getElementById("errorMsg").textContent =
          "Une erreur est survenue lors de la verification de l'email";
        return true;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async function submitPersonnalInfos() {
    try {
      
      let prevSelectTab = document.getElementsByTagName("select");
      let prevTab = document.getElementsByTagName("input");
      let tab = {};
      for (let i = 0; i < prevTab.length; i++) {
        if (
          prevTab[i].required &&
          (prevTab[i].value == "" ||
            prevTab[i].value == null ||
            prevTab[i].value == undefined)
        ) {
          document.getElementById("errorMsg").textContent =
            "Vous devez renseigner tous les champs obligatoires";
          return false;
        }
        if (
          prevTab[i].value != "" &&
          prevTab[i].value != null &&
          prevTab[i].value != undefined
        ) {
          switch (prevTab[i].name) {
            case "birthday":
              tab["birthday"] = formatDate(prevTab[i].value);
              break;
  
            case "email":
              let checkEmail = prevTab[i].value;
              if (
                checkEmail.indexOf("@") == -1 ||
                checkEmail.indexOf(".") == -1 ||
                checkEmail.length > 255
              ) {
                document.getElementById("errorMsg").textContent =
                  "Merci de choisir un email valide";
                return false;
              } else {
                if(await isEmailExist(checkEmail) == false){
                  tab["email"] = checkEmail;
                  break;
                }else{
                  return false;
                }
              }
  
            case "username":
              let checkUsername = prevTab[i].value;
              if (checkUsername.length > 45) {
                document.getElementById("errorMsg").textContent =
                  "45 car max pour un username";
                return false;
              } else {
                if (await isUsernameExist(checkUsername) == false) {
                  tab["username"] = checkUsername;
                  break;
                } else {
                  return false;
                }
              }
  
            case "phone":
              let checkPhone = prevTab[i].value;
              if (checkPhone.length > 10 || isNaN(prevTab[i].value)) {
                document.getElementById("errorMsg").textContent =
                  "Merci de bien respecter le format du numéro de téléphone";
                return false;
              } else {
                tab["phone"] = checkPhone;
              }
              break;
  
            default:
              let checkDefault = prevTab[i].value;
              if (checkDefault.length > 255) {
                document.getElementById("errorMsg").textContent =
                  "Merci de bien garder 255 caractères maximum";
                return false;
              } else {
                tab[prevTab[i].name] = checkDefault;
              }
              break;
          }
        }
      }
      for (let i = 0; i < prevSelectTab.length; i++) {
        if (
          prevSelectTab[i].required &&
          (prevSelectTab[i].value == "" ||
            prevSelectTab[i].value == null ||
            prevSelectTab[i].value == undefined)
        ) {
          document.getElementById("errorMsg").textContent =
            "Vous devez renseigner tous les champs obligatoires";
          return false;
        }
        if (
          prevSelectTab[i].value != "" &&
          prevSelectTab[i].value != null &&
          prevSelectTab[i].value != undefined
        ) {
          tab[prevSelectTab[i].name] = parseInt(prevSelectTab[i].value);
        }
      }
      let checkTab = document.getElementsByClassName("licenses")
      for (let key in checkTab) {
          if(checkTab[key].checked == true){
            tab[checkTab[key].name] = 1;
          } 
          else tab[checkTab[key].name] = 0;
      }
  
      document.getElementById("errorMsg").textContent = "";
      document.getElementById("dispoSignIn").classList.remove("futurStepSignIn");
      document.getElementById("dispoSignIn").classList.add("actualStepSignIn");
      document.getElementById("POSignIn").classList.add("futurStepSignIn");
      document.getElementById("POSignIn").classList.remove("actualStepSignIn");
      props.changeModule(
        <DispoSignInVolunteer
          changeModule={props.changeModule}
          personnalInfos={tab}
        />
      );
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="containerListsSignIn">
        <div className="inputListSignIn">
          <div className="signInInputContainer">
            <label htmlFor="genderSelect" className="required">
              Genre
            </label>
            <select
              name="gender"
              id="genderSelect"
              className="signInInputs"
              required
            >
              <option value="1">Homme</option>
              <option value="2">Femme</option>
              <option value="3">Autre</option>
            </select>
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputName" className="required">
              Nom
            </label>
            <input
              name="lastname"
              type="text"
              id="signInInputName"
              className="signInInputs"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputLastName" className="required">
              Prenom
            </label>
            <input
              name="name"
              type="text"
              id="signInInputLastName"
              className="signInInputs"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputBirthday" className="required">
              Année de naissance
            </label>
            <input
              name="birthday"
              type="date"
              id="signInInputBirthday"
              className="signInInputs"
              required
            />
          </div>
        </div>
        <div className="inputListSignIn">
          <div className="signInInputContainer">
            <label htmlFor="signInInputEmail"  className="required">Email</label>
            <input
              name="email"
              type="email"
              id="signInInputEmail"
              className="signInInputs"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputPseudo" className="required">
              Pseudonyme
            </label>
            <input
              name="username"
              type="text"
              id="signInInputPseudo"
              className="signInInputs"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputPhone"  className="required">Téléphone</label>
            <input
              name="phone"
              type="tel"
              id="signInInputPhone"
              className="signInInputs"
              placeholder="01 22 33 44 55"
              pattern="[0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2} [0-9]{2}"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputPassword" className="required">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              id="signInInputPassword"
              className="signInInputs"
              required
            />
          </div>
        </div>
        <div className="inputListSignIn">
          <div className="signInInputContainer">
            <label htmlFor="signInInputAddress"  className="required">Adresse</label>
            <input
              name="address"
              type="text"
              id="signInInputAddress"
              className="signInInputs"
              required
            />
          </div>
          <div className="signInInputContainer">
            <label htmlFor="signInInputSituation" className="required">
              Situation actuelle
            </label>
            <input
              name="situation"
              id="signInInputSituation"
              className="signInInputs"
              required
            ></input>
          </div>
          <div className="licenseListContainer">
            <p>Permis de conduires :</p>
            <div>
              <input type="checkbox" id="car_license" name="car_license" className="licenses"/>
              <label for="car_license">Permis B</label>
            </div>

            <div>
              <input type="checkbox" id="truck_license" name="truck_license" className="licenses"/>
              <label for="truck_license">Permis C</label>
            </div>
            <div>
              <input type="checkbox" id="bike_license" name="bike_license" className="licenses"/>
              <label for="bike_license">Permis deux roues</label>
            </div>
          <div className="absoluteDiv">
            <button
              type="submit"
              id="nextSignIn"
              className="sendBtnForm volunteerNext"
              onClick={submitPersonnalInfos}
            >
              Suivant
            </button>
            <p id="errorMsg" className="signInVolunteerNextErrorMsg"></p>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PersonnalInformationsVolunteer;
