import { useEffect, useRef, useState } from "react";
import { Grid, h } from "gridjs";
import CreateEventPopup from "./CreateEventPopup.jsx";
import "../../css/components.css"
import "gridjs/dist/theme/mermaid.css";
import customFr from "../../assets/customFrGrid.ts";
import ViewEvent from "./ViewEvent.jsx";
import RequestEvent from "./RequestEvent.jsx";
const baseUrl = require("../../config.json").baseUrl;

const EventsModule = (props) => {
	const wrapperRef = useRef(null);
	const [currentGrid, setcurrentGrid] = useState(null);
	const [eventsReloadStatus, setEventsReloadStatus] = useState(false);
	const [visibilityPopup, setVisibilityPopup] = useState(false);
	const [filterView, setFilterView] = useState("all");

	function createGrid() {
		const grid = new Grid().updateConfig({
			columns: ["Id", "Type", "Titre", "Date de début", "Date de fin", "Lieu",
				{
					name: 'Accéder',
					formatter: (cell, row) => {
						return h('button', {
							className: "access-button access-event-button",
							onClick: () => showAccessEventPopup(row)
						}, "Accéder");
					},
				},
			],
			search: true,
			server: loadServerData.server,
			sort: true,
			pagination: {
				limit: 6
			},
			language: customFr
		});
		if (currentGrid && wrapperRef.current && wrapperRef.current.innerHTML.length > 0) {
			grid.forceRender();
		} else {
			grid.render(wrapperRef.current);
		}
		setcurrentGrid(grid);
	}

	const loadServerData = {
		server: {
			method: "GET",
			url: `${baseUrl}/events/getAllEvents?filter=${filterView}`,
			credentials: "include",
			then: data => data.events.map(event => [
				event.id, (event.type[0].toUpperCase() + event.type.slice(1)),
				event.title, event.start_datetime,
				event.end_datetime, event.place
			])
		}
	}

	function updateEventGrid() {
		setEventsReloadStatus(false);
		if (currentGrid !== null && wrapperRef && wrapperRef.current) {
			wrapperRef.current.innerHTML = "";
			currentGrid.updateConfig({
				server: loadServerData.server
			});
			currentGrid.render(wrapperRef.current);
			currentGrid.forceRender();
		}
	}

	useEffect(() => {
		if (currentGrid !== null) updateEventGrid();
		else createGrid();
	}, [eventsReloadStatus, filterView]);

	function showPopup() { setVisibilityPopup(true); }

	function showAccessEventPopup(event) {
		props.changeModule(
			<ViewEvent
				eventId={event._cells[0].data}
				eventName={event._cells[2].data}
				changeModule={props.changeModule}
			/>
		);
	}

	function changeFilterView(newFilter) { setFilterView(newFilter); }

	return (
		<div className="module-container events-module-container">
			<div className="module-head events-module-head">
				<h2>Gestion des Évènements</h2>
				<div className="flexbox-row justify-start">
					<select className="button-module" id="eventsFilterSelect" onChange={() => changeFilterView(document.getElementById("eventsFilterSelect").value)}>
						<option value="all">Tout les évènements</option>
						<option value="user_registered">Ceux ou je suis inscrit</option>
						<option value="user_not_registered">Ceux ou je ne suis pas inscrit</option>
					</select>
					<button onClick={showPopup} id="createNewEventButtonAction">Créer un nouvel évènement</button>
					<button onClick={() => props.changeModule(<RequestEvent changeModule={props.changeModule} />)} id="createNewEventButtonAction">Voir les requêtes</button>
				</div>
			</div>
			<div className="events-grid-container" ref={wrapperRef} />
			{visibilityPopup && <CreateEventPopup changeReloadStatus={setEventsReloadStatus} setVisibilityPopup={setVisibilityPopup} />}
		</div>
	);
};

export default EventsModule;