const mysql     = require('mysql2');
const config    = require("../../config.json");

// class Database {
//     connectionPool;

//     constructor() {
//         this.connectionPool = mysql.createPool({
//             host: config.host,
//             user: config.user,
//             password: config.password,
//             database: config.database,
//             waitForConnections: true,
//             maxIdle: config.databaseConnectionlimit,
//             connectionLimit: config.databaseConnectionlimit,
//             queueLimit: 0,
//             port: 3306
//         });
//     }
    
//     getConnectionPool() {
//         return this.connectionPool;
//     }

//     close() {
//         this.connectionPool.end;
//     }
// }

const DatabaseConnection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 15,
    port: 3306
});

module.exports = DatabaseConnection;

//module.exports = Database;