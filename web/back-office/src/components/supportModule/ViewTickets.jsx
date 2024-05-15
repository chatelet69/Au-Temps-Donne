import React, { useState, useEffect } from "react";
import "../../css/application.css";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { frFR } from "gridjs/l10n";
import { _ } from "gridjs-react";
import TicketDetail from "./TicketDetail.jsx";
import CreateTicketPopUp from "./CreateTicket.jsx";

const baseUrl = require("../../config.json").baseUrl;

const ViewTicketModule = (props) => {
	const [tickets, setTickets] = useState([]);
	const [createTicketPopUpState, changeCreateTicketPopUpState] = useState(false);

    const getTickets = async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/tickets/getTicketsByUser`,
          {
            method: "GET",
            headers: { "Access-Control-Allow-Origin": "origin" },
            credentials: "include",
          }
        );
        const jsonResult = await res.json();
        if (jsonResult && jsonResult.tickets) setTickets(jsonResult.tickets);
      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };
  useEffect(() => {
    getTickets();
  }, []); 

	return (
		<div className="view-support-module-container">
			<div className="backgroundApplicationTitle">
				<h1 className="applicationTitle">Vos tickets : </h1>
			</div>
			<button className="button-module createTicket" onClick={()=>changeCreateTicketPopUpState(true)}>Créer un ticket</button>
			<Grid
				data={tickets.map((ticket) => [
					_(ticket.ticket_status === 0 ? <span className="material-symbols-outlined timer">timer</span> : ticket.ticket_status === 1 ? <span className="material-symbols-outlined check">done</span> : <span className="material-symbols-outlined cross">close</span>),
					ticket.difficulty,
					ticket.category,
					ticket.title,
					ticket.description,
					ticket.date,
					_(
						<span className="material-symbols-outlined btn-arrow" onClick={() => props.changeModule(<TicketDetail ticket={ticket} changeModule={props.changeModule} />)}>arrow_forward</span>
					),
				])}
				className={
					{
						thead: 'tableTexts',
						tbody: 'tableTexts',
						container: 'containerGrid'
					}
				}
				columns={[
					"Statut",
					"Difficulté",
					"Catégorie",
					"Titre",
					"Description",
					"Date d'envoi",
					"Action"
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
			{createTicketPopUpState && <CreateTicketPopUp changeCreateTicketPopUpState={changeCreateTicketPopUpState} getTickets={getTickets} />}
		</div>
	);
};

export default ViewTicketModule;