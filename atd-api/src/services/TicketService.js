const TicketRepository  = require("../repository/TicketRepository");
const form              = require("../utils/form.json");
const MinIoService      = require("./MinIOService");
const UtileService      = require("./UtilService");
const EmailService      = require("./EmailService");

class TicketService {
    ticketRepository;
    minioService;
    utilService;

    constructor() {
        this.ticketRepository = new TicketRepository();
        this.minioService = new MinIoService();
        this.utilService = new UtileService();
    }

    async getAllTicketsService() {
        try {
            // Retrieving tickets and sending the list if it exists
            const result = await this.ticketRepository.getAllTicketsDb();
            if (result) return result;
            else return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at getAllTicketsService : ", error);
            return { error: form.errorDuringGet };
        }
    }

    async getTicketByIdService(ticketId) {
        try {
            /* Type checking and conversion to number if necessary
                then recover the ticket if it exists */
            if(!isNaN(ticketId)) ticketId = Number.parseInt(ticketId);
            const ticket = await this.ticketRepository.getTicketByIdDb(ticketId);
            if (ticket && ticket.id) return ticket;
            else return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at getTicketByIdService : ", error);
            return { error: form.errorDuringGet };
        }
    }

    async deleteTicketByIdService(ticketId, userId, userRank) {
        try {
            if (ticketId == 0 || userId == 0) return { error: "Erreur dans les données transmises" };
            const ticket = await this.getTicketByIdService(ticketId);
            if (ticket && ticket.id) {
                // Condition inutile actuellement vu que le middleware admin est présent
                if (ticket.author === userId || userRank >= form.ranks.place_manager) {
                    const resDb = await this.ticketRepository.deleteTicketByIdDb(ticketId);
                    return (resDb.affectedRows > 0) ? true : { error: form.errorDuringDeleteTicket };
                }
            }
            return { error: form.errorDuringDeleteTicket };
        } catch (error) {
            console.log("Error at deleteTicketByIdService : ", error);
            return { error: "Erreur durant la suppresion du ticket" };
        }
    }

    async getTicketChatService(ticketId, userId, userRank) {
        try {
            const ticket = await this.getTicketByIdService(Number.parseInt(ticketId));
            if (ticket && ticket.id) {
                if (ticket.author === userId || userRank >= form.ranks.place_manager) {
                    let resDb = await this.ticketRepository.getTicketChatDb(ticketId);
                    for (let i = 0; i < resDb.length; i++) {
                        if(resDb[i].type == 1){
                            resDb[i].message_content = await this.minioService.getFileTempLink(null, resDb[i].message_content, null, null);
                            if (resDb[i].message_content === null) resDb[i].message_content = "null";
                        }
                    }
                    if (resDb) return resDb;
                }
            }
            return { error: form.errorDuringGet };
        } catch (error) {
            console.log("Error at getTicketChatService : ", error);
            return { error: form.errorDuringGet };
        }
    }

    async checkAndRenameFile(files, userInfos) {
        for (let j = 0; j < files.length; j++) {
            let verifFile = this.utilService.checkFile(files[j]);
            if (verifFile !== "ok") return false;
            let newName = this.utilService.changeFilename(userInfos, files[j]);
            newName = newName.normalize('NFD').replace(/[\u0300-\u036f]/g, '');   // Remove accents from string
            this.utilService.renameFile(files[j], newName);
        }

        return true;
    }

    async addNewTicketChatService(ticketId, userInfos, message, type, files) {
        try {
            const ticket = await this.getTicketByIdService(Number.parseInt(ticketId));
            let returnMessage = { error: form.errorDuringAddNewTicketChat };
            if (type !== 0 && type !== 1) return returnMessage;
            if (message === undefined && files === null) return returnMessage;

            // If a text message is present, put into database
            if (ticket && ticket.id && message !== undefined && message.length <= 255 && message.length > 0) {
                if (ticket.author === userInfos.userId || userInfos.rank >= form.ranks.place_manager) {
                    const resDb = await this.ticketRepository.addNewTicketChatDb(ticketId, userInfos.userId, message, 0);
                    if(resDb.insertId) returnMessage = { message: "Message envoyé avec succès !" };
                }
            }

            if (type === 1 && files.length > 0) {
                let result = await this.checkAndRenameFile(files, userInfos);
                if (result === false) return { error: form.errorDuringAddNewTicketChat };

                for (let i = 0; i < files.length; i++) {
                    message = "users-files/user-" + userInfos.userId + "/support/ticket-" +ticketId+"/"+ files[i].filename;
                    message = message.normalize('NFD').replace(/[\u0300-\u036f]/g, '');   // Remove accents from string
                    this.minioService.putFile(null, message, files[i].path, files[i]);
                    const resDb2 = await this.ticketRepository.addNewTicketChatDb(ticketId, userInfos.userId, message, 1);
                    if (!resDb2.insertId) {
                        this.utilService.deleteFiles(files);
                        return { error: form.errorDuringAddNewTicketChat };
                    }
                }
                this.utilService.deleteFiles(files);
                returnMessage = { message: "Message envoyé avec succès !" };
            }

            return returnMessage;
        } catch (error) {
            console.log("Error at addNewTicketChatService : ", error);
            return { error: form.errorDuringAddNewTicketChat };
        }
    }

