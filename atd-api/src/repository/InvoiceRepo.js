const DatabaseConnection = require("./Database");

class InvoiceRepo{
    db;
    constructor(){
        this.db = DatabaseConnection
    }

    saveInvoiceRepo(name, lastname, email, address, amount, type){
        const sqlQuery = "INSERT INTO invoices (name, lastname, email, amount, address, type) VALUES (?, ?, ?, ?, ?,?) RETURNING id"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [name, lastname, email, amount, address, type], (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getMyInvoicesRepo(email){
        const sqlQuery = "SELECT id, name, lastname, email, amount, address, type, DATE_FORMAT(date, '%d/%m/%Y') AS date FROM invoices WHERE email = ?"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [email], (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }
    
    getAllInvoicesRepo(){
        const sqlQuery = "SELECT id, name, lastname, email, amount, address, type, DATE_FORMAT(date, '%d/%m/%Y') FROM invoices"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getInvoiceByIdRepo(id){
        const sqlQuery = "SELECT id, name, lastname, email, amount, address, type, DATE_FORMAT(date, '%d/%m/%Y') FROM invoices WHERE id = ?"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [id], (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getInvoiceByEmailRepo(email){
        const sqlQuery = "SELECT id, name, lastname, email, amount, address, type, DATE_FORMAT(date, '%d/%m/%Y') FROM invoices WHERE email = ?"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [email], (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getCardByEmailRepo(email){
        const sqlQuery = "SELECT i.id AS invoice_id, i.name, i.lastname, i.email, i.amount, i.address, i.type, ic.id AS mensual_invoice_id, CAST(AES_DECRYPT(ic.cardId, SHA2(CONCAT(ic.salt, i.email, ic.salt), 512)) AS CHAR) AS cardId FROM invoices AS i, invoices_card AS ic WHERE i.email = 'mathfremiot@gmail.com' AND ic.invoice_id_fk = i.id"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getMensualInvoicesRepo(){
        const sqlQuery = "SELECT i.id AS invoice_id, DATE_FORMAT(i.date, '%d/%m/%Y') , i.name, i.lastname, i.email, i.amount, i.address, i.type, ic.id AS mensual_invoice_id, CAST(AES_DECRYPT(ic.cardId, SHA2(CONCAT(ic.salt, i.email, ic.salt), 512)) AS CHAR) AS cardId FROM invoices AS i, invoices_card AS ic "
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    getMensualInvoicesByEmailRepo(email){
        const sqlQuery = "SELECT i.date, i.id AS invoice_id, i.name, i.lastname, i.email, i.amount, i.address, i.type, ic.id AS mensual_invoice_id, CAST(AES_DECRYPT(ic.cardId, SHA2(CONCAT(ic.salt, i.email, ic.salt), 512)) AS CHAR) AS cardId FROM invoices AS i, invoices_card AS ic WHERE i.email = ? AND ic.invoice_id_fk = i.id"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [email], (error, result) => {
                if(error) reject(error);
                resolve(result)
            })
        })
    }

    saveInvoiceCardRepo(cardId, invoiceId, secretkey, salt){
        const sqlQuery = "INSERT INTO invoices_card (cardId, invoice_id_fk, salt) VALUES (AES_ENCRYPT(?, SHA2(?, 512)), ?, ?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [cardId, secretkey, invoiceId, salt], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
}

module.exports = InvoiceRepo;