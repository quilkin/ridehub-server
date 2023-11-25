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
    let sql = `SELECT dest FROM rides where date= '${ride.date}' and leaderName = '${ride.leaderName}'`
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

      dbconnection.query(sql,function (error: { code: any; }, results: { insertId: { toString: () => string; }; })
      {
       
        if (error != null) {
          next(error);
          return;
        }
        SendNotificationEmails(ride,next);

        const rideID = results.insertId;
        logUser(`Ride ${rideID} saved`);
        response.json(rideID.toString());
    

      })

    });
      //if (ride.leaderName.toLowerCase().startsWith("tester") === false)
  }

  export function editRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: any) {

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

