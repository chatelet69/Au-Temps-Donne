import React, { Component } from "react";
import "../../css/components.css"
import { Grid, h } from "gridjs";
import customFr from "../../assets/customFrGrid.ts";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import LoadingPopup from "../functionsComponents/LoadingPopup.jsx";
import InputsEditComponent from "../functionsComponents/UtilInputsComponent.jsx";
const baseUrl = require("../../config.json").baseUrl;

class EventTrajectPopup extends Component {
    grid;
    state = {
        errorPopup: false,
        errorMessage: "Pas de message d'erreur",
        wrapperRef: React.createRef(),
        eventId: this.props.eventId,
        addTrajectElementVisibility: false,
        editTrajectElementVisibility: false,
        addElementTrajectMessage: null,
        deliverStockElement: false,
        linkIdToDelete: 0,
        removeTrajectElementVisibility: false,
        loadingPopup: false,
        needReload: false
    };

    deleteTrajectElementAction(row) {
        this.setState({ linkIdToDelete: Number.parseInt(row._cells[0].data) });
        this.setState({ addElementTrajectMessage: null });
        this.setState({ removeTrajectElementVisibility: true });
    }

    editTrajectElementAction(row) {
        this.setState({ linkIdEdit: Number.parseInt(row._cells[0].data) });
        this.setState({ cityToEdit: row._cells[1].data });
        this.setState({ addressToEdit: row._cells[2].data });
        this.setState({ zipCodeToEdit: row._cells[3].data });
        this.setState({ addElementTrajectMessage: null });
        this.setState({ editTrajectElementVisibility: true });
    }

    showDeleteTrajectElement = () => {
        return (
            <div id="RemoveTrajectElementPopup" className="module-popup flexbox-column justify-center text-center">
                <h4>Supprimer ce point du trajet</h4>
                <div className="flexbox-row justify-around">
                    <button className="cancel-button" onClick={() => this.setState({ removeTrajectElementVisibility: false })}>Annuler</button>
                    <button className="delete-button" onClick={() => this.deleteTrajectElement()}>Confirmer</button>
                </div>
                {
                    this.state.addElementTrajectMessage !== null &&
                    <p className="error-message-alert text-center">{this.state.addElementTrajectMessage}</p>
                }
            </div>
        );
    }

    showEditTrajectElement = () => {
        return (
            <div id="EditTrajectElementPopup" className="module-popup flexbox-column justify-center text-center">
                <h4>Edition du point</h4>
                <div className="flexbox-column align-center event-create-form input">
                    <p>ID : {this.state.linkIdEdit}</p>
                    <input name="city" type="text" id="addTrajectElementCityInput" placeholder={this.state.cityToEdit} defaultValue={this.state.cityToEdit} />
                    <input name="address" type="text" id="addTrajectElementAddressInput" placeholder={this.state.addressToEdit} defaultValue={this.state.addressToEdit} />
                    <input name="zip_code" type="text" id="addTrajectElementZipcodeInput" placeholder={this.state.zipCodeToEdit} defaultValue={this.state.zipCodeToEdit} />
                </div>
                <div className="flexbox-row justify-around">
                    <button className="cancel-button" onClick={() => this.setState({ editTrajectElementVisibility: false })}>Annuler</button>
                    <button className="confirm-button" onClick={() => this.editTrajectElement()}>Enregistrer</button>
                </div>
                {
                    this.state.addElementTrajectMessage !== null &&
                    <p className="error-message-alert text-center">{this.state.addElementTrajectMessage}</p>
                }
            </div>
        );
    }

    async editTrajectElement() {
        try {
            if (this.state.linkIdEdit > 0) {
                const bodyData = InputsEditComponent.getEditedValues("EditTrajectElementPopup");
                if (Object.keys(bodyData).length > 0) {
                    this.setState({ loadingPopup: true });
                    const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/trajectPoint/${this.state.linkIdEdit}`, {
                        method: "PATCH",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(bodyData)
                    });
                    const data = await res.json();
                    if (data === null || data.error) {
                        this.setState({ addElementTrajectMessage: (data.error) ? data.error : "Erreur durant la suppresion" });
                    } else {
                        this.setState({ addElementTrajectMessage: null });
                        this.setState({ editTrajectElementVisibility: false });
                        await this.props.updateItineraryPoints();
                        this.setState({ loadingPopup: false });
                        this.setState({ needReload: true });
                        this.props.setNeedMapReload(true);
                    }
                }
            }
        } catch (error) {
            this.setState({ addElementTrajectMessage: "Erreur durant l'opération" });
        }
    }

    async deleteTrajectElement() {
        try {
            if (this.state.linkIdToDelete > 0) {
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/trajectPoint/${this.state.linkIdToDelete}`, {
                    method: "DELETE",
                    credentials: "include"
                });
                const data = await res.json();
                if (data === null || data.error) {
                    this.setState({ addElementTrajectMessage: (data.error) ? data.error : "Erreur durant la suppresion" });
                } else {
                    this.setState({ addElementTrajectMessage: null });
                    this.setState({ removeTrajectElementVisibility: false });
                    await this.props.updateItineraryPoints();
                    this.updateGrid();
                    this.props.setNeedMapReload(true);
                }
            }
        } catch (error) {
            this.setState({ addElementTrajectMessage: "Erreur durant l'opération" });
        }
    }

