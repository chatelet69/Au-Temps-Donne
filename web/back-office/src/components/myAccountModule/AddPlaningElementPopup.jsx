import { Component } from "react";
import "../../css/components.css"
import SuccessActionPopup from "../functionsComponents/SuccessActionPopup";
import UtilInputsComponent from "../functionsComponents/UtilInputsComponent";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
const baseUrl = require("../../config.json").baseUrl;

class AddPlaningElementPopup extends Component {
    state = {
        userId: this.props.userId,
        successPopup: false,
        message: "Pas de message additionnel",
        errorMessage: "Erreur lors de l'ajout",
        hasClosedSuccessPopup: false,
        userFiles: null,
        types: null,
        dispoType: "disponibility"
    };

    closeAccessUserPopup() { this.props.setVisibilityPopup(false); }

    async confirmAddPlanningElement() {
        if (UtilInputsComponent.checkInputData("addPlanningInputsContainer", "missingValuesPlanning")) {
            const inputs = document.querySelectorAll("#addPlanningInputsContainer input, #addPlanningInputsContainer select");
            const bodyData = {};
            inputs.forEach((input) => bodyData[input.name] = input.value);
            bodyData.disponibility_type = this.state.dispoType;

            let res = await fetch(`${baseUrl}/api/volunteer/addNewDisponibility`, {
                method: "POST",
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

    async componentDidMount() {
        const data = await UtilInputsComponent.getAllEventTypes();
        if (data !== null) this.setState({ types: data });
    }

    async componentDidUpdate() {
        if (this.state.hasClosedSuccessPopup === true) {
            this.props.closePopup();
            this.props.userPlanningUpdated();
        }
    }

    changeDispoType = (changeType) => this.setState({ dispoType: changeType.target.value });

    render() {
        if (this.state.userId) {
            return (
                <div id="addPlaningPopup" className="user-module module-popup">
                    <h3 className="text-center">Ajouter un élément à mon planning</h3>
                    <section id="addPlanningInputsContainer" className="user-section flexbox-column">
                        <div className="user-informations-under-section flexbox-row">
                            <div className="user-infos-box description-box">
                                <h6>Description</h6>
                                <input type="text" name="description" />
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
                                <input required pattern="\d{4}/\d{2}/\d{2}" defaultValue={new Date().toISOString().slice(0, 16)} min={new Date().toISOString().slice(0, 16)} type="datetime-local" max={255} name="startDate" />
                            </div>
                            <div className="user-infos-box email-box">
                                <h6>Date & Heure de fin</h6>
                                <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} max={255} name="endDate" required />
                            </div>
                        </div>
                        <h5 id="missingValuesPlanning" className="missing-values-text">Des entrées sont manquantes</h5>
                    </section>
                    <div className="popup-buttons-box flexbox-row">
                        <button onClick={() => this.props.closePopup()} className="delete-button">Annuler</button>
                        <button onClick={() => this.confirmAddPlanningElement()} className="confirm-button">Enregistrer</button>
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
        }
    }
};

export default AddPlaningElementPopup;