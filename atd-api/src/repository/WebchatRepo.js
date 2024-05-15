const DatabaseConnection    = require("./Database");

class WebchatRepository {
    db;

    constructor() {
        this.db = DatabaseConnection;
    };

    getAllMessagesRepo(){
        const sqlQuery = "SELECT webchat.id, webchat.user_id_fk, users.username, webchat.message, webchat.message_type, DATE_FORMAT(webchat.message_datetime, '%Y-%m-%d %H:%i:%s') AS message_datetime from webchat " +
        "INNER JOIN users ON webchat.user_id_fk = users.id " +
        "WHERE status = 1 ORDER BY message_datetime ASC";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getMessageByIdRepo(idMessage){
        const sqlQuery = "SELECT webchat.id, webchat.user_id_fk, users.username, webchat.message, webchat.message_type, webchat.message_datetime, webchat.status from webchat " +
        "INNER JOIN users ON webchat.user_id_fk = users.id " +
        "WHERE webchat.id = ? ORDER BY message_datetime DESC";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idMessage], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    deleteMessageRepo(idMessage){
        const sqlQuery = "UPDATE webchat SET status = 0 WHERE id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idMessage], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    postMessageRepo(data){
        const sqlQuery = "INSERT INTO webchat (user_id_fk, message, message_type, status, message_datetime) VALUES (?, ?, ?, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'))"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.user.userId, data.message, data.type], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

}

module.exports = WebchatRepository;