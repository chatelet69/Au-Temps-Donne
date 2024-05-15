import { Component } from "react";
const baseUrl = require("../../config.json").baseUrl;

class InputsEditComponent extends Component {
    static getEditedValues(containerId) {
        let data = {};
        let inputs = document.querySelectorAll(`#${containerId} input, #${containerId} select`);
        inputs.forEach((element) => {
            // Check les placeholder / defaultValue pour voir si la valeur a été modifiée
            if (element.type === "datetime-local") {
                const formated = element.value.split("T")[0] + " " + element.value.split("T")[1];
                if (formated.localeCompare(element.defaultValue) !== 0) data[element.name] = element.value;
            } else if (element.value && element.value.length > 0) {
                const placeholder = element.getAttribute("placeholder");
                if (placeholder && placeholder.length > 0 && placeholder !== element.value) 
                    data[element.name] = element.value;
                if (element.defaultValue !== undefined && element.defaultValue !== element.value) 
                    data[element.name] = element.value;
                // Si c'est le cas, on ajoute l'élément aux données à envoyer
            }
        });
        return data;
    }

    static checkInputData(containerId, missingValueMessageId) {
        let check = true;
        const inputs = document.querySelectorAll(`#${containerId} input, #${containerId} select`);
        inputs.forEach((input) => {
            if (input.value === "") {
                input.classList.add("input-data-missing");
                check = false;
            } else { 
                input.classList.remove("input-data-missing");
            }
        });

        if (!check) document.getElementById(missingValueMessageId).style.display = "block";
        else document.getElementById(missingValueMessageId).style.display = "none";

        return check;
    }

    static getSizeInMo = (size) => (size / 1000 / 1000).toFixed(4); // Bytes to Mo

    static async getAllEventTypes() {
        try {
            let res = await fetch(`${baseUrl}/events/getAllEventTypes`, { method: "GET", credentials: "include" });
            let data = await res.json();
            if (data) return data;
            else return null;
        } catch (error) {
            return null;
        }
    }
}

export default InputsEditComponent;