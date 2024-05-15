import React, { Component } from "react";
import "../../css/components.css"
import { Grid, h } from "gridjs";
import customFr from "../../assets/customFrGrid.ts";
import ErrorActionPopup from "../functionsComponents/ErrorPopup.jsx";
import AddEventBeneficiaryPopup from "./AddEventBeneficiaryPopup.jsx";
const baseUrl = require("../../config.json").baseUrl;

class EventBeneficiaryPopup extends Component {
    grid;
    state = {
        errorPopup: false,
        errorMessage: "Pas de message d'erreur",
        stockElementsCount: 0,
        totalElementsCount: 0,
        wrapperRef: React.createRef(),
        eventId: this.props.eventId,
        AddEventBeneficiaryPopupVisibility: false,
    };

    async deleteBeneficiaryElementAction(row) {
        try {
            const eventBeneficiaryLinkId = Number.parseInt(row._cells[0].data);
            if (eventBeneficiaryLinkId >= 0) {
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/beneficiaries/${eventBeneficiaryLinkId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                const data = await res.json();
                if (data === null || data.error) {
                    this.setState({ errorMessage: (data.error) ? data.error : "Erreur durant la suppression" });
                    this.setState({ errorPopup: true });
                } else {
                    this.updateGrid(true);
                }
            }
        } catch (error) {
            this.setState({ errorMessage: "Erreur durant la suppression" });
            this.setState({ errorPopup: true });
        }
    }

    initDataGrid() {
        this.grid = new Grid().updateConfig({
            columns: [{ name: "Id Link", width: "15%" }, "Id", "Nom", {
                name: 'Supprimer',
                width: "20%",
                formatter: (cell, row) => {
                    return h('span', {
                        className: "material-symbols-outlined cross remove-stock-button",
                        onClick: () => this.deleteBeneficiaryElementAction(row),
                    }, "close");
                },
            }],
            search: false,
            server: {
                method: "GET",
                url: `${baseUrl}/events/event/${this.state.eventId}/beneficiaries`,
                credentials: "include",
                then: data => data.beneficiaries.map(beneficiary => [
                    beneficiary.id, beneficiary.beneficiaryId, beneficiary.name + " " + beneficiary.lastname
                ])
            },
            style: { table: { "text-align": "center" }, },
            sort: true,
            pagination: { limit: 3 },
            language: customFr
        });
        this.grid.render(this.state.wrapperRef.current);
    }

    updateGrid() {
        this.state.wrapperRef.current.innerHTML = "";
        this.grid.updateConfig({
            server: {
                method: "GET",
                url: `${baseUrl}/events/event/${this.state.eventId}/beneficiaries`,
                credentials: "include",
                then: data => data.beneficiaries.map(beneficiary => [
                    beneficiary.id, beneficiary.name + " " + beneficiary.lastname
                ])
            },
        });
        this.grid.render(this.state.wrapperRef.current);
        this.grid.forceRender();
    }

    async componentDidMount() {
        this.initDataGrid(false);
    }

    openAddStockElementPopup() {
        this.setState({ AddEventBeneficiaryPopupVisibility: true });
    }

    closeEventBeneficiaryPopup() {
        this.props.setVisibilityPopup(false);
    }

    render() {
        return (
            <div id="EventBeneficiaryPopup" className="events-module module-popup">
                <h3>Bénéficiaires liés à l'évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-option-box event-create-contributors-container contributors-list flexbox-column">
                        <button onClick={() => this.openAddStockElementPopup()} className="event-option-add-button" id="addBeneficiaryButton">
                            Ajouter un bénéficiaire
                        </button>
                        <div id="stockElementsContainer">
                            <div id="stockElementsGridbox" ref={this.state.wrapperRef} />
                        </div>
                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeEventBeneficiaryPopup()} className="cancel-button">Fermer</button>
                </div>
                {
                    this.state.errorPopup &&
                    <ErrorActionPopup message={this.state.errorMessage} closePopup={() => this.setState({ errorPopup: false })} />
                }
                {
                    this.state.AddEventBeneficiaryPopupVisibility &&
                    <AddEventBeneficiaryPopup
                        eventId={this.props.eventId}
                        setVisibilityPopup={() => this.setState({ AddEventBeneficiaryPopupVisibility: false })}
                        updateGrid={() => this.updateGrid()}
                    />
                }
            </div>
        );
    }
};

export default EventBeneficiaryPopup;