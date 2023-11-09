

var mysql = require('mysql');
require('dotenv').config();
// Initialize pool
var pool     =    mysql.createPool({
    connectionLimit : 10,
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    debug    :  false
});    


// Attempt to catch disconnects 
pool.on('connection', function (connection: { on: (arg0: string, arg1: { (err: any): void; (err: any): void; }) => void; }) {

    console.log('DB Connection established');
  
    connection.on('error', function (err: { code: any; }) {
      console.error(new Date(), 'MySQL error', err.code);
    });
    connection.on('close', function (err: any) {
      console.error(new Date(), 'MySQL close', err);
    });
  
  });
  module.exports = pool;
  
//}