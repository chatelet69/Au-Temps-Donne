const TicketService    = require("../services/TicketService");
const form             = require("../utils/form.json");

class TicketController {
    ticketService;

    constructor() {
        this.ticketService = new TicketService();
    };

    getAllTickets = async (req, res) => {
        try {
            const ticketsList = await this.ticketService.getAllTicketsService();
            if (ticketsList && !ticketsList.error) res.status(200).json({ tickets: ticketsList, count: ticketsList.length });
            else res.status(404).json({ error: (ticketsList.error) ? ticketsList.error : form.errorDuringGet });
        } catch (error) {
            console.log("Error at getAllTickets : ", error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    getTicketById = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const ticket = await this.ticketService.getTicketByIdService(ticketId);
            if (ticket && !ticket.error) res.status(200).json(ticket);
            else res.status(404).json({ error: (ticket.error) ? ticket.error : form.errorDuringGet });
        } catch (error) {
            console.log("Error at getTicketById : ", error);
            res.status(500).json({ error: form.errorDuringGet });
        }
    }

    deleteTicket = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const userId = req.user.userId;

            const resDelete = await this.ticketService.deleteTicketByIdService(ticketId, userId);
            if (resDelete && !resDelete.error) res.status(200).json({ message: "ticket_deleted" });
            else res.status(404).json({ error: (resDelete.error) ? resDelete.error : "Erreur durant la suppresion du ticket" });
        } catch (error) {
            console.log("Error at deleteTicket : ", error);
            res.status(500).json({ error: "Erreur durant la suppresion du ticket" });
        }
    }

    getTicketChat = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const userId = req.user.userId;
            const userRank = req.user.rank;
            
            const ticketChat = await this.ticketService.getTicketChatService(ticketId, userId, userRank);
            if (ticketChat && !ticketChat.error) res.status(200).json({ ticket_chats: ticketChat, count: ticketChat.length });
            else res.status(404).json({ error: (ticketChat.error) ? ticketChat.error : "Erreur durant la récupération du chat" });
        } catch (error) {
            console.log("Error at getTicketChat : ", error);
            res.status(500).json({ error: "Erreur durant la récupération du chat" });
        }
    }

    addNewTicketChat = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const userInfos = req.user;
            const message = req.body.message;

            // The type is transformed into a real number for future comparisons
            const type = (req.body.type ) ? Number.parseInt(req.body.type) : 0;
            const files = (req.files ? req.files : null);
            
            const resService = await this.ticketService.addNewTicketChatService(ticketId, userInfos, message, type, files);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant l'envoi du message" });
        } catch (error) {
            console.log("Error at addNewTicketChat : ", error);
            res.status(500).json({ error: "Erreur durant l'envoi du message" });
        }
    }

    closeTicket = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const userId = req.user.userId;
            const userRank = req.user.rank;

            const resService = await this.ticketService.closeTicketService(ticketId, userId, userRank);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant la fermeture du ticket" });
        } catch (error) {
            console.log("Error at closeTicket : ", error);
            res.status(500).json({ error: "Erreur durant la fermeture du ticket" });
        }
    }

    getTicketsByUser = async (req, res) => {
        try {
            const userId = req.user.userId;
            const resService = await this.ticketService.getTicketsByUserService(userId);
            if (resService && !resService.error) res.status(200).json({ count: resService.length, tickets: resService });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant la récupération des tickets" });
        } catch (error) {
            console.log("Error at getTicketsByUser : ", error);
            res.status(500).json({ error: "Erreur durant la récupération des tickets" });
        }
    }


    createTicket = async (req, res) => {
        try {
            const resService = await this.ticketService.createTicketService(req.body, req.user);
            if (resService && !resService.error) res.status(200).json({ message: "Ticket envoyé avec succès !" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant la création du ticket" });
        } catch (error) {
            console.log("Error at createTicket : ", error);
            res.status(500).json({ error: "Erreur durant la création du ticket" });
        }
    }
    
    /*changeStateTicket = async (req, res) => {
        try {
            const resService = await this.ticketService.changeStateTicketService(req.body, req.user);
            if (resService && !resService.error) res.status(200).json({ message: "Ticket modifié avec succès !" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant la modification du ticket" });
        } catch (error) {
            console.log("Error at changeStateTicket : " + error)
            res.status(500).json({ error: "Erreur durant la modification du ticket" });
        }
    }*/

    changeTicketDifficulty = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const newDifficulty = req.body.difficulty;

            const resService = await this.ticketService.changeTicketDifficultyService(ticketId, newDifficulty);
            if (resService && !resService.error) res.status(200).json({ message: "Priorité du ticket modifié avec succès !" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant la modification de la priorité" });
        } catch (error) {
            console.log("Error at changeTicketDifficulty : " + error)
            res.status(500).json({ error: "Erreur durant la modification de la priorité" });
        }
    }

    openTicket = async (req, res) => {
        try {
            const ticketId = req.params.id;
            const userId = req.user.userId;
            const userRank = req.user.rank;

            const resService = await this.ticketService.openTicketService(ticketId, userId, userRank);
            if (resService && !resService.error) res.status(200).json({ message: "success" });
            else res.status(404).json({ error: (resService.error) ? resService.error : "Erreur durant l'ouverture du ticket" });
        } catch (error) {
            console.log("Error at openTicket : ", error);
            res.status(500).json({ error: "Erreur durant l'ouverture du ticket" });
        }
    }
}

module.exports = TicketController;