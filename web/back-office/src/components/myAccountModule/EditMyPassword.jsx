import { Component } from "react";
import "../../css/components.css"
import UtilInputsComponent from "../functionsComponents/UtilInputsComponent";
import ErrorActionPopup from "../functionsComponents/ErrorPopup";
import AuthUser from "../AuthUser";
const baseUrl = require("../../config.json").baseUrl;

class EditMyPasswordPopup extends Component {
    state = {
        userId: (AuthUser.id !== 0) ? AuthUser.id : (this.props.userId) ? this.props.userId : 0,
        message: "Pas de message additionnel",
        errorAction: false,
        errorMessage: "Erreur lors de la modification (Contactez un administrateur si besoin)",
        errorPopup: false,
        types: null,
        confirmPassVisibility: "visibility_off",
        passVisibility: "visibility_off",
        passType: "password",
        confirmPassType: "password"
    };

    async confirmChangePassword() {
        if (UtilInputsComponent.checkInputData("editMyPasswordPopup", "missingValuesEditPassword")) {
            const inputs = document.querySelectorAll("#editMyPasswordPopup input");
            const bodyData = {};
            inputs.forEach((input) => bodyData[input.name] = input.value);
            if (bodyData.confirmedNewPassword !== undefined) delete bodyData.confirmedNewPassword;

            let res = await fetch(`${baseUrl}/users/${this.state.userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(bodyData)
            });
            let resData = await res.json();
            if (resData && !resData.error) {
                this.setState({ message: resData.message });
                this.setState({ errorAction: false });
                this.setState({ errorMessage: "" });
                if (resData.message !== undefined) this.props.closePopup();
            } else {
                this.setState({ errorAction: true });
                if (resData.error) this.setState({ errorMessage: resData.error });
            }
        }
    }

    changeVisibility(pass) {
        if (pass === 1) {
            this.setState({ passVisibility: (this.state.passVisibility === "visibility_off") ? "visibility" : "visibility_off" });
            document.getElementById("newPasswordInput").type = (this.state.passVisibility === "visibility") ? "password" : "text";
        }
        if (pass === 2) {
            this.setState({ confirmPassVisibility: (this.state.confirmPassVisibility === "visibility_off") ? "visibility" : "visibility_off" });
            document.getElementById("confirmPasswordInput").type = (this.state.confirmPassVisibility === "visibility") ? "password" : "text";
        }
    }


    render() {
        if (this.state.userId !== 0) {
            return (
                <div id="editMyPasswordPopup" className="user-module module-popup p-2">
                    <h3 className="text-center">Modifier mon mot de passe</h3>
                    <section id="editMyPasswordContainer" className="user-section flexbox-column">
                        <div className="user-informations-under-section align-center flexbox-column">
                            <div className="user-infos-box description-box">
                                <h6 className="text-center">Mot de passe actuel</h6>
                                <input type="password" name="password" />
                            </div>
                            <div className="user-infos-box new-pwd-box">
                                <h6>Nouveau mot de passe</h6>
                                <div className="flexbox-row align-center">
                                    <input id="newPasswordInput" autoComplete="off" type="password" min={10} max={50} name="newPassword" required />
                                    <span onClick={() => this.changeVisibility(1)} class="material-symbols-outlined">{this.state.passVisibility}</span>
                                </div>
                            </div>
                            <div className="user-infos-box new-pwd-box">
                                <h6>Confirmation du mot de passe</h6>
                                <div className="flexbox-row align-center">
                                    <input id="confirmPasswordInput" autoComplete="off" type="password" min={10} max={50} name="confirmedNewPassword" required />
                                    <span onClick={() => this.changeVisibility(2)} class="material-symbols-outlined">{this.state.confirmPassVisibility}</span>
                                </div>
                            </div>
                        </div>
                        <h5 id="missingValuesEditPassword" className="missing-values-text">Des entrées sont manquantes</h5>
                    </section>
                    <div className="popup-buttons-box flexbox-row">
                        <button onClick={() => this.props.closePopup()} className="delete-button">Annuler</button>
                        <button onClick={() => this.confirmChangePassword()} className="confirm-button">Enregistrer</button>
                    </div>
                    {
                        this.state.errorAction &&
                        <p className="text-center">{this.state.errorMessage}</p>
                    }
                </div>
            );
        } else {
            return (
                <ErrorActionPopup 
                    closePopup={() => this.setState({ errorPopup: false })}
                    message="Impossible de trouver votre utilisateur (Contactez un administrateur)"
                />
            );
        }
    }
};

export default EditMyPasswordPopup;