const DatabaseConnection    = require("./Database");

class UserRepository {
    db;
    static staticDb = DatabaseConnection;
    static OR_SEARCH = 1;
    static AND_SEARCH = 0;

    constructor() {
        // this.dbConnection = new DatabaseConnection();
        // this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }
  
    getUserById(userId) {
        const sqlQuery = "SELECT id,username,name,lastname,rank,email FROM users WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                if (result.length > 0) resolve(result[0]);
                resolve(result);
            });
        });
    }

    getFullUserById(userId) {
        const sqlQuery = "SELECT id,username,name,lastname,rank,email,birthday,address,"+
        "gender,phone,newsletter,notifications,situation FROM users WHERE id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(result);
            });
        });
    }

    static getAllUsers(filter) {
        let sqlQuery = "SELECT id,username,name,lastname,email,rank FROM users";
        if (filter && filter !== null) sqlQuery += ` WHERE rank ${filter}`;
        sqlQuery+=" ORDER BY lastname ASC";
        return new Promise ((resolve, reject) => {
            this.staticDb.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getSaltByLogin(login) {
        const sqlQuery = "SELECT pass_salt AS salt FROM users WHERE username = ? OR email = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [login, login], (error, result) => {
                if (error) reject(error);
                if (result && result[0]) resolve(result[0]);
                else resolve(result);
            });
        });
    }

    getUserByUsername(username) {
        const sqlQuery = "SELECT id, username FROM users WHERE username = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [username], (error, result) => {
                if (error) reject(error);
                resolve(result[0]);
            });
        });
    }

    checkLogin(login, password) {
        const sqlQuery = "SELECT id, username, name, lastname, rank, language FROM users WHERE (username = ? OR email = ?) AND password = ?";
        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [login, login, password], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    checkLoginById(userId, password) {
        const sqlQuery = "SELECT id, username, name, lastname, rank FROM users WHERE id = ? AND password = ?";

        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [userId, password], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }

    patchUserByIdDb(userId, data) {
        let sqlQuery = "UPDATE users SET id = id";
        for (const key in data) sqlQuery += `, ${key} = ?`;
        sqlQuery+=" WHERE id = ?";
        return new Promise((resolve, reject) => {
            // Combine le tableau de valeurs avec le userId
            let test = this.db.query(sqlQuery, [...Object.values(data), userId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            })
        });
    }

    getUserByEmail(email) {
        const sqlQuery = "SELECT * FROM users WHERE email = ?";
        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [email], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    deleteUserById(id){
        const sqlQuery = "DELETE FROM users WHERE id = ?";
        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [id], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });    
    }

    getUserRankById(userId) {
        const sqlQuery = "SELECT rank FROM users WHERE id = ?";

        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                if (result) resolve(result[0]);
            });
        });
    }

    searchUserBy(searchedData, searchType) {
        searchType = (searchType === this.OR_SEARCH) ? "OR" : "AND";
        let sqlQuery = "SELECT id,username,name,lastname FROM users WHERE 1 = 1";
        for (const key in searchedData) {
            if (key !== "min_rank" && key !== "max_rank") searchedData[key] = "%" + searchedData[key] + "%";
            if (key !== "min_rank" && key !== "max_rank") sqlQuery += ` ${searchType} ${key} LIKE ?`;
            else sqlQuery += ` ${searchType} rank ` + ((key === "min_rank") ? ">= ?" : "<= ?");
        }

        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, Object.values(searchedData), (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    searchUsernameRepo(username){
        const sqlQuery = "SELECT username FROM users WHERE username = ?";
        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [username], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    searchEmailRepo(email){
        const sqlQuery = "SELECT email FROM users WHERE email = ?";
        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [email], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    insertLoginLogDb(login, success, date) {
        let sqlQuery = "INSERT INTO login_logs (login_value, success, login_date) VALUES ";
        sqlQuery += (date !== null) ? "(?,?,?)" : "(?,?,DEFAULT)";

        return new Promise ((resolve, reject) => {
            this.db.query(sqlQuery, [login, success, date], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getSaltById(userId) {
        const sqlQuery = "SELECT pass_salt AS salt FROM users WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                if (result && result[0]) resolve(result[0]);
                else resolve(result);
            });
        });
    }

    insertForgotPassCode(userId, code) {
        const sqlQuery = "UPDATE users SET forget_code = ? WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [code, userId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getForgotPassCode(userId) {
        const sqlQuery = "SELECT forget_code FROM users WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [userId], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }

    getUserByForgotPassCode(email, code) {
        const sqlQuery = "SELECT id,forget_code,pass_salt FROM users WHERE email = ? AND forget_code = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [email, code], (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }

    createUserDb(data) {
        const sqlQuery = "INSERT INTO users (username,email,name,lastname,birthday,password,rank,pass_salt) VALUES (?,?,?,?,?,?,?,?)";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [data.username, data.email, data.name, 
                                    data.lastname, data.birthday, data.password, data.rank, data.salt], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }
}

module.exports = UserRepository;