    showAddTrajectElement = () => {
        return (
            <div id="addEventElementTrajectPopup" className="module-popup flexbox-column justify-center text-center">
                <h4>Ajouter un point au trajet</h4>
                <div className="flexbox-column align-center event-create-form input">
                    <input type="text" id="addTrajectElementCityInput" placeholder="Ville" />
                    <input type="text" id="addTrajectElementAddressInput" placeholder="Adresse" />
                    <input type="text" id="addTrajectElementZipcodeInput" placeholder="Code postal" />
                </div>
                <div className="flexbox-row justify-around">
                    <button className="cancel-button" onClick={() => this.setState({ addTrajectElementVisibility: false })}>Annuler</button>
                    <button className="confirm-button" onClick={() => this.addTrajectElement()}>Confirmer</button>
                </div>
                {
                    this.state.addElementTrajectMessage !== null &&
                    <p className="error-message-alert text-center">{this.state.addElementTrajectMessage}</p>
                }
            </div>
        );
    }

    async addTrajectElement() {
        try {
            const city = document.getElementById("addTrajectElementCityInput");
            const zipCode = document.getElementById("addTrajectElementZipcodeInput");
            const address = document.getElementById("addTrajectElementAddressInput");

            if (city !== null && zipCode !== undefined && address !== null) {
                const bodyData = {
                    city: city.value,
                    zip_code: zipCode.value,
                    address: address.value
                };

                this.setState({ loadingPopup: true });
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/addTrajectPoint`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(bodyData)
                });
                const data = await res.json();
                if (data === null || data.error) {
                    this.setState({ addElementTrajectMessage: (data.error) ? data.error : "Erreur durant l'ajout" });
                } else {
                    await this.props.updateItineraryPoints();
                    this.updateGrid();
                    this.setState({ addTrajectElementVisibility: false });
                    this.setState({ addElementTrajectMessage: null });
                    this.setState({ loadingPopup: false });
                    this.props.setNeedMapReload(true);
                }
            }
        } catch (error) {
            this.setState({ addElementTrajectMessage: "Erreur durant l'ajout" });
        }
    }

    initDataGrid() {
        this.grid = new Grid().updateConfig({
            columns: [
                { name: "id", id: "id", hidden: true },
                { name: "Ville", id: "city" },
                { name: "Adresse", id: "address" },
                { name: "Code postal", id: "zip_code" },
                {
                    formatter: (cell, row) => {
                        return h('span', {
                            className: "material-symbols-outlined cross remove-stock-button",
                            onClick: () => this.deleteTrajectElementAction(row),
                        }, "close");
                    },
                },
                {
                    formatter: (cell, row) => {
                        return h('span', {
                            className: "material-symbols-outlined edit-stock-button",
                            onClick: () => this.editTrajectElementAction(row),
                        }, "edit");
                    },
                }],
            search: false,
            data: this.props.itineraryPoints,
            style: { table: { "text-align": "center" }, },
            sort: true,
            pagination: { limit: 3 },
            language: customFr
        });
        this.grid.render(this.state.wrapperRef.current);
    }

    updateGrid() {
        this.state.wrapperRef.current.innerHTML = "";
        this.grid.updateConfig({ data: this.props.itineraryPoints });
        this.grid.render(this.state.wrapperRef.current);
        this.grid.forceRender();
    }

    componentDidMount() {
        this.initDataGrid();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.itineraryPoints.length !== this.props.itineraryPoints.length || this.state.needReload) this.updateGrid();
        if (this.state.needReload) this.setState({ needReload: false });
    }

    openAddTrajectElementPopup = () => this.setState({ addTrajectElementVisibility: true });

    closeEventTrajectPopup = () => this.props.setVisibilityPopup(false);

    render() {
        if (this.props.itineraryPoints !== null && this.props.eventId) {
            return (
                <div id="EventTrajectPopup" className="events-module module-popup">
                    <h3>Trajet de l'évènement</h3>
                    <section className="event-create-form flexbox-column">
                        <div className="event-option-box event-create-contributors-container contributors-list flexbox-column">
                            <button onClick={() => this.openAddTrajectElementPopup()} className="event-option-add-button" id="addStockElementButton">
                                Ajouter un élément
                            </button>
                            <div className="" id="stockElementsContainer">
                                <div id="stockElementsGridbox" ref={this.state.wrapperRef} />
                            </div>
                        </div>
                    </section>
                    <div className="popup-buttons-box">
                        <button onClick={() => this.closeEventTrajectPopup()} className="cancel-button">Fermer</button>
                    </div>
                    {
                        this.state.errorPopup &&
                        <ErrorActionPopup message={this.state.errorMessage} closePopup={() => this.setState({ errorPopup: false })} />
                    }
                    {
                        this.state.addTrajectElementVisibility &&
                        this.showAddTrajectElement()
                    }
                    {
                        this.state.removeTrajectElementVisibility &&
                        this.showDeleteTrajectElement()
                    }
                    {
                        this.state.editTrajectElementVisibility &&
                        this.showEditTrajectElement()
                    }
                    {
						this.state.loadingPopup &&
						<LoadingPopup />
					}
                </div>
            );
        }
    }
};

export default EventTrajectPopup;