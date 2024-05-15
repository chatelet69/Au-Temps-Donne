import React from "react";
import "../../css/application.css";
import "gridjs/dist/theme/mermaid.css";
import { _ } from "gridjs-react";

const baseUrl = require("../../config.json").baseUrl;

const CreateTicketPopUp = (props) => {
  
    const createTicket = async () => {
      try {
        let title = document.getElementById("title").value
        let description = document.getElementById("description").value
        let difficulty = document.getElementById("difficulty").value
        let category = document.getElementById("category").value
        const res = await fetch(
          `${baseUrl}/api/tickets`,
          {
            method: "POST",
            headers: { 
                "Access-Control-Allow-Origin": "origin",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            credentials: "include",
            body: `title=${title}&description=${description}&difficulty=${difficulty}&category=${category}`
          }
        );
        const jsonResult = await res.json();
        if (jsonResult && !jsonResult.error){
            props.getTickets()
            props.changeCreateTicketPopUpState(false);
        } 
        else document.getElementsByClassName("errorMsg")[0].textContent = jsonResult.error
      } catch (error) {
        document.getElementsByClassName("errorMsg")[0].textContent = "Erreur lors de la création du ticket"
        console.error("Erreur lors de la récupération des données", error);
      }
    };

	return (
		<div className="module-popup popUpCreateTicket">
            <h2>Créer un ticket</h2>
            <p className="underTitlePopUp">Allez à l'essentiel, un webchat est disponible pour détailler votre problème</p>
            <div>
                <label htmlFor="title">Titre du ticket :</label>
                <input type="text" id="title" name="title"/>
            </div>
            <div> 
                <label htmlFor="description">Description :</label>
                <input type="text" id="description" name="description"/>
            </div>
            <div>
                <label htmlFor="difficulty">Importance éstimée du ticket</label>
                <select name="difficulty" id="difficulty">
                <option value="0">Basse</option>
                <option value="1">Intermédiaire</option>
                <option value="2">Importante</option>
                <option value="3">Urgent</option>
                </select>
            </div>
            <div>
                <label htmlFor="category">Catégorie</label>
                <select name="category" id="category">
                <option value="Question">Question</option>
                <option value="Technique">Technique</option>
                <option value="Autre">Autre</option>
                </select>
            </div>
            <div className="btnBoxPopUp">
                <button className="refuseBtn" onClick={()=>props.changeCreateTicketPopUpState(false)}>Annuler</button>
                <button className="validBtn" onClick={()=>createTicket()}>Envoyer</button>
            </div>
            <p className="errorMsg"></p>
		</div>
	);
};

export default CreateTicketPopUp;