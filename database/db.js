const mysql = require('mysql2')

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'tiger',
    database:'PaperVault',
    multipleStatements: true
});

db.connect(err => {
    if(err){
        console.log("Database Connection Fail", err)
    }
    console.log("Database Connected Successfully!");
})

module.exports = db;