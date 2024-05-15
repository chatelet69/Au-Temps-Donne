const DatabaseConnection = require("./Database");

class StorageRepository {
    db;

    constructor() {
        // //this.dbConnection = new DatabaseConnection();
        // //this.db = this.dbConnection.getConnectionPool();
        this.db = DatabaseConnection;
    }

    getAllWarehousesDb() {
        const sqlQuery = "SELECT id,address,place_name,phone,capacity from work_places WHERE place_type = 'warehouse'";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getAllWorkPlacesDb() {
        const sqlQuery = "SELECT id,address,place_type, place_name,phone,capacity from work_places";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getMissingStockRepo(missAmount) {
        const sqlQuery = "SELECT category, SUM(amount) AS amount FROM stock WHERE amount < ? AND status = 1 AND expiry_date>curdate() GROUP BY category";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [missAmount], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getStockGroupByTypeRepo() {
        const sqlQuery = "SELECT category, SUM(amount) AS amount FROM stock WHERE status = 1 AND expiry_date>curdate() GROUP BY category";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getLastStockRepo(limitLastStock) {
        const sqlQuery = "SELECT work_places.place_name, stock.title, DATE_FORMAT(stock.insert_date, \"%d/%m/%Y\") AS date, stock.amount FROM stock, work_places WHERE stock.idEntrepot_fk = work_places.id AND stock.status = 1 ORDER BY date DESC LIMIT ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [limitLastStock], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getTotalStockRepo() {
        const sqlQuery = "SELECT collect_id, picture, barcode, title, idEntrepot_fk, location, amount, type, category, allergy, st.id AS stockId, wp.place_name AS entrepot, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date FROM stock AS st, work_places AS wp WHERE status = 1 AND st.idEntrepot_fk = wp.id AND expiry_date > curdate()";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) {
                    console.log(error);
                    return false;
                }
                resolve(result);
            });
        });
    }

    getStockByLocation(bodyId) {
        let sqlQuery = "SELECT *, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date from stock WHERE status = status";
        for (let key in bodyId) {
            sqlQuery += " AND " + key + "=?"
        }
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(bodyId)], (error, result) => {
                if (error) {
                    reject(error)
                };
                resolve(result);
            });
        });
    }

    getStockByTypeRepo(type) {
        const sqlQuery = "SELECT *, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date from stock WHERE status = 1 AND type = ? AND expiry_date > curdate()";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [type], (error, result) => {
                if (error) {
                    console.log(error);
                    return false;
                }
                resolve(result);
            });
        });
    }

    getStockByIdRepo(id) {
        const sqlQuery = "SELECT picture, collect_id, barcode, title, idEntrepot_fk, location, amount, type, category, allergy, st.id AS stockId, wp.place_name AS entrepot, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date FROM stock AS st, work_places AS wp WHERE st.id = ? AND st.idEntrepot_fk = wp.id";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [id], (error, result) => {
                if (error) return false;
                resolve(result);
            });
        });
    }

    getCollectProductService(barcode, name, amount, type, category, allergy, status, expiry_date, picture, collect_id) {
        const sqlQuery = "INSERT INTO stock (barcode, title, amount, type, category, allergy, status, expiry_date, picture, collect_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [barcode, name, amount, type, category, allergy, status, expiry_date, picture, collect_id], (error, result) => {
                if (error) {
                    console.log(error)
                    return false;
                }
                resolve(true)
            });
        });
    }

    addStockInLocationRepo(barcode, name, amount, type, category, allergy, status, expiry_date, idEntrepot_fk, location) {
        const sqlQuery = "INSERT INTO stock (barcode, title, amount, type, category, allergy, status, expiry_date, idEntrepot_fk, location) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [barcode, name, amount, type, category, allergy, status, expiry_date, idEntrepot_fk, location], (error, result) => {
                if (error) {
                    console.log(error)
                    return false;
                }
                resolve(true)
            });
        });
    }

    receptCollectProductsRepo(idEntrepot, location, barcode, collect_id) {
        const sqlQuery = "UPDATE stock set idEntrepot_fk = ?, location = ?, status = 1 WHERE barcode = ? AND status = 0 AND collect_id = ?";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [idEntrepot, location, barcode, collect_id], (error, result) => {
                if (error) {
                    console.log(error)
                    return false;
                }
                resolve(result);
            });
        });
    }

    updateStockByProductRepo(amount, bodyId) {
        let sqlQuery = "UPDATE stock set amount = (amount + ?) WHERE status = 1";
        for (let key in bodyId) {
            sqlQuery += " AND " + key + "=?"
        }
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount, ...Object.values(bodyId)], (error, result) => {
                if (error) resolve(error);
                resolve(result);
            });
        });
    }

    moveStockByProductRepo(location, idEntrepot, id) {
        console.log(location, idEntrepot, id)
        let sqlQuery = "UPDATE stock SET idEntrepot_fk = ?";
        if (location != "") {
            sqlQuery += ", location = ? "
        }
        sqlQuery += "WHERE id = ?";
        let valArray = (location != "") ? [idEntrepot, location, id] : [idEntrepot, id];
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, valArray, (error, result) => {
                console.log(error)
                if (error) resolve(error);
                resolve(result);
            });
        });
    }

    getNearDlcProductsRepo(date) {
        const sqlQuery = "SELECT *, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATEDIFF(expiry_date, curdate()) AS dayBeforeExpiration, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date from stock WHERE expiry_date <= ? AND expiry_date>=curdate() AND status = 1";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [date, date], (error, result) => {
                if (error) {
                    console.log(error)
                    return false;
                }
                resolve(result);
            });
        });
    }

    getDlcProductsRepo() {
        const sqlQuery = "SELECT *, DATE_FORMAT(insert_date, \"%d/%m/%Y\") as insert_date, DATE_FORMAT(expiry_date, \"%d/%m/%Y\") as expiry_date from stock WHERE expiry_date < curdate() AND status = 1";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) {
                    console.log(error)
                    return false;
                }
                resolve(result);
            });
        });
    }

    deleteStockByIdRepo(bodyId) {
        let sqlQuery = "DELETE FROM stock WHERE status = status";
        for (let key in bodyId) {
            sqlQuery += " AND " + key + "=?"
        }
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [...Object.values(bodyId)], (error, result) => {
                if (error) {
                    reject(error);
                }
                resolve(result);
            });
        });
    }

    getAmountStockRepo() {
        const sqlQuery = "SELECT SUM(amount) AS total_stock FROM stock where expiry_date > curdate();";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getEvolutionStockRepo() {
        const sqlQuery = "SELECT amount, date FROM stock_evolution;";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    addAmountStockRepo(amount) {
        const sqlQuery = "INSERT INTO stock_evolution (amount, date) VALUES (?, curdate()+1);";
        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    removeAmountStockDb(amount, stockId) {
        const sqlQuery = "UPDATE stock SET amount = (amount - ?) WHERE id = ?";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, [amount, stockId], (error, result) => {
                if (error) reject(error);
                resolve(result);
            });
        });
    }

    getExpectedFlowDb() {
        const sqlQuery = "SELECT SUM(amount) as sumStocks FROM event_stocks WHERE status = 'pending'";

        return new Promise((resolve, reject) => {
            this.db.query(sqlQuery, (error, result) => {
                if (error) reject(error);
                if (result && result.length > 0) resolve(result[0]);
                resolve(null);
            });
        });
    }
}

module.exports = StorageRepository;