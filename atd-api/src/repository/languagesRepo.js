const DatabaseConnection = require("./Database");
const fs = require('fs');

class LanguageRepository{
    db;
    constructor(){
        this.db = DatabaseConnection;
    }
    async getLanguagesRepo(){
        const sqlQuery = "SELECT language_acr, language_name FROM language_list"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, (error, result) =>{
                if(error) reject(error);
                else resolve(result);
            })
        })
    }
    async getTraductionsByLanguageRepo(lang){
        fs.readFile("./languages/" + lang + ".json", 'utf-8', function(err, data){
            if(err){
                console.log(err)
                return false;
            }else{
                return data;
            }
        })
    }
    async addLanguageDb(language_acr, language_name){
        const sqlQuery = "INSERT INTO language_list (language_acr, language_name) VALUES (?, ?)"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [language_acr, language_name] ,(error, result) =>{
                if(error) reject(error);
                else resolve(true);
            })
        })
    }
    
    async setLanguageRepo(language_acr, userId){
        const sqlQuery = "UPDATE users SET language = ? WHERE id = ?"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [language_acr, userId] ,(error, result) =>{
                if(error) reject(error);
                else resolve(true);
            })
        })
    }

    async getLanguageByUserIdRepo(userId){
        const sqlQuery = "SELECT language FROM users WHERE id = ?"
        return new Promise((resolve, reject)=>{
            this.db.query(sqlQuery, [userId] ,(error, result) =>{
                if(error) reject(error);
                else resolve(result);
            })
        })
    }
}
module.exports = LanguageRepository;