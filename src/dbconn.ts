//var mysql = require('mysql');

import mysql  from 'mysql';
import * as dotenv from "dotenv";


export var dbconnection : mysql.Pool;

// export function dbConnection() : mysql.Pool{
//   console.log('host: ' + process.env.host);
//   return dbconnection;
// }
export function createPool(configPath : string) : mysql.Pool{
  //const configPath =  __dirname+'../.env'
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


  // exports.executeQuery=function(query: string,callback: (arg0: null, arg1: { rows: any; }) => void){
  //   pool.getConnection(function(err: any,connection: { release: () => void; query: (arg0: string, arg1: (err: any, rows: any) => void) => void; on: (arg0: string, arg1: (err: any) => void) => void; }){
  //       if (err) {
  //         connection.release();
  //         throw err;
  //       }   
  //       connection.query(query,function(err: any,rows: any){
  //           connection.release();
  //           if(!err) {
  //               callback(null, {rows: rows});
  //           }           
  //       });
  //       connection.on('error', function(err: any) {      
  //             throw err;
  //             return;     
  //       });
  //   });
//}