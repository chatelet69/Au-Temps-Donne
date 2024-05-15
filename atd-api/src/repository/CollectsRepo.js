const DatabaseConnection = require("./Database");
const moment                = require('moment');

class CollectsRepository {
    db;

    constructor() {
        this.db = DatabaseConnection;
    };

    checkAvailabilityDriverRepo(idDriver, endDate, startDate){
        const formattedStartDate = moment(startDate).format('YYYY-MM-DD HH:mm:ss');
        const formattedEndDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');

        const sqlQuery = "SELECT id from collects\n" +
        "where driver_id_fk = ?\n" +
        "AND ((start_date <= ? AND end_date > ?) OR (start_date > ? AND end_date <= ?) OR (end_date > ? AND start_date <= ?))"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idDriver, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate, formattedStartDate, formattedEndDate], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }

    getAllCollectsRepo(){
        const sqlQuery = "SELECT collects.id, date_format(collects.start_date, '%Y-%m-%d %H:%i:%s') as start_date, date_format(collects.end_date, '%Y-%m-%d %H:%i:%s') as end_date, collects.driver_id_fk, collects.traject_file, CONCAT(users.name, ' ', users.lastname) AS driver, status\n" +
        "FROM collects\n" +
        "INNER JOIN users ON collects.driver_id_fk = users.id\n"+
        "WHERE status = 1 "+
        "ORDER BY collects.end_date DESC"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getCollectByIdRepo(idCollect){
        console.log("getCollectByIdRepo")
        const sqlQuery = "SELECT collects.id, date_format(collects.start_date, '%Y-%m-%d %H:%i:%s') as start_date, date_format(collects.end_date, '%Y-%m-%d %H:%i:%s') as end_date, collects.driver_id_fk, CONCAT(users.name, ' ', users.lastname) AS driver, status\n"+
        "FROM collects\n"+
        "INNER JOIN users ON collects.driver_id_fk = users.id\n"+
        "WHERE collects.id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    postCollectRepo(data) {
        const formattedDateStart = moment(data.start_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const formattedDateEnd = moment(data.end_date, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        const sqlQuery = "INSERT INTO collects (start_date, end_date, driver_id_fk, traject_file, status) VALUES (?,?,?,'traject', 1)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [formattedDateStart, formattedDateEnd, data.driver], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    addPartnertRepo(data, coords) {
        const sqlQuery = "INSERT INTO partner (description, address, zip_code, city, lng, lat, status) VALUES (?,?,?,?,?,?,1)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.description, data.address, data.zip_code, data.city,  coords[0].lng, coords[0].lat], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    addPartnerToCollectRepo(idCollect, partner) {
        const sqlQuery = "INSERT INTO collect_trajects (collect_id, partner_id) VALUES (?,?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect, partner], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    };

    getNextCollectsRepo(){
        const sqlQuery = "SELECT date_format(collects.start_date, '%Y-%m-%d %H:%i:%s') as start_date, date_format(collects.end_date, '%Y-%m-%d %H:%i:%s') as end_date, CONCAT(users.name, ' ', users.lastname) AS driver FROM collects INNER JOIN users ON collects.driver_id_fk = users.id WHERE collects.end_date > NOW() ORDER BY collects.start_date ASC LIMIT 5;"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    deleteCollectRepo(idCollect){
        const sqlQuery = "UPDATE collects SET status = 0 WHERE id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    deletePartnerFromCollectRepo(idCollect, idPartner){
        const sqlQuery = "DELETE FROM collect_trajects WHERE collect_id = ? AND partner_id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect, idPartner], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    editCollectByIdRepo(data, idCollect){
        let sqlQuery = "UPDATE collects SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(data), idCollect], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }

    getAllPartnerRepo(){
        const sqlQuery = "SELECT id, address, zip_code, city, lng, lat, description from partner where status = 1"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getAllPartnerByTrajectRepo(idCollect){
        const sqlQuery = "SELECT collect_trajects.id, collect_trajects.collect_id, collect_trajects.partner_id, partner.description, partner.address, partner.city, partner.zip_code, partner.lng, partner.lat from collect_trajects\n" +
        "inner join partner on partner_id = partner.id\n" +
        "where collect_trajects.collect_id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getAllStockByCollectRepo(idCollect){
        const sqlQuery = "select work_places.place_name, stock.id, stock.title, stock.amount, stock.barcode, date_format(stock.expiry_date, '%Y-%m-%d %H:%i:%s') as expiry_date, CONCAT(work_places.place_name, ' ', stock.location) AS location from stock\n" +
        "INNER JOIN work_places ON stock.idEntrepot_fk = work_places.id\n" + 
        "where collect_id = ?" 
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idCollect], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getCollectsByDriverRepo(idDriver){
        const sqlQuery = "SELECT id, DATE_FORMAT(start_date, '%d/%m/%Y %h:%i') AS start_date, DATE_FORMAT(end_date, '%d/%m/%Y %h:%i') AS end_date, driver_id_fk, status FROM collects WHERE driver_id_fk = ? AND start_date > curdate()"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idDriver],(error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }
    
}

module.exports = CollectsRepository;