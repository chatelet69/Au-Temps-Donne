import React from "react";
import "../../css/donation.css"
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import confetti from "canvas-confetti";

const baseUrl = require("../../config.json").baseUrl
const CheckOutContainer=()=>{
    const stripe = useStripe();
    const elements = useElements();

        const makeConfetti = () => {
            const duration = 10 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = {
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                zIndex: 0,
            };

            function randomInRange(min, max) {
                return Math.random() * (max - min) + min;
            }

            let interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
                });
            }, 250);
        };

        

    const handleSubmit = async(event)=>{
        event.preventDefault();
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: "card",
            card: elements.getElement(CardElement)
        })
        let name = document.getElementById("name").value
        let lastname = document.getElementById("lastname").value
        let email = document.getElementById("email").value
        let address = document.getElementById("address").value
        let amount = document.getElementById("amount").value
        let type = document.getElementById("type").value
        if(!error){
            try {
                const { id } = paymentMethod
                const response = await fetch(`${baseUrl}/api/invoices/donate`, {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: `amount=${amount}&cardId=${id}&name=${name}&lastname=${lastname}&email=${email}&address=${address}&type=${type}`
                })
                let result = await response.json()
                if(result.error){
                    document.getElementById("errorMsg").textContent = result.error
                }else{
                    makeConfetti();
                    document.getElementById("successMsg").textContent = "Merci beaucoup pour votre don !"
                    document.getElementById("errorMsg").textContent = ""
                }
            } catch (error) {
                document.getElementById("errorMsg").textContent = error
                console.log("Error when fetching API : " + error)
            }
        }
    }
    return(
        <form onSubmit={handleSubmit} className="donationForm">
            <h2 className="titlePopUpDonation">Faire un don</h2>
            <div className="inputDonationBox">
                <label htmlFor="name">Prénom</label>
                <input className="inputDonation" type="text" id="name" name="name"/>
            </div>
            <div className="inputDonationBox">
                <label htmlFor="lastname">Nom de famille</label>
                <input className="inputDonation" type="text" id="lastname" name="lastname"/>
            </div>
            <div className="inputDonationBox">
                <label htmlFor="email">Email</label>
                <input className="inputDonation" type="text" id="email" name="email"/>
            </div>
            <div className="inputDonationBox">
                <label htmlFor="address">Adresse</label>
                <input className="inputDonation" type="text" id="address" name="address"/>
            </div>
            <div className="inputDonationBox">
                <label htmlFor="amount">Montant</label>
                <input className="inputDonation" type="number" id="amount" name="amount"/>
            </div>
            <div className="inputDonationBox">
                <label htmlFor="type">Type de don :</label>
                <select className="inputDonation" name="type" id="type">
                    <option value="0">Don ponctuel</option>
                    <option value="1">Don mensuel</option>
                </select>
            </div>
            <p>Carte bancaire :</p>
            <div className="cardBox">
                <CardElement // voir les options dans la doc
                    options={{
                        style:{
                            base: {
                                fontSize: "16px",
                                color: "black", // couleur de texte noire
                                "::placeholder": {
                                    color: "black"
                                },
                            }
                        },
                        hidePostalCode: true // Pas besoin de mettre le code postal avec la carte
                    }}
                    />
            </div>
            <div className="btnDonationBox">
                <button className="btnPayDonation">Payer</button>
            </div>
            <p id="errorMsg"></p>
            <p id="successMsg"></p>
        </form>
    )
}
export default CheckOutContainer