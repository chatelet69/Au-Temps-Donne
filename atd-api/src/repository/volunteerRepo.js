const UtilService = require("../services/UtilService");
const DatabaseConnection = require("./Database");

class VolunteerRepo {
    dbConnection;
    db;
    
    constructor() {
        // this.dbConnection = new DatabaseConnection();
        // this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }

    createUserDb(userData) {
        let sqlQuery = "INSERT INTO users (";
        sqlQuery = this.formatInsertSqlQuery(sqlQuery, userData);        
        sqlQuery+= " RETURNING id;";
        return new Promise ((resolve, reject) => {
            this.db.execute(sqlQuery, Object.values(userData), (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }
 
    createLicensesDb(licenses) {
        let sqlQuery = "INSERT INTO driving_licenses (";
        sqlQuery = this.formatInsertSqlQuery(sqlQuery, licenses)
        sqlQuery+= ";";
        return new Promise ((resolve, reject) => {
            this.db.execute(sqlQuery, Object.values(licenses), (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    createApplicationDb(applicationData) {
        let sqlQuery = "INSERT INTO volunteer_applications (";
        sqlQuery = this.formatInsertSqlQuery(sqlQuery, applicationData)
        sqlQuery+= ";";
        return new Promise ((resolve, reject) => {
            this.db.execute(sqlQuery, Object.values(applicationData), (error, results) => {
                if (error) reject(error);
                resolve(results);
            });
        });
    }

    formatInsertSqlQuery(sqlQuery, data) {
        let count = 0;
        for (const key in data) {
            sqlQuery += (count == Object.keys(data).length -1) ? key : `${key},`;
            count++;
        }
        sqlQuery+= ") VALUES (";
        for (let i = 0; i<Object.keys(data).length; i++) {
            if(i == (Object.keys(data).length)-1) sqlQuery+= "?)";
            else sqlQuery+= "?,";
        }
        return sqlQuery;
    }

    addNewDisponibilityDb(volunteerId, dateStart, dateEnd, description, disponibility, eventId) {
        const sqlQuery = "INSERT INTO plannings (user_id_fk, datetime_start, datetime_end, description, disponibility_type, event_id_fk)" + 
        " VALUES (?,?,?,?,?,?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, dateStart, dateEnd, description, disponibility, eventId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllPlanningOfDayDb(startDate, endDate, userId) {
        let sqlQuery = "SELECT p.id,p.user_id_fk AS volunteerId,u.name AS volunteerName,u.lastname AS volunteerLastname,p.disponibility_type," +
        "DATE_FORMAT(p.datetime_start, '%Y-%m-%d %H:%i:%s') AS datetime_start,DATE_FORMAT(p.datetime_end, '%Y-%m-%d %H:%i:%s') AS datetime_end,p.description FROM plannings p" +
        " INNER JOIN users u ON p.user_id_fk = u.id WHERE DATE_FORMAT(p.datetime_start, '%Y-%m-%d') = ";
        
        sqlQuery += (startDate && endDate) ? 
        "DATE_FORMAT(?, '%Y-%m-%d') AND DATE_FORMAT(p.datetime_end, '%Y-%m-%d') = DATE_FORMAT(?, '%Y-%m-%d')" : "CURRENT_DATE()";
        if (userId !== null) sqlQuery += " AND u.id = ?";

        sqlQuery += " ORDER BY p.user_id_fk, DATE_FORMAT(p.datetime_start, '%H') ASC";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [startDate, endDate, userId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getNextDisponibilitiesByVolunteerDb(volunteerId) {
        // This function retrieves the user's future availabilities (an available schedule at 1).
        const sqlQuery = "SELECT id, DATE_FORMAT(datetime_start, '%Y-%m-%d %H:%s:%i') AS datetime_start," +
        "DATE_FORMAT(datetime_end, '%Y-%m-%d %H:%s:%i') AS datetime_end, description FROM plannings " + 
        "WHERE user_id_fk = ? AND disponibility_type = 1 AND DATE_FORMAT(datetime_start, '%Y-%m-%d') > CURRENT_DATE()";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getNextPlanningByVolunteerDb(volunteerId) {
        //  This function retrieves the user's future schedules
        const sqlQuery = "SELECT id, DATE_FORMAT(datetime_start, '%Y-%m-%d %H:%s:%i') AS datetime_start," +
        "DATE_FORMAT(datetime_end, '%Y-%m-%d %H:%s:%i') AS datetime_end, description FROM plannings " + 
        "WHERE user_id_fk = ? AND DATE_FORMAT(datetime_start, '%Y-%m-%d') > CURRENT_DATE()";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getPlanningElementsByVolunteerDateDb(volunteerId, startDate, endDate) {
        /*
        Retrieves schedules whose start date is greater than the requested start date, 
        and whose end date is less than the requested end date, 
        or if the requested end date is greater than the start date.
        Allows to see if the person already has a schedule in the given date ranges
        */
        const sqlQuery = "SELECT * FROM plannings WHERE user_id_fk = ? AND disponibility_type = 0 " +
        "AND ((datetime_start <= ? AND datetime_end > ?) OR (datetime_start > ? AND datetime_start <= ?) " +
        "OR (datetime_end > ? AND datetime_end <= ?))";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, startDate, endDate, startDate, endDate, startDate, endDate], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getDisponibilitiesByVolunteerDateDb(volunteerId, startDate, endDate) {
        const sqlQuery = "SELECT id FROM plannings WHERE user_id_fk = ? AND " +
        "((datetime_start > ? AND datetime_end < ?) OR (datetime_start > ? AND datetime_start < ?))";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, startDate, endDate, endDate, startDate], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllMessagesDb() {
        const sqlQuery = "SELECT id,user_id_fk,message_content,message_date FROM volunteer_chat ORDER BY message_date";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    sendMessageDb(volunteerId, message, type) {
        const sqlQuery = "INSERT INTO volunteer_chat (user_id_fk,message_content,message_type) VALUES (?,?,?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, message, type], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    deleteDisponibilityByIdDb(volunteerId, dispoId) {
        const sqlQuery = "DELETE FROM plannings WHERE user_id_fk = ? AND id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, dispoId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getMessageById(messageId) {
        const sqlQuery = "SELECT id,user_id_fk as authorId,message_content,message_type,message_date FROM volunteer_chat WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [messageId], (error, result) => {
                if (error) reject(error);
                resolve(result[0]);
            });
        });
    }

    deleteMessageByIdDb(volunteerId, messageId) {
        const sqlQuery = "DELETE FROM volunteer_chat WHERE user_id_fk = ? AND id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [volunteerId, messageId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllVolunteersDb() {
        const sqlQuery = "SELECT id, username, name, lastname FROM users WHERE rank >= 3";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
  
    getFormationsById(userId) {
        const sqlQuery = "SELECT * FROM user_formations WHERE user_id_fk = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if(error) reject(error);
                if(result && result[0]) resolve(result[0])
                else resolve(false);
            })
        })
    }
  
    changeApplicationStatus(idApplication, value) {
        const sqlQuery = "UPDATE volunteer_applications SET status = ? WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [value, idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }

    changeRankUser(userId, rank) {
        const sqlQuery = "UPDATE users SET rank = ? WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [rank, userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }
  
    getUserIdByApplication(idApplication) {
        const sqlQuery = "SELECT user_id_fk FROM volunteer_applications WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }
  
    getVolunteerApplicationById(idApplication) {
        const sqlQuery = "SELECT u.id AS userId, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, (SELECT place_name FROM work_places WHERE id = u.work_place) AS work_place, " +
        "va.id, va.cv, va.motivation_letter, va.criminal_record, va.remarks, va.knowledges, va.disponibility_type, va.disponibility_days, va.status, DATE_FORMAT(va.date, \"%d/%m/%Y\") AS date, " +
        "dl.car_license, dl.truck_license, dl.bike_license " +
        "FROM volunteer_applications AS va, users AS u, driving_licenses AS dl WHERE va.id = ? AND va.user_id_fk = u.id AND dl.user_id_fk = u.id";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }

    deleteVolunteerApplicationById(idApplication) {
        const sqlQuery = "DELETE FROM volunteer_applications WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }

    updateApplicationById(idApplication, paramsUpdated){
        let sqlQuery = "UPDATE volunteer_applications SET id = id";
        for (const key in paramsUpdated) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE id = ?";

        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [...Object.values(paramsUpdated), idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    updateApplicationByUserId(idApplication, paramsUpdated){
        let sqlQuery = "UPDATE volunteer_applications SET id = id";
        for (const key in paramsUpdated) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE user_id_fk = ?";

        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [...Object.values(paramsUpdated), idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getAllUsersApplicationsRepository(){
        let sqlQuery = "SELECT u.id, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, (SELECT place_name FROM work_places WHERE id = u.work_place) AS work_place, " +
        "va.id, va.cv, va.motivation_letter, va.criminal_record, va.remarks, va.knowledges, va.disponibility_type, va.disponibility_days, va.status, DATE_FORMAT(va.date, \"%d/%m/%Y\") AS date, " +
        "dl.car_license, dl.truck_license, dl.bike_license " +
        "FROM volunteer_applications AS va, users AS u, driving_licenses AS dl WHERE va.user_id_fk = u.id AND dl.user_id_fk = u.id";
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getApplicationsByStatusRepository(status){
        let sqlQuery = "SELECT u.id, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, (SELECT place_name FROM work_places WHERE id = u.work_place) AS work_place, " +
        "va.id, va.cv, va.motivation_letter, va.criminal_record, va.remarks, va.knowledges, va.disponibility_type, va.disponibility_days, va.status, DATE_FORMAT(va.date, \"%d/%m/%Y\") AS date, " +
        "dl.car_license, dl.truck_license, dl.bike_license" +
        "FROM volunteer_applications AS va, users AS u, driving_licenses AS dl WHERE va.status = ? AND va.user_id_fk = u.id AND dl.user_id_fk = u.id";
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [status], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    setFormationById(userId) {
        let sqlQuery = "INSERT INTO user_formations (user_id_fk, collect, old_people, marauding, study, recruitement) VALUES (?, 0, 0, 0, 0, 0)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getLastVolunteerApplications(amount) {
        let sqlQuery = "SELECT v.id, v.status, u.name, u.lastname FROM volunteer_applications v INNER JOIN users u ON u.id = v.user_id_fk" + 
        " ORDER BY id DESC LIMIT ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }
  
    getApplicationByUserId(userId){
        let sqlQuery = "SELECT id, user_id_fk AS userId, cv, motivation_letter, remarks, knowledges, disponibility_type, disponibility_days, status, DATE_FORMAT(date, \"%d/%m/%Y\") AS date, criminal_record FROM volunteer_applications WHERE user_id_fk = ?";
        
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [userId], (error, result) => {
              if(error) reject(error);
                resolve(result);
            })
        })
    }

    getClosesDispoDates(userId, startDate, closeStartDate, endDate, closeEndDate) {
        let sqlQuery = "SELECT id, DATE_FORMAT(datetime_start, '%Y-%m-%d %H:%s:%i') AS datetime_start," +
        " DATE_FORMAT(datetime_end, '%Y-%m-%d %H:%s:%i') AS datetime_end" +
        " FROM plannings WHERE (datetime_start <= ? AND datetime_start >= ?) OR (datetime_end >= ? AND datetime_end <= ?) AND user_id_fk = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [closeStartDate, startDate, closeEndDate, endDate, userId], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getPlanningElementById(userId, elementId) {
        elementId = Number.parseInt(elementId);
        const sqlQuery = "SELECT id, DATE_FORMAT(datetime_start, '%Y-%m-%d %H:%s:%i') AS datetime_start, DATE_FORMAT(datetime_end, '%Y-%m-%d %H:%s:%i') AS datetime_end," +
        "description, disponibility_type, event_id_fk FROM plannings WHERE id = ? AND user_id_fk = ?";
        
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [elementId, userId], (error, result) => {
                if(error) reject(error);
                if (result && result[0]) resolve(result[0]);
                resolve(result);
            })
        })
    }

    searchUserPlanningByDb(userId, filters) {
        let sqlQuery = "SELECT id,user_id_fk AS volunteer_id, disponibility_type, description," +
        "DATE_FORMAT(datetime_start, '%Y-%m-%d %H:%s:%i') AS datetime_start, DATE_FORMAT(datetime_end, '%Y-%m-%d %H:%s:%i') AS datetime_end " +
        "FROM plannings WHERE user_id_fk = ?";
        if (Object.keys(filters).length > 0) sqlQuery = UtilService.formatUpdateQueryByObject(sqlQuery, filters, true);

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId, ...Object.values(filters)], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getPlanningElementByEventAndUser(eventId, userId) {
        let sqlQuery = "SELECT id FROM plannings WHERE event_id_fk = ? AND user_id_fk = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [eventId, userId], (error, result) => {
                if(error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            })
        })
    }
}

module.exports = VolunteerRepo;