import React, { Component } from "react";
import { Grid } from "gridjs";
import "../../css/components.css";
import EventsModule from "./EventsModule";
import MapboxRoad from "./MapboxRoad";
import customFr from "../../assets/customFrGrid.ts";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import { Suspense } from "react";
import { jsPDF } from "jspdf";
import StockEventPopup from "./StockEventPopup.jsx";
import DeleteEventPopup from "./DeleteEventPopup.jsx";
import EventBeneficiaryPopup from "./EventBeneficiaryPopup.jsx";
import AuthUser from "../AuthUser.jsx";
import InputsEditComponent from "../functionsComponents/UtilInputsComponent.jsx";
import LoadingPopup from "../functionsComponents/LoadingPopup.jsx";
import moment from "moment";
import EventTrajectPopup from "./EventTrajectPopup.jsx";
const baseUrl = require("../../config.json").baseUrl;
const accessToken = require("../../config.json").accessMapboxToken;

class ViewEvent extends Component {
	changeView = this.props.changeModule;

	pdfDoc = new jsPDF();
	map;
	grid;
	state = {
		errorPopup: false,
		errorMessage: "Erreur durant l'opération",
		changeView: this.props.changeModule,
		deletePopupVisibility: false,
		actualEventDetails: false,
		map: null,
		cancelEditButton: false,
		editButton: true,
		saveEditEventButton: false,
		itineraryPoints: [],
		optimizedItinerary: [],
		eventId: this.props.eventId,
		eventMembers: [],
		polylineValue: null,
		deleteEventPopupVisibility: false,
		deleteEventStatus: false,
		wrapperRef: React.createRef(),
		stockEventPopupVisibility: false,
		eventBeneficiaryPopupVisibility: false,
		waypoints: null,
		geometryString: null,
		isUserRegistered: null,
		isUserResponsable: false,
		editEventTrajectPopupVisibility: false,
		bounds: null,
		loadingPopup: false,
		isEventEditable: false,
		needMapReload: false
	};

	loadContributorsData = {
		server: {
			method: "GET",
			url: `${baseUrl}/events/event/${this.props.eventId}/contributors`,
			credentials: "include",
			then: data => {
				this.setState({ loadingPopup: false });
				if (data.contributors.length === 0) {
					this.setState({ isUserRegistered: false });
				} else {
					let isRegistered = false;
					return data.contributors.map((contributor, i) => {
						if (contributor.userId === AuthUser.id) {
							this.setState({ isUserRegistered: true });
							isRegistered = true;
						} else {
							if (i === (data.contributors.length - 1) && !isRegistered) 
								this.setState({ isUserRegistered: false });
						}
						return [
							contributor.userId, contributor.name + " " + contributor.lastname,
							(contributor.role[0].toUpperCase() + contributor.role.slice(1))
						];
					})
				}
			},
			total: data => data.count
		}
	}

	updateContributorGrid() {
		if (this.grid !== null && this.state.wrapperRef && this.state.wrapperRef.current) {
			this.state.wrapperRef.current.innerHTML = "";
			this.grid.updateConfig({ server: this.loadContributorsData.server });
			this.grid.render(this.state.wrapperRef.current);
			this.grid.forceRender();
		} else {
			this.initContributorsGrid();
		}
	}

	initContributorsGrid() {
		this.grid = new Grid().updateConfig({
			columns: ["User ID", "Nom", "Role"],
			search: false,
			server: this.loadContributorsData.server,
			style: { table: { "text-align": "center" }, },
			sort: false,
			pagination: { limit: 2 },
			language: customFr
		});
		this.grid.render(this.state.wrapperRef.current);
	}

	async getEventDetails(eventId) {
		try {
			let res = await fetch(`${baseUrl}/events/event/${eventId}`, { credentials: "include" });
			let data = await res.json();
			if (data) {
				this.setState({ actualEventDetails: data });
				const endDate = moment(data.end_datetime);
				if (endDate.isAfter(moment())) this.setState({ isEventEditable: true });
			}
			if (data.responsable === AuthUser.id) this.setState({ isUserResponsable: true });
		} catch (error) {
			this.setState({ errorMessage: error });
			this.setState({ errorPopup: true });
		}
	}

	async getItineraryPointsOptimized(eventId) {
		try {
			const res = await fetch(`${baseUrl}/events/event/${eventId}/itineraryPoints?optimized=true`, { credentials: "include" });
			const data = await res.json();
			if (data && data.waypoints) {
				this.setState({ geometryString: data.geometry });
				this.setState({ itineraryPoints: data.waypoints });
			}
		} catch (error) { return; }
	}

