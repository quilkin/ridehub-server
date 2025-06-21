import mysql  from 'mysql';
import * as dotenv from "dotenv";
export var dbconnection : mysql.Pool;


export function createPool(configPath : string) : mysql.Pool{

  dotenv.config({ path: configPath });
  console.log('host: ' + process.env.host);
  dbconnection     =    mysql.createPool({
    connectionLimit : 10,
    waitForConnections: true,
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
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
  return dbconnection;
}


