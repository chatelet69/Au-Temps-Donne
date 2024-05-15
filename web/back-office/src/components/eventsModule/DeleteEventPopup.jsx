import { Component } from "react";
import "../../css/components.css"
const baseUrl = require("../../config.json").baseUrl;

class DeleteEventPopup extends Component {
    state = {
        eventId: this.props.eventId,
        errorMessage: null,
    };

    closeDeleteEventPopup() { this.props.setVisibilityPopup(false); }

    async confirmDeleteEvent() {
        let res = await fetch(`${baseUrl}/events/event/${this.state.eventId}`, {
            method: "DELETE",
            credentials: "include",
        })
        let resData = await res.json();
        if (resData && resData.message === "success") {
            this.props.setDeleteEventStatus();
            this.closeDeleteEventPopup();
        } else {
            this.setState({ errorMessage: (resData.error) ? resData.error : "Erreur durant la suppression (Contactez un administrateur si besoin)" });
        }
    }

    render() {
        return (
            <div id="deleteEventPopup" className="events-module module-popup">
                <h3>Suppresion de l'évènement n°{this.state.eventId}</h3>
                <section className="event-create-form flexbox-column">
                    <div className="event-create-inputs-container event-base-infos">
                        <h1>Etes-vous sûr de vouloir supprimer l'évènement ?</h1>
                    </div>
                </section>
                <div className="popup-buttons-box">
                    <button onClick={() => this.closeDeleteEventPopup()} className="cancel-button">Annuler</button>
                    <button onClick={() => this.confirmDeleteEvent()} className="delete-button">Confirmer</button>
                </div>
                {
                    this.state.errorMessage !== null &&
                    <h6>{this.state.errorMessage}</h6>
                }
            </div>
        );
    }
};

export default DeleteEventPopup;