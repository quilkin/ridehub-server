import { dbconnection } from './dbconn.js'  ;

import { Ride } from './common/ride.js'
import { SendNotificationEmails } from './email.js'
import {  logUser } from './utils/logger.js';

function GetRidOfApostrophes(data : string): string
{
    return data.replace("'", "''");
}

export function getRidesForDate(request: { body: { data: number; }; }, response: { json: (arg0: Ride[] ) => void; }, next: (arg0: { code: any; }) => void ) {
  const date = request.body.data;
  const sql = `SELECT * FROM rides where date > ${date-1} and date <= ${date+60} order by date asc`;


  dbconnection.query(sql,function (error: { code: any; }, results: Ride[])
  {
    if (error != null) {
      next(error);

    }
    else
        response.json(results);
  });
}

  
 
export function saveRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const ride = request.body.data;
    ride.meetingAt = GetRidOfApostrophes(ride.meetingAt);
    ride.description = GetRidOfApostrophes(ride.description);

     // check for existing rides
    let sql = `SELECT rideID FROM rides where date= '${ride.date}' and leaderName = '${ride.leaderName}'`
    dbconnection.query(sql,function (error: { code: any; }, results: string[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length > 0) {
        response.json("There is already a ride with you as leader on the same date. Please choose another date.");
        return;
      }
      sql = `insert into rides (routeID,leaderName,date,time,meetingAt,description,groupSize,minSpeed,maxSpeed)`;
      sql += ` values ('${ride.routeID}','${ride.leaderName}','${ride.date}','${ride.time}','${ride.meetingAt}',`;
      sql += `'${ride.description}','${ride.groupSize}','${ride.minSpeed}','${ride.maxSpeed}')`;
      // get new ride ID

      dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
      {
        if (error != null) {
          next(error);
          return;
        }
        ride.rideID = results.insertId;
        SendNotificationEmails(ride,response,next) ;
      })
    });
  }

  export function editRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: any) {
    const ride = request.body.data;
    ride.meetingAt = GetRidOfApostrophes(ride.meetingAt);
    ride.description = GetRidOfApostrophes(ride.description);
    
    let sql = `update rides set meetingAt = '${ride.meetingAt}', description = '${ride.description}',`;
    sql += ` time = '${ride.time}', groupSize = '${ride.groupSize}', minSpeed = '${ride.minSpeed}', maxSpeed= '${ride.maxSpeed}'`;
    sql += `, date= '${ride.date}', leaderName='${ride.leaderName}' where rideID = '${ride.rideID}'`;

    dbconnection.query(sql,function (error: { code: any; }, results: { insertId: number; })
    {
      if (error != null) {
        next(error);
        return;
      }
      // todo : send emails to signed-up riders if date changed?
      //SendNotificationEmails(ride,response,next) ;
      response.json('OK');
      
    })

  }

  export function deleteRide(request: { body: { data: number; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const rideID = request.body.data;
    const sql = `delete from rides where rideID = ${rideID}`;

    dbconnection.query(sql,function (error: { code: any; }, results: string)
    {
      logUser(`Ride ${rideID} deleted`);
      if (error != null) 
        next(error);
      else
       response.json('OK');
    });
  }