	goBackToEvents = () => this.props.changeModule(<EventsModule changeModule={this.props.changeModule} />);

	openEditEventTrajectPopup = () => this.setState({ editEventTrajectPopupVisibility: true });

	// Component Mounting
	async componentDidMount() {
		this.setState({ loadingPopup: true });
		await this.getEventDetails(this.props.eventId);
		await this.getItineraryPointsOptimized(this.props.eventId);
		this.initContributorsGrid();
	};

	async componentDidUpdate(prevProps, prevState) {
		if (prevState.geometryString !== this.state.geometryString) this.setOptimizedItineraryPoints();
		if (this.state.deleteEventStatus) this.goBackToEvents();
		if (prevState.isUserRegistered !== this.state.isUserRegistered) this.updateContributorGrid();
	}

	changeEditState(disabledStatus) {
		if (!disabledStatus) {
			if (AuthUser.id !== this.state.actualEventDetails.responsable && AuthUser.rank < 5) {
				this.setState({ errorMessage: "Vous n'avez pas les permissions pour modifier l'event" });
				this.setState({ errorPopup: true });
				return;
			}
		}
		const elements = document.querySelectorAll("#eventInformationsContainer input, #eventInformationsContainer textarea");
		elements.forEach((element) => {
			if (element.name !== "responsable") {
				if (disabledStatus) element.setAttribute("disabled", "");
				else element.removeAttribute("disabled");
			}
		});
		this.setState({ cancelEditButton: !this.state.cancelEditButton });
		this.setState({ editButton: !this.state.editButton });
		this.setState({ saveEditEventButton: !this.state.saveEditEventButton });
	}

	async saveEditEvent() {
		try {
			const editedData = InputsEditComponent.getEditedValues("eventInformationsContainer");
			const descArea = document.getElementById("descriptionTextInput");
			if (descArea !== null && descArea.value !== descArea.getAttribute("placeholder"))
				editedData.description = descArea.value;
			if (Object.keys(editedData).length > 0) {
				const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}`, {
					method: "PATCH",
					credentials: "include",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(editedData)
				});
				const data = await res.json();
				if (data && data.message !== undefined) {
					this.changeEditState(1);
					await this.getEventDetails(this.state.eventId);
				} else {
					this.setState({ errorMessage: (data.error) ? data.error : "Erreur du serveur durant la modification de l'event" });
					this.setState({ errorPopup: true });
				}
			}
		} catch (error) {
			this.setState({ errorMessage: "Erreur du serveur durant la modification de l'event" });
			this.setState({ errorPopup: true });
		}
	}

	polyEncodingUri(string) {
		if (string === null) return null;
		string = encodeURI(string);
		string = string.replaceAll("@", "%40");
		string = string.replaceAll("?", "%3F");
		string = string.replaceAll(";", "%3B");
		string = string.replaceAll("$", "%24");
		return string;
	}

	async downloadRoadmapFile() {
		if (this.state.bounds === null) return;
		let tmpPoly = this.polyEncodingUri(this.state.polylineValue);
		let [bottomBound, topBound] = this.state.bounds;
		if (tmpPoly !== null) {
			const imgSrc = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/path(${tmpPoly}/[${bottomBound},${topBound}]/500x300?access_token=${accessToken}`;
			const imageElement = new Image();
			imageElement.src = imgSrc;

			this.pdfDoc.text(`Roadmap de l'évènement N°${this.state.actualEventDetails.id}`, (this.pdfDoc.internal.pageSize.width / 2), 10, { 'align': 'center' });
			this.pdfDoc.text(`${this.state.actualEventDetails.title}`, (this.pdfDoc.internal.pageSize.width / 2), 20, { 'align': 'center' });

			this.pdfDoc.text("Itinéraire papier : ", 15, 30);
			this.state.itineraryPoints.forEach((point, index) => {
				this.pdfDoc.text(index + 1 + " . " + point.address + ", " + point.city + ` (${point.zip_code})`, 16, 32 + ((index + 2) * 5));
			});

			this.pdfDoc.addImage(imageElement, "PNG", 20, 60, 80, 80, "Roadmap Static Image Plan", "NONE", 0);
			this.pdfDoc.save(`Rsoadmap-${this.state.actualEventDetails.id}.pdf`);
		}
	}

