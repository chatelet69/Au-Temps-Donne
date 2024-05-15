import React, { Component } from "react";
import "../../css/components.css"
const baseUrl = require("../../config.json").baseUrl;

class EditEventStockPopup extends Component {
    state = {
        errorMessage: null,
        stockElementsList: [],
        eventId: this.props.eventId,
        oldAmount: this.props.oldAmount
    };

    closeEditEventStockPopup() { this.props.setVisibilityPopup(); }

    async editStockElement(row) {
        try {
            const eventStockElementId = this.props.elementStockId;
            const stockId = this.props.stockId;
            const newAmount = Number.parseInt(document.getElementById("newAmountStockInput").value);
            if (eventStockElementId >= 0 && stockId >= 0 && newAmount > 0 && newAmount !== this.state.oldAmount) {
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/stockElements/${eventStockElementId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    credentials: "include",
                    body: `newAmount=${newAmount}&stockId=${stockId}`
                });
                const data = await res.json();
                if (data !== null && data.message !== undefined) {
                    this.props.updateGrid();
                    this.closeEditEventStockPopup();
                } else {
                    this.setState({ errorMessage: (data.error) ? data.error : "Erreur durant la modification" });
                }
            }
        } catch (error) {
            console.log(error);
            this.setState({ errorMessage: "Erreur durant la modification" });
        }
    }

    render() {
        return (
            <div id="EditEventStockPopup" className="events-module module-popup">
                <h3>Editer l'élément #{this.props.elementStockId} du stock de l'évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-create-inputs-container event-base-infos">
                        <select name="event_type" id="selectStockElementInput" disabled>
                            <option value={this.props.elementStockId}>{this.props.elementStockName}</option>
                        </select>
                    </div>
                    <div className="event-create-inputs-container event-base-infos">
                        <div>
                            <h5>Montant</h5>
                            <input name="newAmount" defaultValue={this.state.oldAmount} placeholder={this.state.oldAmount} id="newAmountStockInput" type="number" />
                        </div>

                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                {
                    this.state.errorMessage !== null && 
                    <h5 id="errorAddStockEventMessage" className="error-message-alert">{this.state.errorMessage}</h5>
                }
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeEditEventStockPopup()} className="cancel-button">Annuler</button>
                    <button onClick={() => this.editStockElement()} className="confirm-button">Enregistrer</button>
                </div>
            </div>
        );
    }
};

export default EditEventStockPopup;