import React, { Component } from "react";
import "../../css/components.css"
const baseUrl = require("../../config.json").baseUrl;

class AddStockElementPopup extends Component {
    state = {
        errorMessage: null,
        stockElementsList: [],
        eventId: this.props.eventId,
    };

    async componentDidMount() {
        await this.getStockElements();
    }

    closeAddStockElementPopup() { this.props.setVisibilityPopup(); }

    addElementStock = async () => {
        try {
            const stockIdToAdd = Number.parseInt(document.getElementById("selectStockElementInput").value);
            const amount = Number.parseInt(document.getElementById("amountStockInput").value);
            if (amount >= 0 && stockIdToAdd !== 0 && stockIdToAdd !== NaN) {
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/stockElements`, {
                    method: "POST",
                    mode: "cors",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `stockId=${stockIdToAdd}&amount=${amount}`
                });
                const data = await res.json();

                // If the addition was successful, we call the parent's reload function
                if (data && !data.error && data.message) {
                    this.closeAddStockElementPopup();
                    this.setState({ errorMessage: null });
                    this.props.updateGrid();
                } else {
                    this.setState({ errorMessage: data.error });
                }
            }
        } catch (error) {
            this.setState({ errorMessage: "Erreur du serveur durant l'opération" });
        }
    }

    getStockElements = async () => {
        try {
            const res = await fetch(`${baseUrl}/api/warehouse/getTotalStock`, { credentials: "include" });
            const data = await res.json();
            if (data && data.count && data.count > 0) this.setState({ stockElementsList: data.stock });
        } catch (error) {
            this.setState({ stockElementsList: [] });
        }
    }

    render() {
        return (
            <div id="AddStockElementPopup" className="events-module module-popup">
                <h3>Ajouter un élément au stock de l'évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-create-inputs-container event-base-infos">
                        <select name="event_type" id="selectStockElementInput">
                            <option value="">Elément à choisir</option>
                            {
                                this.state.stockElementsList.map((stockType) =>
                                    <option key={stockType.stockId} value={stockType.stockId}>
                                        {stockType.title.length > 35 && (stockType.title.slice(0, 35) + "...")}
                                        {stockType.title.length < 35 && stockType.title}
                                    </option>
                                )
                            }
                        </select>
                    </div>
                    <div className="event-create-inputs-container event-base-infos">
                        <div>
                            <h5>Montant</h5>
                            <input name="stock_amount" defaultValue={1} min={1} id="amountStockInput" type="number" />
                        </div>

                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                {
                    this.state.errorMessage !== null && 
                    <h5 id="errorAddStockEventMessage" className="error-message-alert">{this.state.errorMessage}</h5>
                }
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeAddStockElementPopup()} className="cancel-button">Annuler</button>
                    <button onClick={() => this.addElementStock()} className="confirm-button">Confirmer</button>
                </div>
            </div>
        );
    }
};

export default AddStockElementPopup;