import { Component } from "react";
const baseUrl = require("../config.json").baseUrl;

class ForgetPasswordView extends Component {
    state = {
        processStep: 1,
        errorMessage: null,
        code: 0,
        email: null,
        loading: false
    };

    async requestVerifCode() {
        try {
            const email = document.getElementById("forgetPassEmailInput").value;
            this.setState({ errorMessage: null });
            if (email.length > 0) {
                this.setState({ email: email });
                this.setState({ loading: true });
                const res = await fetch(`${baseUrl}/askForgotPassCode`, {
                    method: "POST",
                    mode: "cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `email=${email}`
                });
                const data = await res.json();
                if (data && data.error === undefined) {
                    this.setState({ processStep: 2 });
                    this.setState({ loading: false });
                } else this.setState({ errorMessage: data.error });
            }
        } catch (error) { }
    }

    async sendNewPassword() {
        try {
            const password = document.getElementById("forgetPassPasswordInput").value;
            this.setState({ errorMessage: null });
            if (password.length > 8) {
                const res = await fetch(`${baseUrl}/resetPassword`, {
                    method: "POST",
                    mode: "cors",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `password=${password}&code=${this.state.code}&email=${this.state.email}`
                });
                const data = await res.json();
                if (data && data.error === undefined) this.props.setForgetPasswordVisibility(false);
                else this.setState({ errorMessage: data.error });
            } else {
                this.setState({ errorMessage: "Le mot de passe doit faire au moins 8 caractères" });
            }
        } catch (error) { this.setState({ errorMessage: "Erreur durant l'opération" }); };
    }

    handleCodeInput() {
        const input = document.getElementById("forgetPassCodeInput");
        if (input !== null && input.value.length === 5) {
            this.setState({ processStep: 3 });
            this.setState({ code: input.value });
        } else {
            this.setState({ processStep: 2 });
        }
    }

    render() {
        return (
            <section id='forgetPasswordBox'>
                {
                    this.state.processStep === 1 &&
                    <div className="forget-password-box">
                        <h5>Un mail contenant un code vous sera envoyé.</h5>
                        <input id='forgetPassEmailInput' placeholder='Email' name='forgetPassEmail' type='text' min={1} max={255} />
                        <button onClick={() => this.requestVerifCode()}>Recevoir le code</button>
                        <button id='cancelForgetPasswordButton' onClick={() => this.props.setForgetPasswordVisibility(false)}>Annuler</button>
                    </div>
                }
                {
                    this.state.processStep >= 2 &&
                    <div className="forget-password-box">
                        <h5>Entrez le code reçu par mail</h5>
                        <input id='forgetPassCodeInput' onChange={() => this.handleCodeInput()} placeholder='Code' type='text' />
                    </div>
                }
                {
                    this.state.processStep === 3 &&
                    <div className="forget-password-box">
                        <h5>Entrez votre mot de passe</h5>
                        <input id='forgetPassPasswordInput' placeholder='Mot de passe' name='password' type='password' min={8} />
                        <button onClick={() => this.sendNewPassword()}>Confirmer</button>
                    </div>
                }
                {
                    this.state.loading &&
                    <div className="text-center">
                        <span className="sync-icon material-symbols-outlined">sync</span>
                    </div>
                }
                {
                    this.state.errorMessage !== null &&
                    <p className="text-center">{this.state.errorMessage}</p>
                }
            </section>
        );
    }
}

export default ForgetPasswordView;