	getDistanceBetweenPoints(latitude1, longitude1, latitude2, longitude2, unit) {
		let theta = longitude1 - longitude2;
		let distance = 60 * 1.1515 * (180 / Math.PI) * Math.acos(
			Math.sin(latitude1 * (Math.PI / 180)) * Math.sin(latitude2 * (Math.PI / 180)) +
			Math.cos(latitude1 * (Math.PI / 180)) * Math.cos(latitude2 * (Math.PI / 180)) * Math.cos(theta * (Math.PI / 180))
		);
		return (unit === "kilometers") ? Math.round(distance * 1.609344, 2) : distance;
	}

	setOptimizedItineraryPoints() {
		let waypoints = { start: null, inter: [], end: null };
		const itineraryPoints = this.state.itineraryPoints;

		if (itineraryPoints && itineraryPoints.length > 0) {
			waypoints.start = [
				Number.parseFloat(itineraryPoints[0].lng),
				Number.parseFloat(itineraryPoints[0].lat)
			];

			if (itineraryPoints.length > 1) {
				for (let i = 1; i < itineraryPoints.length; i++) {
					const point = [
						Number.parseFloat(itineraryPoints[i].lng),
						Number.parseFloat(itineraryPoints[i].lat)
					];
					if (i < itineraryPoints.length - 1) waypoints.inter.push(point);
					else waypoints.end = point;
				}
			}
		} else {
			return;
		}

		waypoints.inter.forEach((inter, i) => {
			const distInterEnd = this.getDistanceBetweenPoints(inter[1], inter[0], waypoints.end[1], waypoints.end[0]);
			const distStartEnd = this.getDistanceBetweenPoints(waypoints.start[1], waypoints.start[0], waypoints.end[1], waypoints.end[0]);
			if (distInterEnd > distStartEnd) {
				const tmp = waypoints.end;
				waypoints.end = inter;
				waypoints.inter[i] = tmp;
			}
		});
		this.setState({ waypoints: waypoints });
	}

