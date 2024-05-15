import { Component } from "react";
import AuthUser from "../AuthUser";
import "../../css/components.css"

const baseUrl = require("../../config.json").baseUrl;

class Webchat extends Component {
    state = {
        messagesList: [],
        userConnected: AuthUser.id
    }

    async getAllMessages() {
        try {
            let res = await fetch(`${baseUrl}/api/webchat/getAllMessages`, {method: "GET",credentials: "include"});
            let data = await res.json();
            if (data) this.setState({ messagesList: data.messages });
        } catch (error) {
            return false;
        }
    }

    async postMessage(){
        const data = new FormData();

        const messageText = document.getElementById('message-text').value;
        if(messageText.length > 0) {
            data.append("messageText", messageText);
        }

        const messageFile = document.getElementById('message-file');
        if(messageFile.value.length > 0) {
            data.append("messageFile", messageFile.files[0]);
        }

        let res = await fetch(`${baseUrl}/api/webchat/postMessage`, {
            method: "POST",
            credentials: "include",
            body: data
        });
        const resData = await res.json();
        if(resData){
            await this.getAllMessages();
        }

        document.getElementById('message-text').value = '';
        document.getElementById('message-file').value = '';

    }

    async deleteMessage(idMessage) {
        let res = await fetch(`${baseUrl}/api/webchat/deleteMessages/${idMessage}`, {
            method: "PATCH",
            credentials: "include",
        });

        const resData = await res.json();
        if(resData){
            await this.getAllMessages()
        }
    }

    interval() {
        const interval = setInterval(async () => {
            await this.getAllMessages();
        }, 10000);

        return () => clearInterval(interval);
    }
    
    async componentDidMount() {
        await this.getAllMessages();
        this.interval();
    }

    async componentDidUpdate(prevProps, prevState) {
        if(prevState.messagesList.length !== this.state.messagesList.length){
            const webchatContainer = document.getElementById('WebchatMessagesContainer');
            webchatContainer.scrollTop = webchatContainer.scrollHeight;
            console.log(webchatContainer.scrollTop)
            console.log(webchatContainer.scrollHeight)
        }
    }

    render() {
        return (
            <div className="module-container webchat-module-container">
                <div className="webchat-module-head module-head">
                    <h2>Webchat</h2>
                </div>
                <div id="webchatContainer" className="webchat-container">
                    <div id="WebchatMessagesContainer" className="flexbox-column">
                        {this.state.messagesList.map(message => (
                            <div className={`message-box ${this.state.userConnected === message.user_id_fk ? 'my-message' : 'other-message'}`} key={message.id}>
                                <div className="message-content">
                                    <div className="message-info">
                                        {this.state.userConnected === message.user_id_fk ? (
                                            <p className="username">Moi</p>
                                        ) : (
                                            <p className="username">{message.username}</p>
                                        )}
                                    </div>
                                    <div className="message-text-container">
                                        <p className="message-text">{message.message}</p>
                                    </div>
                                    <div className="message-info flexbox-row">
                                        <p className="message-datetime">{message.message_datetime}</p>
                                        {this.state.userConnected === message.user_id_fk && (
                                            <button className="delete-button" onClick={() => this.deleteMessage(message.id)}>supprimer</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div id="message-input-container">
                        <input id='message-file' type="file" />
                        <input id="message-text" type="text" placeholder="écrivez votre message" />
                        <button className="button-send" onClick={() => this.postMessage()}>Envoyer</button>
                    </div>
                </div>
            </div>
        );
    }
    
    
}

export default Webchat;