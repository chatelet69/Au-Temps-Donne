import React, { useState, useRef } from "react";
import "../../css/components.css";
import { useEffect } from "react";
import customFr from "../../assets/customFrGrid.ts";
import { Grid, html } from "gridjs";
import FormatDate from "../functionsComponents/FormatDate.jsx";
import CalendarPlanning from "../functionsComponents/CalendarPlanning.jsx";
const baseUrl = require("../../config.json").baseUrl;
const winHeightBreak = 820;
const minAmountInformations = 4;

const MainModule = (props) => {
	const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString("fr-FR"));
	const lastApplicationsWrapper = useRef(null);
	const nextEventsWrapper = useRef(null);
	const nextFormationsWrapper = useRef(null);

	function moveDate(type) {
		if (type !== -1 && type !== 1) return;
		const planningDate = document.getElementById("planningDateValue");
		let date = null;
		if (planningDate) {
			const tmpDateArray = planningDate.innerText.split("/");
			date = new Date(tmpDateArray[2], Number.parseInt(tmpDateArray[1])-1, Number.parseInt(tmpDateArray[0]));
		}

		if (date && !isNaN(date)) date.setDate(date.getDate() + type);
		if (date) {
			date = date.toLocaleDateString("fr-FR");
			planningDate.innerText = date;
			setCurrentDate(date);
		}
	}

	function createLastApplicationsGrid() {
        const grid = new Grid({
			columns: [{name: "Id", width: "15%"}, "Prénom", "Nom", "Statut"],
			search: false,
            server: {
                method: "GET",
                url: `${baseUrl}/api/volunteers/lastVolunteerApplications?amount=`+((props.dimensions.windowHeight >= winHeightBreak) ? 6 : minAmountInformations),
                credentials: "include",
                then: data => data.applications.map(application => [
                    application.id, 
					application.name, 
					application.lastname, 
					(
						Number.parseInt(application.status) === 0 ? html('<span class="material-symbols-outlined timer">timer</span>') : 
						Number.parseInt(application.status) === 1 ? html('<span class="material-symbols-outlined check">done</span>') : 
						html('<span class="material-symbols-outlined cross">close</span>')
					)
				]),
            },
			style: {
				th: { "text-align": "center" },
				td: { "text-align": "center" }
			},
            language: customFr
        });
        grid.render(lastApplicationsWrapper.current);
    }

	function createNextEventsGrid() {
        const grid = new Grid({
			columns: [{name: "Id", width: "15%"}, "Titre", "Date de début"],
			search: false,
            server: {
                method: "GET",
                url: `${baseUrl}/events/getResumeNextEvents?amount=`+((props.dimensions.windowHeight >= winHeightBreak) ? 6 : minAmountInformations),
                credentials: "include",
                then: data => data.events.map(event => [ event.id, event.title, FormatDate(event.start_datetime, 'Y-m-d') ])
            },
			style: {
				th: { "text-align": "center" },
				td: { "text-align": "center" }
			},
            language: customFr
        });
        grid.render(nextEventsWrapper.current);
    }

	function createNextFormationsResumeGrid() {
        const grid = new Grid({
			columns: [{name: "Id", width: "15%"}, "Titre", "Date de début"],
			search: false,
            server: {
                method: "GET",
                url: `${baseUrl}/api/getResumeNextFormations?amount=`+((props.dimensions.windowHeight >= winHeightBreak) ? 6 : minAmountInformations),
                credentials: "include",
                then: data => data.formations.map(formation => [ 
					formation.id, formation.title, FormatDate(formation.datetime_start, 'Y-m-d')
				])
            },
			style: {
				th: { "text-align": "center" },
				td: { "text-align": "center" }
			},
            language: customFr
        });
        grid.render(nextFormationsWrapper.current);
    }

	useEffect(() => {
		createNextEventsGrid();
		createLastApplicationsGrid();
		createNextFormationsResumeGrid();
	});

	return (
		<div className="main-module-container">
			<div className="global-planning-container">
				<div id="globalPlanningHead" className="flexbox-row">
					<span onClick={() => moveDate(-1)} className="arrow-go_back material-symbols-outlined">arrow_back</span>
					<h3 id="datePlanningTitle">Planning du jour<br /><span id="planningDateValue">{currentDate}</span></h3>
					<span onClick={() => moveDate(1)} className="arrow-go_back material-symbols-outlined">arrow_forward</span>
				</div>
				<div id="globalPlanningCalendar" className="flexbox-row">
					<div className="global-planning-volunteers planning-calendar">
						<CalendarPlanning isPersonnal={false} date={currentDate} userId={props.userId}/>
					</div>
					{/*<span className="arrow-button material-symbols-outlined">arrow_forward</span>*/}
				</div>
			</div>
			<div className="side-informations-container flexbox-row">
				<div className="side-information-box">
					<h4 className="side-informations-title text-center">Prochains évènements</h4>
					<p className="text-center">(Ou en cours)</p>
					<div ref={nextEventsWrapper} />
				</div>
				<div className="side-information-box">
					<h4 className="side-informations-title text-center">Prochaines formations</h4>
					<div ref={nextFormationsWrapper} />
				</div>
				<div className="side-information-box">
					<h4 className="side-informations-title text-center">Dernières candidatures</h4>
					<div ref={lastApplicationsWrapper} />
				</div>
			</div>
		</div>
	);
};

export default MainModule;