    async closeTicketService(ticketId, userId, userRank) {
        try {
            const ticket = await this.getTicketByIdService(Number.parseInt(ticketId));
            if (ticket && ticket.id) {
                if (ticket.ticket_status === form.ticketStatus.closed) return { error: "Ce ticket est déjà fermé !" };
                if (ticket.author === userId || userRank >= form.ranks.place_manager) {
                    const resDb = await this.ticketRepository.changeStatusTicket(ticketId, form.ticketStatus.closed);
                    if (resDb.affectedRows > 0) {
                        if (ticket.email) await EmailService.sendResolvedTicked(ticket.email, ticket.name, ticketId);
                        return true;
                    } else {
                        return { error: form.errorDuringStatusTicket };
                    }
                }
            }
            return { error: form.errorDuringStatusTicket };
        } catch (error) {
            console.log("Error at closeTicketService : ", error);
            return { error: form.errorDuringStatusTicket };
        }
    }

    async getTicketsByUserService(userId) {
        try {
            const resDb = await this.ticketRepository.getTicketsByUserRepo(userId);
            return (resDb) ? resDb : { error: form.errorDuringStatusTicket };
        } catch (error) {
            console.log("Error at getTicketsByUserService : ", error);
            return { error: form.errorDuringStatusTicket };
        }
    }

    async createTicketService(body, userInfos) {
        try {
            let title = body.title;
            let description = body.description;
            let difficulty = body.difficulty;
            let category = body.category;

            if(!title || !description || !difficulty || !category) return { error: "Elements manquants" };
            difficulty = Number.parseInt(difficulty);
            const resDb = await this.ticketRepository.createTicketRepo(title, description, difficulty, userInfos.userId, category);
            
            if(resDb.affectedRows>0) return true;
            else return { error: form.errorDuringPostTicket };
        } catch (error) {
            console.log("Error at createTicketService : ", error);
            return { error: form.errorDuringPostTicket };
        }
    }

    async changeTicketDifficultyService(ticketId, newDifficulty) {
        try {
            newDifficulty = Number.parseInt(newDifficulty);
            ticketId = Number.parseInt(ticketId);
            if (newDifficulty < 0 || newDifficulty > 3) return { error: "Difficulté incorrecte" };

            const ticket = await this.ticketRepository.getTicketByIdDb(ticketId);
            if (ticket && ticket.id) {
                const resDb = await this.ticketRepository.changeTicketDifficultyDb(ticketId, newDifficulty);
                if (resDb.affectedRows > 0) return true;
            }
            return { error: form.errorDuringPostTicket }
        } catch (error) {
            console.log("Error at changeTicketDifficulty : ", error);
            return { error: form.errorDuringPostTicket };
        }
    }

    async openTicketService(ticketId, userId, userRank) {
        try {
            const ticket = await this.getTicketByIdService(Number.parseInt(ticketId));
            if (ticket && ticket.id) {
                if (ticket.ticket_status === form.ticketStatus.opened) return { error: "Ce ticket est déjà ouvert !" };
                if (ticket.author === userId || userRank >= form.ranks.place_manager) {
                    const resDb = await this.ticketRepository.changeStatusTicket(ticketId, form.ticketStatus.opened);
                    return (resDb.affectedRows > 0) ? true : { error: form.errorDuringStatusTicket };
                }
            }
            return { error: form.errorDuringStatusTicket };
        } catch (error) {
            console.log("Error at closeTicketService : ", error);
            return { error: form.errorDuringStatusTicket };
        }
    }
}

module.exports = TicketService;
