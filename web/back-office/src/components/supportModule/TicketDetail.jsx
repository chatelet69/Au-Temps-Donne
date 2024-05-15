import React, { useState, useEffect } from "react";
import "../../css/ticket.css";
import pdpAtd from '../../assets/logoForLight.png'
import AuthUser from "../AuthUser";
import ViewTicketModule from "./ViewTickets";
const baseUrl = require("../../config.json").baseUrl;

const TicketDetailModule = (props) => {
    const [ticketChat, setTicketChat] = useState([])

    async function deleteTicket() {
        try {
            const res = await fetch(
              `${baseUrl}/api/tickets/` + props.ticket.id+`/close`,
              {
                method: "GET",
                headers: { "Access-Control-Allow-Origin": "origin" },
                credentials: "include",
              }
            );
            if (res && res.status>=400){
                document.getElementsByClassName("errorMsg")[0].innerHTML = "Erreur"
            }else{
                document.getElementsByClassName("errorMsg")[0].innerHTML = ""
                props.changeModule(<ViewTicketModule changeModule={props.changeModule} />)
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données", error);
          }
    }
    async function getChatTicket() {
        try {
            const res = await fetch(
              `${baseUrl}/api/tickets/` + props.ticket.id+`/chat`,
              {
                method: "GET",
                headers: { "Access-Control-Allow-Origin": "origin" },
                credentials: "include",
              }
            );
            const data = await res.json()
            const messages = data.ticket_chats
            if (res && res.status>=400){
                document.getElementsByClassName("errorChatMsg")[0].innerHTML = "Erreur lors du chargement des messages du tchat"
            }else if(messages == ""){
                document.getElementsByClassName("errorChatMsg")[0].innerHTML = "Aucun messages disponibles"
            }else{
                document.getElementsByClassName("errorChatMsg")[0].innerHTML = ""
                setTicketChat(messages)
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données", error);
          }
    }

    async function addChatTicket() {
        let fileInput = document.getElementById("pjTicket")
        let files = fileInput.files
        try {
            let inputValue = document.getElementsByClassName("inputTextWebChat")[0]
            let form = new FormData;
            if(files.length>0){
                files = files[0]
                form.append("type", 1);
                form.append("file", files);
            }else{
                form.append("type", 0);
            }
            form.append("message", inputValue.value);

            const res = await fetch(
              `${baseUrl}/api/tickets/`+props.ticket.id+`/chat`,
              {
                method: "POST",
                credentials: "include",
                body: form
              }
            );
            
            if (res && res.status>=400){
                document.getElementsByClassName("errorChatMsg")[0].innerHTML = "Erreur lors du chargement des messages du tchat"
            }else {
                document.getElementsByClassName("errorChatMsg")[0].innerHTML = ""
                inputValue.value = ""
                fileInput.value=""
            }
          } catch (error) {
            console.error("Erreur lors de la récupération des données", error);
          }
    }

    useEffect(()=>{
        getChatTicket()
        setTimeout(() => {
            var elem = document.getElementById('webChatMessagesBox');
            elem.scrollTop = elem.scrollHeight;
        }, 1000);
    }, [])

    useEffect(()=>{
        const interval = setInterval(() => {
            getChatTicket();
        }, 10000);

        return () => clearInterval(interval);
    }, [])
        
    return(
        <>
            <div className="ticketDetailBox">
                <div className="webChatBox">
                <p className="errorChatMsg"></p>
                    <div className="webChatMessagesBox" id="webChatMessagesBox">                    
                        {
                            ticketChat.map((message)=>{
                                if (message.author_id == props.ticket.author) {
                                    return (
                                        <div className="messageBoxQuestion">
                                            <img src={AuthUser.pfp} alt="pdp" className="pdpWebChatAtd"/>
                                            { message.type == 0 &&
                                                <div className="messageArea">
                                                    <p>{message.message_content}</p> 
                                                </div>
                                            }
                                            {
                                                message.type == 1 &&
                                                <div className="messageArea messageAreaImgs">
                                                    <img src={message.message_content} alt="image_tchat" />
                                                </div>
                                            }
                                        </div>
                                    )
                                } else {
                                    return (
                                        <div className="messageBoxRespons">
                                            <img src={pdpAtd} alt="pdp" className="pdpWebChatAtd"/>
                                            { message.type == 0 &&
                                                <div className="messageArea">
                                                    <p>{message.message_content}</p> 
                                                </div>
                                            }
                                            {
                                                message.type == 1 &&
                                                <div className="messageArea messageAreaImgs">
                                                    <img src={message.message_content} alt="image_tchat" />
                                                </div>
                                            }
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                    <div className="inputMessageBox">
                        <div className="inputMessage">
                            <label htmlFor="pjTicket" className="pointer">
                                <span className="material-symbols-outlined">attachment</span>
                            </label>
                            <input type="file" id="pjTicket" name="pjTicket" hidden/>
                            <input type="text" placeholder="Votre message..." className="inputTextWebChat"/>
                            <span className="material-symbols-outlined pointer" onClick={() => {addChatTicket()}}>send</span>
                        </div>
                    </div>
                </div>
                <div className="ticketDetailInfoBox">
                    <div className="ticketDetailInfo">
                        <h2 className="titleDetail">Date</h2>
                        <p className="infoDetail">{props.ticket.date}</p>
                    </div>
                    <div className="ticketDetailInfo">
                        <h2 className="titleDetail">Titre</h2>
                        <p className="infoDetail">{props.ticket.title}</p>
                    </div>
                    <div className="ticketDetailInfo">
                        <h2 className="titleDetail">Description</h2>
                        <div className="descriptionBox">
                            <p className="infoDetail">{props.ticket.description}</p>
                        </div>
                    </div>
                    <div className="ticketDetailInfo">
                        <h2 className="titleDetail">Difficultée</h2>
                        <p className="infoDetail">{props.ticket.difficulty}</p>
                    </div>
                    <div className="ticketDetailInfo">
                        <h2 className="titleDetail">Catégorie</h2>
                        <p className="infoDetail">{props.ticket.category}</p>
                    </div>
                    <div className="btnBoxTicket">
                        {props.ticket.ticket_status == 1 && (
                                <button className="btnClosedTicket">Ticket clot</button>
                        )}
                        {props.ticket.ticket_status == 0 && (
                                <button className="btnDeleteTicket" onClick={()=>deleteTicket()}>Clore ce ticket</button>
                        )}
                    </div>
                    <p className="errorMsg"></p>
                </div>
            </div>
        </>
    );
}

export default TicketDetailModule;