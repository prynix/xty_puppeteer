const mysql = require('mysql');
const application = require('./application')
const pool = mysql.createPool(application.db);
module.exports = {
    query: (sql, values) => {
        return new Promise(function (resolve, reject) {
            pool.query(sql, values, function (err, res) {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        })
    }
};
