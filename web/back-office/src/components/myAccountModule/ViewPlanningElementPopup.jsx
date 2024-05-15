import { Component } from "react";
import "../../css/components.css"
import SuccessActionPopup from "../functionsComponents/SuccessActionPopup";
import UtilInputsComponent from "../functionsComponents/UtilInputsComponent";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
const baseUrl = require("../../config.json").baseUrl;

class ViewPlanningElementPopup extends Component {
    state = {
        userId: this.props.userId,
        planningIdToGet: (this.props.planningIdToGet) ? this.props.planningIdToGet : 0,
        planning: (this.props.planning) ? this.props.planning : {},
        successPopup: false,
        message: "Pas de message additionnel",
        errorMessage: "Erreur lors de la modification",
        hasClosedSuccessPopup: false,
        types: null,
        dispoType: "disponibility"
    };

    closeAccessUserPopup() { this.props.setVisibilityPopup(false); }

    async confirmEditPlanningElement() {
        let edited = UtilInputsComponent.getEditedValues("editPlanningFormContainer");
        if (edited && Object.keys(edited).length > 0 &&
            UtilInputsComponent.checkInputData("editPlanningFormContainer", "missingValuesPlanning")) {
            const inputs = document.querySelectorAll("#editPlanningFormContainer input, #editPlanningFormContainer select");
            const bodyData = {};
            inputs.forEach((input) => bodyData[input.name] = input.value);
            bodyData.disponibility_type = this.state.dispoType;

            let res = await fetch(`${baseUrl}/api/volunteers/disponibility/`+this.state.planning.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bodyData)
            })
            let resData = await res.json();
            if (resData && !resData.error) {
                // Show Success Popup
                this.setState({ message: resData.message });
                this.setState({ successPopup: true });
            } else {
                // Show Error Popup
                if (resData.error) this.setState({ errorMessage: resData.error });
                this.setState({ errorPopup: true });
            }
        }
    }

    async getPlanning() {
        try {
            if (this.state.planningIdToGet !== 0) {
                let res = await fetch(`${baseUrl}/api/volunteers/disponibility/`+this.state.planningIdToGet, { credentials: "include" });
                let resData = await res.json();
                if (resData && !resData.error) {
                    this.setState({ planning: resData });
                } else {
                    if (resData.error) this.setState({ errorMessage: resData.error });
                    this.setState({ errorPopup: true });
                }
            }
        } catch (error) { return ; }
    }

    async componentDidMount() {
        const data = await UtilInputsComponent.getAllEventTypes();
        if (data !== null) this.setState({ types: data });
        if (this.state.planning.hasOwnProperty("disponibility_type")) {
            let dispoType = (this.state.planning.disponibility_type === 1) ? "disponibility" : "activity"
            this.setState({ dispoType: dispoType });
        }

        if (this.state.planningIdToGet !== 0) await this.getPlanning();
    }

    async componentDidUpdate() {
        if (this.state.hasClosedSuccessPopup === true) {
            this.props.closePopup();
            if (this.props.userPlanningUpdated) this.props.userPlanningUpdated();
        }
    }

    changeDispoType = (changeType) => this.setState({ dispoType: changeType.target.value });

    render() {
        if (this.state.userId && this.state.planning.id) {
            return (
                <div id="addPlaningPopup" className="user-module module-popup">
                    <h3 className="text-center">Élément de mon planning</h3>
                    <section id="editPlanningFormContainer" className="user-section flexbox-column">
                        <h5 className="text-center">Identifiant : {this.state.planning.id}</h5>
                        <div className="user-informations-under-section flexbox-row">
                            <div className="user-infos-box description-box">
                                <h6>Description</h6>
                                <input defaultValue={this.state.planning.description} placeholder={this.state.planning.description} type="text" name="description" />
                            </div>
                            <div className="user-infos-box dispo-type-box">
                                <h6>Type</h6>
                                <div className="flexbox-row dispo-type-inputs">
                                    <input onChange={this.changeDispoType} value="disponibility" type="radio" id="dispoTypeInput" 
                                    name="disponibility_type" checked={this.state.dispoType === "disponibility"} />
                                    <label for="dispoTypeInput">Disponibilité</label>
                                    <input onChange={this.changeDispoType} value="activity" type="radio" id="activityTypeInput" 
                                    name="disponibility_type" checked={this.state.dispoType === "activity"} />
                                    <label for="activityTypeInput">Activité</label>
                                </div>
                            </div>
                            {this.state.dispoType === "activity" &&
                                <div className="user-infos-box disponibility-type-name-box">
                                    <h6>Type d'activité</h6>
                                    <select name="type">
                                        <option value="">Choisir type</option>
                                        {this.state.types !== null &&
                                            this.state.types.map((eventType) =>
                                                <option key={eventType.name} value={eventType.name}>
                                                    {eventType.name[0].toUpperCase() + eventType.name.replaceAll("_", " ").slice(1)}
                                                </option>
                                            )
                                        }
                                    </select>
                                </div>
                            }
                        </div>
                        <div className="user-informations-under-section flexbox-row">
                            <div className="user-infos-box email-box">
                                <h6>Date & Heure de début</h6>
                                <input required pattern="\d{4}/\d{2}/\d{2}" defaultValue={this.state.planning.datetime_start} 
                                min={new Date().toISOString().slice(0, 16)} type="datetime-local" max={255} name="startDate" />
                            </div>
                            <div className="user-infos-box email-box">
                                <h6>Date & Heure de fin</h6>
                                <input type="datetime-local" defaultValue={this.state.planning.datetime_end} 
                                min={new Date().toISOString().slice(0, 16)} max={255} name="endDate" required />
                            </div>
                        </div>
                        <h5 id="missingValuesPlanning" className="missing-values-text">Des entrées sont manquantes</h5>
                    </section>
                    <div className="popup-buttons-box flexbox-row">
                        <button onClick={() => this.props.closePopup()} className="delete-button">Annuler</button>
                        <button onClick={() => this.confirmEditPlanningElement()} className="confirm-button">Enregistrer</button>
                    </div>
                    {this.state.successPopup &&
                        <SuccessActionPopup
                            setSuccessActionPopup={() => this.setState({ successPopup: false })}
                            message={this.state.message}
                            setCloseStatus={() => this.setState({ hasClosedSuccessPopup: true })}
                        />
                    }
                    {this.state.errorPopup &&
                        <ErrorActionPopup
                            closePopup={() => this.setState({ errorPopup: false })}
                            message={this.state.errorMessage}
                        />
                    }
                </div>
            );
        } else {
            return (
                <div id="createNewEventPopup" className="events-module module-popup text-center">
                    <h3>Récupération de l'élément du planning</h3>
                    <div><span className="sync-icon material-symbols-outlined">sync</span></div>
                </div>
            );
        }
    }
};

export default ViewPlanningElementPopup;