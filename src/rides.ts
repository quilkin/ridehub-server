import { dbconnection } from './dbconn.js'  ;

import { Ride } from './common/ride.js'
import { SendNotificationEmails , SendChangeNotificationEmails } from './email.js'
import {  logUser } from './utils/logger.js';
import { getParticipantsForRide } from './participants.js'
import { rideCount } from './common/participant.js';

function GetRidOfApostrophes(data : string): string
{
  //  return data.replace(/'/g, "''");
  return data;
}

export function getRidesForDate(request: { body: { data: number; }; }, response: { json: (arg0: Ride[] ) => void; }, next: (arg0: { code: any; }) => void ) {
  const date = request.body.data;
  const sql = `SELECT * FROM rides where date > ? and date <= ? order by date asc`;

  dbconnection.query(sql, [date - 1, date + 60], function (error: any, results: Ride[])
  {
    if (error != null) {
      next(error);
      return;
    }
    response.json(results);
  });
}

export function saveRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const ride = request.body.data;
    ride.meetingAt = GetRidOfApostrophes(ride.meetingAt);
    ride.description = GetRidOfApostrophes(ride.description);

    const checkSql = `SELECT rideID FROM rides where date = ? and leaderName = ?`;
    dbconnection.query(checkSql,[ride.date, ride.leaderName], function (error: any, results: any[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length > 0) {
        response.json("There is already a ride with you as leader on the same date. Please choose another date.");
        return;
      }

      const insertSql = `insert into rides (routeID,leaderName,date,time,meetingAt,dest,description,groupSize,minSpeed,maxSpeed)`;
      const insertParams = [ride.routeID, ride.leaderName, ride.date, ride.time, ride.meetingAt, ride.dest, ride.description, ride.groupSize, ride.minSpeed, ride.maxSpeed];
      const insertQuery = `${insertSql} values (?,?,?,?,?,?,?,?,?,?)`;

      dbconnection.query(insertQuery, insertParams, function (error: any, results: { insertId: number; })
      {
        if (error != null) {
          next(error);
          return;
        }
        ride.rideID = results.insertId;
        logUser(`Ride ${ride.rideID} saved by ${ride.leaderName} `);
        SendNotificationEmails(ride,response,next);
      })
    });
  }

  export function editRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: any) {
    const ride = request.body.data;
    ride.meetingAt = GetRidOfApostrophes(ride.meetingAt);
    ride.description = GetRidOfApostrophes(ride.description);
    ride.dest = GetRidOfApostrophes(ride.dest);

    const sql = `update rides set meetingAt = ?, dest= ?, description = ?, time = ?, groupSize = ?, minSpeed = ?, maxSpeed = ?, date = ?, leaderName = ?, routeID = ? where rideID = ?`;
    const params = [ride.meetingAt, ride.dest, ride.description, ride.time, ride.groupSize, ride.minSpeed, ride.maxSpeed, ride.date, ride.leaderName, ride.routeID, ride.rideID];

    dbconnection.query(sql, params, function (error: any, results: any)
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Ride ${ride.rideID} edited `);
      if (ride.emailRequired) {
        const ridersSql = `SELECT rider FROM Participants where rideID = ?`;
        dbconnection.query(ridersSql, [ride.rideID], function (error: any , result: any[])
          {
            if (error != null) {
              next(error);
              return;
            }

            let riders : string[] = [];
            for (let row = 0; row < result.length; row++) {
              const r = result[row];
              riders.push("'"+r.rider+"'")
            }

            if (riders.length > 0) {
              logUser(`Ride ${ride.rideID} edited by ${ride.leaderName} `);
              SendChangeNotificationEmails(ride,riders,response,false,next);
            } else {
              response.json('OK');
            }
          })
      }
      else {
        response.json('OK');
      }
    })
  }

  export function deleteRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const ride : Ride = request.body.data;
    const sql = `delete from rides where rideID = ?`;

    dbconnection.query(sql, [ride.rideID], function (error: any, results: string)
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Ride ${ride.rideID} deleted`);
      const selectSql = `SELECT rider FROM Participants where rideID = ?`;
      dbconnection.query(selectSql, [ride.rideID], function (error: any , result: any[])
      {
        if (error != null) {
          next(error);
          return;
        }

        let riders : string[] = [];
        if (result.length > 0) {
          for (let row = 0; row < result.length; row++) {
            let r = result[row];
            riders.push("'"+r.rider+"'")
          }
          SendChangeNotificationEmails(ride,riders,response,true,next);
        } else {
          response.json('OK');
        }
      })
    });
  }

  /**
   * Find number of rides a rider has done
   * @param request 
   * @param response 
   * @param next 
   */

export function ridecount(request: { body: { data: string; }; }, response: { json: (arg0: rideCount[]) => void; }, next: (arg0: { code: any; }) => void){
   
    const username : string = request.body.data;
    const sql = `SELECT rider, count(rider) as count FROM rides inner join Participants on Participants.rideID = rides.rideID  where rider = ? group by rider`;
    dbconnection.query(sql, [username], function (error: any, results: any[])
    {
      if (error != null) {
        next(error);
        return;
      }
      const counts = results.map((row: any) => new rideCount(row.rider, row.count));
      response.json(counts);
    });
    
   }
