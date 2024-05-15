const DatabaseConnection = require("./Database");

class UserRepository {
    db;

    constructor() {
        //this.dbConnection = new DatabaseConnection();
        //this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }
  
    getAllEventsDb() {
        let sqlQuery = "SELECT e.id,a.name AS type,e.type_event_id_fk,e.responsable,e.title,e.description,e.place," +
        "DATE_FORMAT(e.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime,DATE_FORMAT(e.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime " + 
        "FROM events e INNER JOIN activities a ON a.id = e.type_event_id_fk ORDER BY id DESC";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllEventsFilteredDb(filter, userId) {
        let sqlQuery = "SELECT e.id,a.name AS type,e.type_event_id_fk,e.responsable,e.title,e.description,e.place," +
        "DATE_FORMAT(e.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime,DATE_FORMAT(e.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime " + 
        "FROM events e INNER JOIN activities a ON a.id = e.type_event_id_fk ";
        
        if (filter === "user_registered") {
            sqlQuery += "LEFT JOIN event_contributors ec ON ec.event_id_fk = e.id WHERE ec.user_id_fk = ? OR e.responsable = ? ";
        } else if (filter === "user_not_registered") {
            sqlQuery += "LEFT JOIN event_contributors ec ON ec.event_id_fk = e.id WHERE e.responsable != ? AND e.id NOT IN " +
            "(SELECT event_id_fk FROM event_contributors WHERE user_id_fk = ?) ";
        }
        sqlQuery += "ORDER BY id DESC";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId, userId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllEventTypesDb() {
        const sqlQuery = "SELECT id,name FROM activities";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    isEventExist(eventId) {
        const sqlQuery = "SELECT id FROM events WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                if (result && result[0]) resolve(result[0]);
                else resolve(null);
            });
        });
    }

