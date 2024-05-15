const DatabaseConnection = require("./Database");
const moment             = require('moment');

class PartnersRepository {
    db;

    constructor() {
        this.db = DatabaseConnection;
    };


    getAllPartnersRepo(){
        const sqlQuery = "SELECT id, address, zip_code, city, lng, lat, description from partner where status = 1"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    getPartnerByIdRepo(idPartner){
        const sqlQuery = "SELECT id, address, zip_code, city, lng, lat, description from partner where id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idPartner], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    deletePartnerRepo(idPartner){
        console.log("deletePartnerRepo")
        const sqlQuery = "UPDATE partner SET status = 0 WHERE id = ?"
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idPartner], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    };

    editPartnerRepo(data, idPartner){
        console.log("passe dans editPartnerRepo")
        let sqlQuery = "UPDATE partner SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(data), idPartner], (error, result) => {
                if (error) throw error;
                resolve(result);
            });
        });
    }
}

module.exports = PartnersRepository;