import { useEffect, useState } from "react";
import "gridjs/dist/theme/mermaid.css";
import { _ } from "gridjs-react";
import "../../css/components.css";
import "gridjs/dist/theme/mermaid.css";
import RequestEvent from "./RequestEvent.jsx";
import PopUpAddResponsableEvent from "./PopUpAddResponsableEvent.jsx";
const baseUrl = require("../../config.json").baseUrl;

const RequestDetail = (props) => {
    const [popUpState, changePopUpState] = useState(false)

      const refuseRequest = async () => {
        try {
          const res = await fetch(`${baseUrl}/requestEvent/refuse/${props.request.id}`, {
            method: "PATCH",
            headers: { "Access-Control-Allow-Origin": "origin" },
            credentials: "include",
          });
          const jsonResult = await res.json();
          if (jsonResult && !jsonResult.error) props.changeModule(<RequestEvent changeModule={props.changeModule} />)
        } catch (error) {
          console.error("Erreur lors de la récupération des données", error);
        }
      };

  return (
    <div className="module-container events-module-container">
      <div className="module-head events-module-head">
        <span
          className="material-symbols-outlined btn-arrow"
          onClick={() =>
            props.changeModule(
              <RequestEvent changeModule={props.changeModule} />
            )
          }
        >
          arrow_back
        </span>
        <h2>Gestion de la Requête #{props.request.id}</h2>
      </div>
      <div className="requestDetailBox">
        <div className="requestDetailContent">
          <div>
            <h3>Information du bénéficiaire</h3>
            <div className="boxInfoRequest">
                <h4>Pseudonyme : </h4>
                <p>{props.request.username}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Nom : </h4>
                <p>{props.request.lastname}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Prénom : </h4>
                <p>{props.request.name}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Email : </h4>
                <p>{props.request.email}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Téléphone : </h4>
                <p>{props.request.phone}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Adresse : </h4>
                <p>{props.request.address}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Situation : </h4>
                <p>{props.request.situation}</p>
            </div>
          </div>
          <div>
            <h3>Information de la demande</h3>
            <div className="boxInfoRequest">
                <h4>Type d'évènement : </h4>
                <p>{props.request.type_event}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Début de l'activité : </h4>
                <p>{props.request.start_datetime}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Fin de l'activité : </h4>
                <p>{props.request.end_datetime}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Description : </h4>
                <p>{props.request.description}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Emplacement : </h4>
                <p>{props.request.place}</p>
            </div>
            <div className="boxInfoRequest">
                <h4>Statut : </h4>
                <p>{props.request.status == 0 ? "En attente" : props.request.status == 1 ? "Validé" : "Refusé"}</p>
            </div>
          </div>
        </div>
        <div className="btnBox">
            {props.request.status == 0 &&
            <>
                <button className="refuseBtn" onClick={()=>refuseRequest()}>Refuser</button>
                <button className="validBtn" onClick={() => changePopUpState(true)}>Valider</button>
            </>
            }{
                props.request.status == 1 &&
                <button className="validBtn">Validé</button>
            }{
                props.request.status == 2 &&
                <button className="refuseBtn">Refusé</button>
            }
        </div>
      </div>
      {popUpState && <PopUpAddResponsableEvent changePopUpState={changePopUpState} request={props.request} changeModule={props.changeModule} />}
    </div>
  );
};

export default RequestDetail;
