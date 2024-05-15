const DatabaseConnection = require("./Database");
const moment                = require('moment');

class FormationsRepository {
    db;

    constructor() {
        // this.dbConnection = new DatabaseConnection();
        // this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    };

    checkAvailabilityResponsable(idResponsable, endDate, startDate){
        const formattedStartDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');

        return new Promise((resolve, reject) => {
            this.db.query(`SELECT id FROM formations WHERE user_id_fk = ? AND status = 'SCHEDULED' AND ((datetime_start <= ? AND datetime_end > ?) OR (datetime_start > ? AND datetime_end <= ?) OR (datetime_end > ? AND datetime_start <= ?))`,
                [idResponsable, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate], (error, results) => {
                    if (error) reject(error);
                    resolve(results);
                });
        });
    }

    postFormation(data) {
        const formattedDateStart = moment(data.date_start, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const formattedDateEnd = moment(data.date_end, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const sqlQuery = "INSERT INTO formations (work_place_id_fk, title, datetime_start, datetime_end, nb_places, user_id_fk, type, status) VALUES (?,?,?,?,?,?,?,?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.work_place, data.title, formattedDateStart, formattedDateEnd, data.nb_place, data.responsable, data.type, 'SCHEDULED'], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    deleteFormation(idFormation){
        const sqlQuery = "UPDATE formations SET status = 'CANCELLED' WHERE id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idFormation], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getFormationById(idFormation){
        const sqlQuery = "SELECT f.id, f.title, date_format(f.datetime_start, '%Y-%m-%d %H:%i:%s') as datetime_start," +
        " date_format(f.datetime_end, '%Y-%m-%d %H:%i:%s') as datetime_end, f.nb_places, f.status, f.description, w.place_name as place, CONCAT(u.name, ' ', u.lastname) AS responsable, a.name as activities " +
            "FROM formations f INNER JOIN work_places w ON f.work_place_id_fk = w.id " +
            "INNER JOIN users u ON f.user_id_fk = u.id " +
            "INNER JOIN activities a ON f.type = a.id " +
            "WHERE f.id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idFormation], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };


    getAllFormations(){
        const sqlQuery = "SELECT formations.id, formations.title, date_format(formations.datetime_start, '%Y-%m-%d %H:%i:%s') as datetime_start, date_format(formations.datetime_end, '%Y-%m-%d %H:%i:%s') as datetime_end, formations.nb_places, formations.status, formations.description, work_places.place_name as place, CONCAT(users.name, ' ', users.lastname) AS responsable, activities.name as activities\n" +
            "FROM formations\n" +
            "INNER JOIN work_places ON formations.work_place_id_fk = work_places.id\n" +
            "INNER JOIN users ON formations.user_id_fk = users.id\n" +
            "INNER JOIN activities ON formations.type = activities.id\n" +
            "ORDER BY formations.datetime_start DESC"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getFormationsByParams(whereParams, orderParams){
        let sqlQuery = "SELECT * from formations"
        if (Object.keys(whereParams).length !== 0){
            sqlQuery+=" WHERE";
            const whereKeys = Object.keys(whereParams);
            whereKeys.forEach((key, index) => {
                sqlQuery += ` ${key} = ?`;
                if (index !== whereKeys.length - 1) {
                    sqlQuery += " AND";
                }
            });
        }
        if (Object.keys(orderParams).length !== 0){
            sqlQuery+=" order by";
            const orderKeys = Object.keys(orderParams);
            orderKeys.forEach((key, index) => {
                sqlQuery += ` ${key}`;
                if (index !== orderKeys.length - 1) {
                    sqlQuery += ",";
                }
            });
        }
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(whereParams), ...Object.values(orderParams)], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getFormationsByStartDate(){
        const sqlQuery = "SELECT * from formations order by datetime_start"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }; 

    editFormationById(data, idFormation){
        let sqlQuery = "UPDATE formations SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(data), idFormation], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }

    inscriptionFormation(data){
        let sqlQuery = "insert into registered_formation (user_id_fk, formation_id_fk, status, date) values (?, ?, 'ATTENTE', NOW())";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.user, data.formation], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    countInscription(idFormation){
        const sqlQuery = "select count(formation_id_fk) as nbInscrit from registered_formation where formation_id_fk = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idFormation], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    getResumeNextFormationsDb(amount) {
        const sqlQuery = "SELECT id,title,DATE_FORMAT(datetime_start, '%Y-%m-%d') AS datetime_start FROM " +
        "formations WHERE datetime_start >= CURRENT_DATE() ORDER BY id DESC LIMIT ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllWorkPlaceRepo(){
        const sqlQuery = "SELECT id, place_name FROM work_places";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getFuturFormationsRepo(){
        const sqlQuery = "SELECT formations.id, formations.title, date_format(formations.datetime_start, '%Y-%m-%d %H:%i:%s') as datetime_start, date_format(formations.datetime_end, '%Y-%m-%d %H:%i:%s') as datetime_end, formations.nb_places, formations.status, work_places.place_name as place, CONCAT(users.name, ' ', users.lastname) AS responsable, activities.name as activities\n" +
            "FROM formations\n" +
            "INNER JOIN work_places ON formations.work_place_id_fk = work_places.id\n" +
            "INNER JOIN users ON formations.user_id_fk = users.id\n" +
            "INNER JOIN activities ON formations.type = activities.id\n" +
            "WHERE formations.datetime_start > now() " +
            "AND formations.status = 'SCHEDULED'"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getAllInscritRepo(idFormation){
        const sqlQuery = "select registered_formation.user_id_fk, users.name, users.lastname, registered_formation.status, date_format(registered_formation.date, '%Y-%m-%d %H:%i:%s') as date\n" +
            "from registered_formation\n" +
            "inner join users on registered_formation.user_id_fk = users.id\n" +
            "where formation_id_fk = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idFormation], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };


    getInscritRepo(formation, user){
        const sqlQuery = "SELECT count(*) as inscrit from registered_formation where user_id_fk = ? and formation_id_fk = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [user, formation], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getAllCertificatFormationByIdRepo(idUser){
        const sqlQuery = "SELECT collect, old_people, marauding, study, recruitement, stock, formation FROM user_formations where user_id_fk = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idUser], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    addStatusFormationRepo(idUser){
        const sqlQuery = "INSERT INTO user_formations (user_id_fk, collect, old_people, marauding, study, recruitement, stock, formation) values (?, 0, 0, 0, 0, 0, 0, 0)"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idUser], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    updateStatusUserFormationRepo(data, idUser){
        let sqlQuery = "UPDATE user_formations SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE user_id_fk = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(data),idUser], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    updateStatusRegisterFormationRepo(status, idUser, idFormation){
        let sqlQuery = "UPDATE registered_formation SET status = ? WHERE user_id_fk = ? AND formation_id_fk = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [status, idUser, idFormation], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getAllFormationsByUserRepo(user, date){
        const sqlQuery = "select registered_formation.user_id_fk, registered_formation.formation_id_fk, formations.title, formations.description, date_format(formations.datetime_start, '%Y-%m-%d %H:%i:%s') as datetime_start, date_format(formations.datetime_end, '%Y-%m-%d %H:%i:%s') as datetime_end ,"+
        "users.name, users.lastname, "+
        "work_places.place_name, "+
        "activities.name as formation_type, "+
        "TIME_FORMAT(formations.datetime_start, '%H:%i') AS datetime_start_formated, "+
        "TIME_FORMAT(formations.datetime_end, '%H:%i') AS datetime_end_formated "+
        "from registered_formation "+
        "inner join formations on registered_formation.formation_id_fk = formations.id "+
        "inner join users on formations.user_id_fk = users.id "+
        "inner join work_places on formations.work_place_id_fk = work_places.id "+
        "inner join activities on formations.type = activities.id "+
        "where registered_formation.user_id_fk = ? "+
        "AND DATE(formations.datetime_start) = ?;"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [user, date], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };
}

module.exports = FormationsRepository;