	async addMyUserEventContributor() {
		try {
			const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/contributor`, {
				method: "POST",
				credentials: "include"
			});
			const data = await res.json();
			if (data && data.message !== undefined && data.message === "success") {
				this.setState({ isUserRegistered: true });
				this.updateContributorGrid();
			} else {
				this.setState({ errorMessage: (data.error) ? data.error : "Erreur durant l'inscription" });
				this.setState({ errorPopup: true });
			}
		} catch (error) {
			this.setState({ errorMessage: "Erreur durant l'inscription" });
			this.setState({ errorPopup: true });
		}
	}

	async removeMyUserContributor() {
		try {
			const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/contributor/${AuthUser.id}`, {
				method: "DELETE",
				credentials: "include"
			});
			const data = await res.json();
			if (data && data.message !== undefined && data.message === "success") {
				this.setState({ isUserRegistered: false });
				this.updateContributorGrid();
			} else {
				this.setState({ errorMessage: (data.error) ? data.error : "Erreur durant la désinscription" });
				this.setState({ errorPopup: true });
			}
		} catch (error) {
			this.setState({ errorMessage: "Erreur durant la désinscription" });
			this.setState({ errorPopup: true });
		}
	}

	formatDate(eventDate) {
		return eventDate.substring(0, eventDate.length - 3);
	}

	render() {
		if (this.state.actualEventDetails && this.state.actualEventDetails.id) {
			return (
				<div className="module-container events-module-container">
					<link href='https://api.tiles.mapbox.com/mapbox-gl-js/v3.1.0/mapbox-gl.css' rel='stylesheet' />
					<link href='https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css' rel='stylesheet' />
					<script src='https://api.tiles.mapbox.com/mapbox-gl-js/v3.1.0/mapbox-gl.js'></script>
					<div className="module-head events-module-head">
						<span className="material-symbols-outlined arrow-button" onClick={() => this.goBackToEvents()}>arrow_back</span>
						<h2>Evènement #{this.props.eventId}<br />{this.props.eventName}</h2>
					</div>
					<section className="event-informations-container justify-around flexbox-row">
						<div className="event-informations-section flexbox-column">
							<div id="eventInformationsContainer" className="event-informations-box">
								<h3 className="text-center">Informations de l'évènement</h3>
								<div className="flexbox-column align-center">
									<div className="flexbox-row justify-center">
										<div className="flexbox-column event-info-box">
											<h5>Titre</h5>
											{/*<p className="event-info-text">{this.state.actualEventDetails.title}</p>*/}
											<input name="title" disabled type="text" className="event-info-title"
												defaultValue={this.state.actualEventDetails.title}
												placeholder={this.state.actualEventDetails.title}
											/>
										</div>
										<div className="flexbox-column event-info-box">
											<h5>Description</h5>
											{/*<p className="event-info-text">
												{this.state.actualEventDetails.description}
											</p>*/}
											<textarea name="description" id="descriptionTextInput" className="event-info-description" disabled type="text"
												defaultValue={this.state.actualEventDetails.description}
												placeholder={this.state.actualEventDetails.description}
											/>
										</div>
										<div className="flexbox-column event-info-box">
											<h5>Lieu : </h5>
											<input name="place" disabled type="text" defaultValue={this.state.actualEventDetails.place}
												placeholder={this.state.actualEventDetails.place} />
										</div>
									</div>
									<div className="flexbox-row justify-center">
										<div className="flexbox-column event-info-box">
											<h5>Date de début</h5>
											<input disabled name="start_date" type="datetime-local" defaultValue={this.formatDate(this.state.actualEventDetails.start_datetime)} />
										</div>
										<div className="flexbox-column event-info-box">
											<h5>Date de fin</h5>
											<input
												disabled name="end_date"
												type="datetime-local"
												defaultValue={this.formatDate(this.state.actualEventDetails.end_datetime)}
											/>
										</div>
										<div className="flexbox-column event-info-box">
											<h5>Responsable</h5>
											<input disabled name="responsable" id="eventResponsableInput"
												value={
													(this.state.actualEventDetails.responsable !== null && this.state.actualEventDetails.responsable !== undefined) ?
														this.state.actualEventDetails.responsable_name + " " + this.state.actualEventDetails.responsable_lastname : "Pas de responsable"
												}
											/>
										</div>
									</div>
									<div className="flexbox-row justify-center">
										<div className="flexbox-column event-info-box">
											<h5>Lieu</h5>
											<input disabled name="place" type="text" defaultValue={this.state.actualEventDetails.place} />
										</div>
										<div className="flexbox-column event-info-box">
											<h5>Catégorie</h5>
											<input disabled name="type" id="eventTypeInput"
												value={this.state.actualEventDetails.name}
											/>
										</div>
									</div>
								</div>
								<div className="event-infos-action-buttons-container flexbox-row justify-end">
									<button className="edit-button" onClick={() => this.setState({ stockEventPopupVisibility: true })}>
										Voir les stocks utilisés
									</button>
									<button className="edit-button" onClick={() => this.setState({ eventBeneficiaryPopupVisibility: true })}>
										Voir les bénéficiaires liés
									</button>
									{
										this.state.cancelEditButton &&
										<button className="delete-button" onClick={() => this.changeEditState(1)}>Annuler</button>
									}
									{
										this.state.editButton && this.state.isEventEditable &&
										<button className="close-button" onClick={() => this.changeEditState(0)}>Modifier</button>
									}
									{
										this.state.saveEditEventButton &&
										<button className="confirm-button" onClick={() => this.saveEditEvent()}>Enregistrer</button>
									}
								</div>
								<div className="event-infos-action-buttons-container flexbox-row">
									<button className="delete-button" onClick={() => this.setState({ deleteEventPopupVisibility: true })}>
										Supprimer
									</button>
									{
										this.state.isUserResponsable === true &&
										<span disabled className="register-event-status-text margin-left-auto">
											Vous êtes le responsable
										</span>
									}
									{
										this.state.isEventEditable && this.state.isUserRegistered === null &&
										<span disabled className="register-event-status-text margin-left-auto">
											En attente des données
										</span>
									}
									{
										this.state.isEventEditable && this.state.isUserRegistered === false && this.state.isUserResponsable !== true &&
										<button className="confirm-button margin-left-auto" onClick={() => this.addMyUserEventContributor()}>
											M'inscrire en tant qu'intervenant
										</button>
									}
									{
										this.state.isEventEditable && this.state.isUserRegistered === true && this.state.isUserResponsable !== true &&
										<button className="delete-button margin-left-auto" onClick={() => this.removeMyUserContributor()}>
											Me désinscrire
										</button>
									}
									{
										!this.state.isEventEditable &&
										<span disabled className="register-event-status-text margin-left-auto">
											Evènement passé
										</span>
									}
								</div>
							</div>
							<div className="event-informations-box contributors-list-container align-center flexbox-column">
								<h3 className="text-center">Intervenants</h3>
								<div id="contributorsGridBox" ref={this.state.wrapperRef} />
							</div>
						</div>
						<div className="event-informations-section flexbox-column">
							<div className="event-informations-box">
								<h5 className="text-center">Itinéraire / Roadmap <br />(La carte affiche l'itinéraire optimisé)</h5>
								<div className="flexbox-column">
									{
										this.state.itineraryPoints.length > 0 && typeof this.state.itineraryPoints === "object" &&
										<ol className="event-itinerary-list">
											{this.state.itineraryPoints.map((point) => {
												return (
													<div className="flexbox-row">
														<li key={point.id.toString()}>{point.address}, {point.city} ({point.zip_code})</li>
													</div>
												);
											})}
										</ol>
									}
									{
										this.state.itineraryPoints.length <= 0 &&
										<h5>Itinéraire / Roadmap vide</h5>
									}
									<div className="event-infos-action-buttons-container flexbox-row justify-start">
										{
											this.state.isEventEditable &&
											<button className="edit-button" onClick={() => this.openEditEventTrajectPopup()}>Accéder au détail</button>
										}
										{
											this.state.itineraryPoints.length > 0 && typeof this.state.itineraryPoints === "object" &&
											<button className="confirm-button" onClick={() => this.downloadRoadmapFile()}>Télécharger</button>
										}
									</div>
								</div>
							</div>
							<div className="event-informations-box" id="mapBoxRoadContainer">
								{
									this.state.itineraryPoints.length > 0 &&
									<Suspense fallback={<h5>coucou</h5>}>
										<MapboxRoad
											setNeedMapReload={(status) => this.setState({ needMapReload: status })}
											geometryString={this.state.geometryString}
											needMapReload={this.state.needMapReload}
											itineraryPoints={this.state.itineraryPoints}
											setPolylineUrl={(value) => this.setState({ polylineValue: value })}
											setBounds={(bounds) => this.setState({ bounds: bounds })}
										/>
									</Suspense>
								}
								{
									this.state.itineraryPoints.length <= 0 &&
									<h5>Pas de carte à afficher</h5>
								}
							</div>
						</div>
					</section>
					{this.state.actualEventDetails.error && <h3 id="eventIdBadValue">{this.state.actualEventDetails.error}</h3>}
					{
						this.state.stockEventPopupVisibility &&
						<StockEventPopup
							eventId={this.props.eventId}
							setVisibilityPopup={() => this.setState({ stockEventPopupVisibility: false })}
						/>
					}
					{
						this.state.eventBeneficiaryPopupVisibility &&
						<EventBeneficiaryPopup
							eventId={this.props.eventId}
							setVisibilityPopup={() => this.setState({ eventBeneficiaryPopupVisibility: false })}
						/>
					}
					{
						this.state.deleteEventPopupVisibility &&
						<DeleteEventPopup
							eventId={this.state.eventId}
							setDeleteEventStatus={() => this.setState({ deleteEventStatus: true })}
							setVisibilityPopup={() => this.setState({ deleteEventPopupVisibility: false })}
						/>
					}
					{
						this.state.errorPopup &&
						<ErrorActionPopup message={this.state.errorMessage} closePopup={() => this.setState({ errorPopup: false })} />
					}
					{
						this.state.loadingPopup &&
						<LoadingPopup />
					}
					{
						this.state.editEventTrajectPopupVisibility && 
						<EventTrajectPopup 
							eventId={this.props.eventId}
							setNeedMapReload={(status) => this.setState({ needMapReload: status })}
							updateItineraryPoints={async() => await this.getItineraryPointsOptimized(this.props.eventId)}
							itineraryPoints={this.state.itineraryPoints}
							setVisibilityPopup={() => this.setState({ editEventTrajectPopupVisibility: false })}
						/>
					}
				</div>
			);
		} else {
			return (
				<div className="module-container events-module-container">
					<div className="module-head events-module-head">
						<span className="material-symbols-outlined arrow-button" onClick={() => this.goBackToEvents()}>arrow_back</span>
						<h2>Evènement n°{this.props.eventId}<br />{this.props.eventName}</h2>
						<h5 style={{ textAlign: "center" }}>Chargement en cours de l'évènement</h5>
					</div>
					{this.state.actualEventDetails.error && <h3 id="eventIdBadValue">{this.state.actualEventDetails.error}</h3>}
				</div>
			);
		}
	}
};

export default ViewEvent;