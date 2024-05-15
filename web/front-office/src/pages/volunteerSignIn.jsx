import React, { useState } from "react";
import FrontFooter from "../components/Footer";
import PersonnalInformationsVolunteer from "../components/volunteerSignInSteps/personalInformationsVolunteer";

const VolunteerSignIn = () => {
  let oldModule = localStorage.getItem("currentBenefSignInModule");
  if (!oldModule)
    localStorage.setItem("currentBenefSignInModule", "personalInformations");
  const [actualModule, setModule] = useState(
    <PersonnalInformationsVolunteer changeModule={changeModule} />
  ); // Destructuring
  function changeModule(newModule) {
    localStorage.setItem("currentModule", newModule.type.name);
    setModule(newModule);
  }

  return (
    <>
      <main>
        <div className="titleSignIn">
          <h1>S'engager</h1>
          <p>
            Chez Au Temps Donné, les bénévoles incarent un maillon crucial dans
            la lutte contre la précarité. Sans nos Bénévoles notre action ne
            serait pas possible, sans eux, elle ne perdurait pas
          </p>
          <p>
            En vous inscrivant, vous créez en même temps un compte, pour vous
            permettre de suivre votre candidature et d'accéder à nos services si
            vous êtes acceptés
          </p>
        </div>
        <div className="stepsSignIn">
          <div id="POSignIn" className="actualStepSignIn">
            <p>1-Informations personnelles</p>
          </div>
          <div id="dispoSignIn" className="futurStepSignIn">
            <p>2-Disponibilités</p>
          </div>
          <div id="PjSignIn" className="futurStepSignIn">
            <p>3-Infos complémentaires</p>
          </div>
        </div>
        {actualModule}
      </main>
      <FrontFooter />
    </>
  );
};

export default VolunteerSignIn;
