import { useEffect, useState } from "react";
import "gridjs/dist/theme/mermaid.css";
import { _ } from "gridjs-react";
import "../../css/components.css";
import RequestEvent from "./RequestEvent.jsx";
const baseUrl = require("../../config.json").baseUrl;

const PopUpAddResponsableEvent = (props) => {
  const [volunteers, setVolunteers] = useState(null);

  useEffect(() => {
    const getVolunteers = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/volunteer/allVolunteers`, {
          method: "GET",
          credentials: "include"
        });
        const jsonResult = await res.json();
        if (jsonResult && jsonResult.volunteers)
          setVolunteers(jsonResult.volunteers);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };

    getVolunteers();
  }, []);

  const acceptRequest = async () => {
    try {
      let responsableId = document.getElementById("responsable").value
      console.log(responsableId)
      const res = await fetch(
        `${baseUrl}/requestEvent/accept/${props.request.id}`,
        {
          method: "PATCH",
          headers: { 
            "Access-Control-Allow-Origin": "origin",
            "Content-Type": "application/x-www-form-urlencoded"
          },
          credentials: "include",
          body: `responsable=${responsableId}`
        }
      );
      const jsonResult = await res.json();
      if (jsonResult && !jsonResult.error)
        props.changeModule(<RequestEvent changeModule={props.changeModule} />);
    } catch (error) {
      console.error("Erreur lors de la récupération des données", error);
    }
  };

  if (volunteers) {
    return (
      <div className="popUpBox">
        <h2>Ajouter un résponsable ?</h2>
        <select name="responsable" id="responsable">
          <option value="">Pas de réponsable</option>
          {volunteers.map((volunteer) => (
            <option value={volunteer.id}>
              {volunteer.name} {volunteer.lastname}
            </option>
          ))}
        </select>
        <div className="btnPopUp">
          <button onClick={() => props.changePopUpState(false)}>Annuler</button>
          <button className="validBtn" onClick={() => acceptRequest()}>
            Valider
          </button>
        </div>
      </div>
    );
  }
};

export default PopUpAddResponsableEvent;
