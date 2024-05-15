import React, { Component } from "react";
import "../../css/components.css"
const baseUrl = require("../../config.json").baseUrl;

class AddEventBeneficiaryPopup extends Component {
    state = {
        errorMessage: null,
        beneficiariesList: [],
        eventId: this.props.eventId,
    };

    async componentDidMount() {
        await this.getBeneficiariesList();
    }

    closeAddEventBeneficiaryPopup() { this.props.setVisibilityPopup(); }

    addBeneficiary = async () => {
        try {
            const beneficiaryIdToAdd = Number.parseInt(document.getElementById("selectBeneficiaryInput").value);
            if (beneficiaryIdToAdd !== 0 && !isNaN(beneficiaryIdToAdd) && beneficiaryIdToAdd !== "") {
                console.log(beneficiaryIdToAdd);
                const res = await fetch(`${baseUrl}/events/event/${this.state.eventId}/beneficiaries`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `beneficiaryId=${beneficiaryIdToAdd}`
                });
                const data = await res.json();

                // If the addition was successful, we call the parent's reload function
                if (data && !data.error && data.message) {
                    this.closeAddEventBeneficiaryPopup();
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

    getBeneficiariesList = async () => {
        try {
            const res = await fetch(`${baseUrl}/users/search/by?rank=2`, { credentials: "include" });
            const data = await res.json();
            if (data && data.count && data.count > 0) this.setState({ beneficiariesList: data.users });
        } catch (error) {
            this.setState({ beneficiariesList: [] });
        }
    }

    handleChangeSelectedBenef() {
        const inputId = document.getElementById("beneficiaryIdInput");
        const select = document.getElementById("selectBeneficiaryInput");
        inputId.value = (select.value !== "") ? select.value : "";
    }

    render() {
        return (
            <div id="AddEventBeneficiaryPopup" className="events-module module-popup">
                <h3>Ajouter un bénéficiaire à l'évènement</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-create-inputs-container event-base-infos">
                        <select name="event_type" id="selectBeneficiaryInput" onChange={() => this.handleChangeSelectedBenef()}>
                            <option value="">Bénéficiaire à choisir</option>
                            {
                                this.state.beneficiariesList.map((beneficiary) =>
                                    <option key={beneficiary.id} value={beneficiary.id}>
                                        {beneficiary.name + " " + beneficiary.lastname}
                                    </option>
                                )
                            }
                        </select>
                    </div>
                    <div className="event-create-inputs-container event-base-infos">
                        <div>
                            <h5>ID du bénéficiaire</h5>
                            <input name="beneficiaryId" id="beneficiaryIdInput" type="number" disabled/>
                        </div>
                    </div>
                </section>
                <h5 id="forgotValuesNewEvent">Des entrées sont manquantes</h5>
                {
                    this.state.errorMessage !== null && 
                    <h5 id="errorAddEventBeneficiaryMessage" className="error-message-alert">{this.state.errorMessage}</h5>
                }
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeAddEventBeneficiaryPopup()} className="cancel-button">Annuler</button>
                    <button onClick={() => this.addBeneficiary()} className="confirm-button">Confirmer</button>
                </div>
            </div>
        );
    }
};

export default AddEventBeneficiaryPopup;