    getEventByIdDb(eventId) {
        const sqlQuery = "SELECT e.id,e.type_event_id_fk AS type_event_id, e.title, DATE_FORMAT(e.start_datetime, '%Y-%m-%d %H:%i:%s') AS start_datetime,"  +
        "DATE_FORMAT(e.end_datetime, '%Y-%m-%d %H:%i:%s') AS end_datetime, e.responsable,e.description,e.place,a.name,u.name AS responsable_name,u.lastname AS responsable_lastname" +
        " FROM events e INNER JOIN activities a ON a.id = e.type_event_id_fk LEFT JOIN users u ON u.id = e.responsable WHERE e.id = ?";
        // Jointure de gauche sur users dans le cas ou il n'y a pas de responsable

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                else resolve(null);
            });
        });
    }

    getResumeNextEventsDb(amount) {
        const sqlQuery = "SELECT id,title,DATE_FORMAT(start_datetime, '%Y-%m-%d') as start_datetime FROM " + 
        " events WHERE start_datetime >= CURRENT_DATE() OR end_datetime >= CURRENT_DATE() ORDER BY id DESC LIMIT ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    createEventDb(eventData) {
        const sqlQuery = "INSERT INTO events (type_event_id_fk, title, start_datetime, end_datetime, responsable, description, place)" +
        " VALUES ((SELECT id FROM activities WHERE name = ?),?,?,?,?,?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventData.event_type, eventData.title, 
                                     eventData.start_datetime, eventData.end_datetime, 
                                     eventData.responsable, eventData.description, eventData.place
                                    ], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        }); 
    }
    createEventWithIdActiviyDb(eventData) {
        const sqlQuery = "INSERT INTO events (type_event_id_fk, title, start_datetime, end_datetime, responsable, description, place)" +
        " VALUES (?,?,?,?,?,?,?) RETURNING id";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventData.event_type, eventData.title, 
                                     eventData.start_datetime, eventData.end_datetime, 
                                     eventData.responsable, eventData.description, eventData.place
                                    ], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        }); 
    }

    insertNewTrajectPoint(eventId, data) {
        const sqlQuery = "INSERT INTO event_trajects (event_id_fk, address, city, zip_code, lng, lat)" +
        " VALUES (?,?,?,?,?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, data.address, data.city, data.zip_code, data.lng, data.lat], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEventItineraryDb(eventId) {
        const sqlQuery = "SELECT id,event_id_fk,address,city,zip_code,lng,lat FROM event_trajects WHERE event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEventContributorsDb(eventId) {
        const sqlQuery = "SELECT e.id,e.event_id_fk as eventId,e.user_id_fk AS userId,e.role,u.name,u.lastname "+
        "FROM event_contributors e INNER JOIN users u ON u.id = e.user_id_fk WHERE event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    visitElderlyIdRepo(idElderly, volunteerId) {
        const sqlQuery = "INSERT INTO elderly_visit_log (idVolunteer, idElderly) VALUES (?, ?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idElderly, volunteerId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEventStockElementsDb(eventId) {
        const sqlQuery = "SELECT e.id,e.event_id_fk AS eventId,e.status AS status, e.element_stock_id_fk AS elementStockId,e.amount," +
        "s.title AS name, s.location AS location, w.place_name AS warehouseName, s.category, DATE_FORMAT(s.expiry_date, '%d/%m/%Y') AS expiry_date" +
        " FROM event_stocks e INNER JOIN stock s ON s.id = e.element_stock_id_fk INNER JOIN work_places w ON w.id = s.idEntrepot_fk WHERE event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    addEventStockElementDb(eventId, stockId, amount) {
        const sqlQuery = "INSERT INTO event_stocks (event_id_fk, element_stock_id_fk, amount) VALUES (?,?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, stockId, amount], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }


    deleteEventStockElementDb(eventId, stockId) {
        const sqlQuery = "DELETE FROM event_stocks WHERE id = ? AND event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [stockId, eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEventStocksByStockDb(stockId) {
        const sqlQuery = "SELECT SUM(amount) AS totalAmount FROM event_stocks WHERE element_stock_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [stockId], (error, result) => {
                if (error) reject(error);
                if (result.length > 0 && result[0]) resolve(result[0]);
                resolve(result);
            });
        });
    }
  
    deleteEventDb(eventId) {
        const sqlQuery = "DELETE from events WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    createRequestEventDb(type_event, beneficiary_id, description, place, start_datetime, end_datetime) {
        const sqlQuery = "INSERT INTO events_requests (type_event_id_fk, beneficiary_id_fk, status, description, place, start_datetime, end_datetime) VALUES (?, ?, 0, ?, ?, ?, ?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [type_event, beneficiary_id, description, place, start_datetime, end_datetime], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    addEventContributorDb(eventId, userId, role) {
        const sqlQuery = "INSERT INTO event_contributors (event_id_fk, user_id_fk, role) VALUES (?,?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, userId, role], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getBeneficiariesDb(eventId) {
        const sqlQuery = "SELECT e.id AS id,e.event_id_fk AS eventId,e.beneficiary_id_fk AS beneficiaryId," + 
        "u.name AS name, u.lastname AS lastname FROM event_beneficiaries e " + 
        "INNER JOIN users u ON u.id = e.beneficiary_id_fk WHERE e.event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    addEventBeneficiaryDb(eventId, beneficiaryId) {
        const sqlQuery = "INSERT INTO event_beneficiaries (event_id_fk,beneficiary_id_fk) VALUES (?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, beneficiaryId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    deleteEventBeneficiaryDb(eventId, linkId) {
        const sqlQuery = "DELETE from event_beneficiaries WHERE id = ? AND event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [linkId, eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    checkEventBeneficiaryPresence(eventId, beneficiaryId) {
        const sqlQuery = "SELECT id from event_beneficiaries WHERE event_id_fk = ? AND beneficiary_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, beneficiaryId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    editEventStockElementDb(eventId, stockId, amount) {
        const sqlQuery = "UPDATE event_stocks SET amount = ? WHERE event_id_fk = ? AND element_stock_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount, eventId, stockId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getRequestByIdDb(requestId){
        const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%d-%m-%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%d-%m-%Y %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id AND er.id = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [requestId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }
    
    getRequestByIdForDb(requestId) {
      const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%Y-%m-%d %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%Y-%m-%d %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id AND er.id = ?";
        
      return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [requestId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    changeRequestStatusDb(newStatus, requestId){
        const sqlQuery = "UPDATE events_requests SET status = ? WHERE id = ?";
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [newStatus, requestId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }
    
    getAllRequestsDb(){
        const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result)=>{
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getAllWaitingRequestsDb(){
        const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id AND er.status=0"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result)=>{
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getRequestByUserIdDb(userId){
        const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id AND u.id = ? ORDER BY start_datetime"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    getEventByContributorsRepo(contributorId, date){
        console.log("passe dans getEventByContributorsRepo")
        const sqlQuery = "SELECT event_contributors.id, event_contributors.event_id_fk, event_contributors.user_id_fk, event_contributors.role, "+
        "events.title, DATE_FORMAT(events.start_datetime, '%d-%m-%Y %H:%i:%s') start_datetime, DATE_FORMAT(events.end_datetime, '%d-%m-%Y %H:%i:%s') end_datetime , events.responsable, events.description, events.place, "+
        "responsable_user.name as responsableName, responsable_user.lastname as responsableLastname, activities.name AS name, "+
        "TIME_FORMAT(events.start_datetime, '%H:%i') AS start_datetime_formated, "+
        "TIME_FORMAT(events.end_datetime, '%H:%i') AS end_datetime_formated "+
        "FROM event_contributors "+
        "INNER JOIN events ON event_contributors.event_id_fk = events.id "+
        "INNER JOIN users ON event_contributors.user_id_fk = users.id "+
        "INNER JOIN activities ON events.type_event_id_fk = activities.id "+
        "LEFT JOIN users as responsable_user ON events.responsable = responsable_user.id "+ 
        "WHERE event_contributors.user_id_fk = ? AND DATE(events.start_datetime) = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [contributorId, date], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }
  
    deleteEventContributorDb(eventId, userId) {
        const sqlQuery = "DELETE FROM event_contributors WHERE event_id_fk = ? AND user_id_fk = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    getWaitingRequestByUserIdDb(userId){
        const sqlQuery = "SELECT er.id, er.type_event_id_fk, a.name AS type_event, DATE_FORMAT(er.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(er.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime, er.beneficiary_id_fk AS beneficiary_id, u.username, u.email, u.name, u.lastname, u.phone, u.address, u.situation, er.status, er.description, er.place FROM events_requests AS er, users AS u, activities AS a WHERE u.id=er.beneficiary_id_fk AND er.type_event_id_fk = a.id AND u.id = ? AND er.status=0 ORDER BY start_datetime"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }
  
    editEventDb(eventId, data) {
        let sqlQuery = "UPDATE events SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery += " WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(data), eventId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    getEventsByUserDb(userId) {
        const sqlQuery = "SELECT e.id, eb.id AS linkId, e.type_event_id_fk AS type_event_id, (SELECT a.name FROM activities AS a WHERE a.id = e.type_event_id_fk) AS event_type , e.title, DATE_FORMAT(e.start_datetime, '%d/%m/%Y %H:%i:%s') AS start_datetime, DATE_FORMAT(e.end_datetime, '%d/%m/%Y %H:%i:%s') AS end_datetime, e.responsable AS responsable_id, (SELECT u.username FROM users AS u WHERE u.id = e.responsable) AS responsable, e.description, e.place FROM event_beneficiaries AS eb, events AS e WHERE eb.beneficiary_id_fk = ? AND eb.event_id_fk = e.id";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }
    
    removeRequestDb(requestId) {
        const sqlQuery = "DELETE FROM events_requests WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [requestId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    getEventStockElementByIdDb(linkId) {
        const sqlQuery = "SELECT id,event_id_fk AS eventId,element_stock_id_fk AS stockId,amount,status FROM event_stocks WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [linkId], (error, result) => {
                if(error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }

    changeEventStockStatus(eventId, linkId, status) {
        const sqlQuery = "UPDATE event_stocks SET status = ? WHERE id = ? AND event_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [status, linkId, eventId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            });
        });
    }

    getEventItineraryByAddress(eventId, searchAddress) {  
        const sqlQuery = "SELECT id,event_id_fk,address,city,zip_code,lng,lat FROM event_trajects WHERE event_id_fk = ? AND address LIKE ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, searchAddress], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEventItineraryPointByIdDb(eventId, linkId) {
        const sqlQuery = "SELECT id,event_id_fk,address,city,zip_code,lng,lat FROM event_trajects WHERE event_id_fk = ? AND id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, linkId], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }

    deleteIitineraryPointByIdDb(eventId, linkId) {
        const sqlQuery = "DELETE FROM event_trajects WHERE event_id_fk = ? AND id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, linkId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    editTrajectPointDb(eventId, linkId, data) {
        const sqlQuery = "UPDATE event_trajects SET city = ?, address = ?, zip_code = ?, lng = ?, lat = ? WHERE event_id_fk = ? AND id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.city, data.address, data.zip_code, data.lng, data.lat, eventId, linkId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
}

module.exports = UserRepository;