const DatabaseConnection = require("./Database");

class BeneficiaryRepository {
    dbConnection = null;
    db;
    
    constructor() {
        //this.dbConnection = new DatabaseConnection();
        //this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }

    createBeneficiaryApplicationDb(applicationData){
        let sqlQuery = "INSERT INTO beneficiary_applications (";
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
            if(count == (Object.keys(data).length) - 1) sqlQuery+= `${key}`;
            else sqlQuery+= `${key},`;
            count++;
        }
        count=0;
        sqlQuery+= ") VALUES(";
        for (let i = 0; i<Object.keys(data).length; i++) {
            if(i == (Object.keys(data).length)-1) sqlQuery+= "?)";
            else sqlQuery+= "?,";
        }
        return sqlQuery;
    }
    getAllBeneficiariesApplicationsRepository(){
        let sqlQuery = "SELECT u.id AS userId, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, u.work_place, \
        ba.id, ba.status, ba.situation_proof, ba.debts_proof, ba.home_proof, ba.payslip, ba.reason_application, DATE_FORMAT(ba.date, \"%d/%m/%Y\") AS date \
        FROM beneficiary_applications AS ba, users AS u WHERE ba.user_id_fk = u.id";
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }
    getBeneficiaryApplicationById(idApplication){
        let sqlQuery = "SELECT u.id AS userId, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, u.work_place, \
        ba.id, ba.status, ba.situation_proof, ba.debts_proof, ba.home_proof, ba.payslip, ba.reason_application, DATE_FORMAT(ba.date, \"%d/%m/%Y\") AS date \
        FROM beneficiary_applications AS ba, users AS u WHERE ba.id = ? AND ba.user_id_fk = u.id";
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [idApplication] ,(error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getBeneficiaryApplicationByUserId(beneficiaryId){
        let sqlQuery = "SELECT u.id AS userId, u.username, u.email, u.name, u.lastname, u.birthday, u.address, u.gender, u.phone, u.situation, u.pfp, u.work_place, \
        ba.id, ba.status, ba.situation_proof, ba.debts_proof, ba.home_proof, ba.payslip, ba.reason_application, DATE_FORMAT(ba.date, \"%d/%m/%Y\") AS date \
        FROM beneficiary_applications AS ba, users AS u WHERE u.id = ? AND ba.user_id_fk = u.id";
        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [beneficiaryId] ,(error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    changeBeneficiaryApplicationStatus(idApplication, newStatus){
        const sqlQuery = "UPDATE beneficiary_applications SET status = ? WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [newStatus, idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }
    updateBeneficiaryApplicationByUserId(idApplication, paramsUpdated){
        let sqlQuery = "UPDATE beneficiary_applications SET id = id";
        for (const key in paramsUpdated) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE user_id_fk = ?";

        return new Promise((resolve, reject) =>{
            this.db.query(sqlQuery, [...Object.values(paramsUpdated), idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        })
    }

    getUserIdByBenefApplication(idApplication) {
        const sqlQuery = "SELECT user_id_fk FROM beneficiary_applications WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idApplication], (error, result) => {
                if(error) reject(error);
                resolve(result);
            })
        });
    }
}

module.exports = BeneficiaryRepository;