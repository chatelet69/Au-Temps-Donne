import React, { useState, useEffect } from "react";
import "../../css/application.css";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { frFR } from "gridjs/l10n";
import { _ } from "gridjs-react";
import VolunteerApplicationModule from "./ViewApplicationsModule.jsx";
import DetailsBeneficiaryApplication from "./DetailsBeneficiaryApplication.jsx";

const baseUrl = require("../../config.json").baseUrl;

const BeneficiariesApplicationsModule = (props) => {
  const [applications, setApplications] = useState([]);
  const [formations, setFormations] = useState([]);
  
  useEffect(() => {
    // appel l'API
    const fetchApplications = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/beneficiaries/allBeneficiariesApplications`,
          {
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "origin" },
            credentials: "include",
          }
        );
        const jsonResult = await res.json();
        if (jsonResult && jsonResult.applications) setApplications(jsonResult.applications);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };

    fetchApplications(); // on appel la fonction lorsque qu'on appel le composant
  }, []); // le tableau vide permet de s'assurer que UseEffect ne s'éxecute qu'une seule fois au montage

  useEffect(() => {
    const getFormationsById = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/volunteer/getFormations/${props.token.userId}`,
          {
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "origin" },
            credentials: "include",
          }
        );
        const jsonResult = await res.json();
        if (jsonResult && jsonResult.formations) setFormations(jsonResult.formations);
        console.log(formations);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };

    getFormationsById(); // on appel la fonction lorsque qu'on appel le composant
  }, []);

  return (
    <div className="view-applications-module-container">
      <div className="backgroundApplicationTitle">
        <h1 className="applicationTitle">Candidatures : </h1>
        <p className="applicationTitle optionTitle">Bénéficiaires</p>
        <p className="applicationTitle optionTitle">/</p>
        <p className="applicationTitle optionTitle" onClick={() => props.changeModule(<VolunteerApplicationModule changeModule={props.changeModule}/>)}>Bénévoles</p>
      </div>
        <Grid
          data={applications.map((app) => [
			_(app.status == 0 ? <span class="material-symbols-outlined timer">timer</span> : app.status == 1 ? <span class="material-symbols-outlined check">done</span> : <span class="material-symbols-outlined cross">close</span>),
            app.lastname,
            app.name,
            app.birthday,
            app.situation,
            app.date,
            _(
				<span className="material-symbols-outlined btn-arrow" onClick={() => props.changeModule(<DetailsBeneficiaryApplication application={app} changeModule={props.changeModule}/>)}>arrow_forward</span>
            ),
          ])}
		  className={
			{
				thead:'tableTexts',
				tbody:'tableTexts',
        container:'containerGrid'
			}
		  }
          columns={[
            {
              name: "Statut",
            },
            "Nom",
            "Prénom",
            "Date de naissance",
            "Situation",
            "Date d'envoi",
            "Actions",
          ]}
          width="90vw"
          fixedHeader={true}
          language={frFR}
          search={true}
		  sort={true}
          pagination={{
            limit: 6,
          }}
        />
    </div>
  );
};

export default BeneficiariesApplicationsModule;
