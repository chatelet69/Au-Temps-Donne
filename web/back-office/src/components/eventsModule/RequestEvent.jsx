import { useEffect, useState } from "react";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { frFR } from "gridjs/l10n";
import { _ } from "gridjs-react";
import "../../css/components.css";
import "gridjs/dist/theme/mermaid.css";
import EventsModule from "./EventsModule.jsx";
import RequestDetail from "./RequestDetail.jsx";
const baseUrl = require("../../config.json").baseUrl;

const RequestEvent = (props) => {
  const [requests, setRequests] = useState(null);

  useEffect(() => {
    const getAllRequests = async () => {
      try {
        const res = await fetch(`${baseUrl}/requestEvent/getRequestById/`, {
          method: "GET",
          headers: { "Access-Control-Allow-Origin": "origin" },
          credentials: "include",
        });
        const jsonResult = await res.json();
        if (jsonResult && jsonResult.requests) setRequests(jsonResult.requests);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };

    getAllRequests(); // on appel la fonction lorsque qu'on appel le composant
  }, []);

  if (requests) {
    return (
      <div className="module-container events-module-container">
        <div className="module-head events-module-head">
          <h2>Gestion des Requêtes</h2>
          <button
            onClick={() =>
              props.changeModule(
                <EventsModule changeModule={props.changeModule} />
              )
            }
            id="createNewEventButtonAction"
          >
            Voir les évènements
          </button>
        </div>
        <div className="events-grid-container" />
        <Grid
          data={requests.map((request) => [
            _(
              request.status == 0 ? (
                <span class="material-symbols-outlined timer">timer</span>
              ) : request.status == 1 ? (
                <span class="material-symbols-outlined check">done</span>
              ) : (
                <span class="material-symbols-outlined cross">close</span>
              )
            ),
            request.username,
            request.type_event,
            request.start_datetime,
            request.end_datetime,
            request.situation,
            request.place,
            _(<span className="material-symbols-outlined btn-arrow" onClick={() => props.changeModule(<RequestDetail request={request} changeModule={props.changeModule}/>)}>arrow_forward</span>),
          ])}
          className={{
            thead: "tableTexts",
            tbody: "tableTexts",
            container: "containerGrid",
          }}
          columns={[
            {
              name: "Statut",
            },
            "Type d'évènement",
            "Pseudonyme",
            "Début",
            "Fin",
            "Situation",
            "Emplacement",
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
  }
};

export default RequestEvent;
