var mysql = require('mysql');
// Initialize pool
var dbconnection     =    mysql.createPool({
    connectionLimit : 10,
    host: "mysql01.hostinguk.net",
    user: "trurocc_dev",
    password: "yoVl94@6",
    database: "trurocc_ridehub_backup_aug2023",
    debug    :  false
});    
// Attempt to catch disconnects 
dbconnection.on('connection', function (connection: { on: (arg0: string, arg1: { (err: any): void; (err: any): void; }) => void; }) {
    console.log('DB Connection established');
  
    connection.on('error', function (err: { code: any; }) {
      console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err: any) {
      console.error(new Date(), 'MySQL close', err);
    });
  
  });
  module.exports = dbconnection;