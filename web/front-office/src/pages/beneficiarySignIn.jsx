import React, { useState } from 'react';
import FrontFooter from "../components/Footer";
import PersonnalInformationsBeneficiary from "../components/beneficiarySignInSteps/personalInformationsBenef";

const BeneficiarySignIn = () => {
  let oldModule = localStorage.getItem("currentBenefSignInModule");
	if (!oldModule) localStorage.setItem("currentBenefSignInModule", "personalInformations");
  const [actualModule, setModule] = useState(<PersonnalInformationsBeneficiary  changeModule={changeModule} />);	// Destructuring
  function changeModule(newModule) {
		localStorage.setItem("currentModule", newModule.type.name);
		setModule(newModule); 
	}

  return (
    <>
      <main>
        <div className="titleSignIn">
          <h1>Devenir bénéficiaire</h1>
          <p>
            Inscrivez vous pour bénéficier de distributions alimentaires,
            maraudes, visites ou même de soutiens scolaire. Toutes les
            informations sont disponible sur notre site web.
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
          <div id='PjSignIn' className="futurStepSignIn">
            <p>2-Pièces jointes</p>
          </div>
        </div>
        {actualModule}
      </main>
      <FrontFooter />
    </>
  );
};

export default BeneficiarySignIn;
