const DatabaseConnection = require("./Database");

class TicketRepository {
    db;

    constructor() {
        // //this.dbConnection = new DatabaseConnection();
        // //this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }
  
    getAllTicketsDb() {
        const sqlQuery = "SELECT t.id,t.title,t.description,t.ticket_status,t.difficulty,t.category," +
        "DATE_FORMAT(t.date, '%Y-%m-%d') AS date,t.author, u.name AS authorName, u.lastname AS authorLastname " + 
        "FROM tickets t INNER JOIN users u ON u.id = t.author";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getTicketByIdDb(ticketId) {
        const sqlQuery = "SELECT t.id,t.title,t.description,t.ticket_status,t.difficulty,t.category,t.date,t.author," + 
        "u.name, u.lastname,u.email FROM tickets t INNER JOIN users u ON u.id = t.author WHERE t.id = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [ticketId], (error, result) => {
                if (error) reject(error);
                if (result && result[0]) resolve(result[0]);
                else resolve(result);
            });
        });
    }

    deleteTicketByIdDb(ticketId) {
        const sqlQuery = "DELETE from tickets WHERE id = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [ticketId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    addNewTicketChatDb(ticketId, userId, message, type) {
        const sqlQuery = "INSERT INTO tickets_chat (message_content, ticket_id_fk, author_id_fk, type) VALUES (?,?,?,?)";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [message, ticketId, userId, type], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    changeStatusTicket(ticketId, newStatus) {
        const sqlQuery = "UPDATE tickets SET ticket_status = ? WHERE id = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [newStatus, ticketId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getTicketsByUserRepo(userId) {
        const sqlQuery = "SELECT *, DATE_FORMAT(date, '%d/%m/%Y') AS date FROM tickets WHERE author = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getTicketChatDb(ticketId) {
        const sqlQuery = "SELECT t.id AS id,t.message_content AS message_content,t.type AS type,t.ticket_id_fk AS ticket_id,t.author_id_fk AS author_id," +
        "u.username AS username FROM tickets_chat t INNER JOIN users u ON u.id = t.author_id_fk WHERE ticket_id_fk = ? ORDER BY id ASC";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [ticketId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    createTicketRepo(title, description, difficulty, author, category){
        const sqlQuery = "INSERT INTO tickets (title, description, ticket_status, difficulty, author, category) VALUES (?, ?, 0, ?, ?, ?)";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [title, description, difficulty, author, category], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    changeTicketDifficultyDb(ticketId, newDifficulty) {
        const sqlQuery = "UPDATE tickets SET difficulty = ? WHERE id = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [newDifficulty, ticketId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
}

module.exports = TicketRepository;