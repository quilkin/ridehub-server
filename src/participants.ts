import { dbconnection } from './dbconn.js'  ;
import { Request } from "express"
import { Participant, rideCount } from './common/participant.js'
import {  logUser } from './utils/logger.js';

    //  get comma-separated list of participants for each displayed ride
    export function getParticipants(request: { body: { data: number[]; }; }, response: { json: (arg0: string[]) => void; }, next: (arg0: { code: any; }) => void) {
        const rideIDs : number[] = request.body.data;
        const participants = [] as string[];
        for (let ride = 0; ride < rideIDs.length; ride++) {
          participants[ride] = ',';
        }

        let query = `SELECT rideID, rider FROM Participants where rideID in (${rideIDs})`;
        dbconnection.query(query,function (error: { code: any; } , results: any[])
        {
          if (error != null) {
            next(error);
            return;
          }
          for (let row = 0; row < results.length; row++) {
            let pp = results[row];
            let index = rideIDs.indexOf(pp.rideID);
            participants[index] += pp.rider + ",";
          }
          response.json(participants);
        });
      }
   
      export function getParticipantsForRide(rideID: number , next: (arg0: { code: any; }) => void) : string[]{

        const participants = [] as string[];
 
        let query = `SELECT rider FROM Participants where rideID = ${rideID}`;
        dbconnection.query(query,function (error: { code: any; } , results: string[])
        {
          if (error != null) {
            next(error);
            return [];
          }
          return results;

        });
        return [];
      }
      
      export function saveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
	    let result: string = "";
        const pp : Participant = request.body.data;
        let query: string = `SELECT rider FROM Participants where rideID = '${pp.rideID}' and rider = '${pp.rider}'`;

        dbconnection.query(query,function (error: { code: any; } , results: any[])
        {
          if (error != null) {
            next(error);
            return;
          }
          if (results.length > 0) {
            response.json("You are aleady booked onto this ride. Please choose another ride");
          }
          else {
              query = `insert into Participants (rider, rideID) values ('${pp.rider}','${pp.rideID}')`;
              dbconnection.query(query,function (error: { code: any; } , results: any[])
              {
                if (error != null) 
                  next(error);
                else {
                  logUser(`Participant ${pp.rider} added to ride ${pp.rideID}`);
                  response.json("OK");
                }
              });
          }
      });

	}

      export function leaveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
        let result: string = "";
        const pp : Participant = request.body.data;
        let query: string = `SELECT rider FROM Participants where rideID = '${pp.rideID}' and rider = '${pp.rider}'`;

        dbconnection.query(query,function (error: { code: any; } , results: any[])
        {
          if (error != null) 
            next(error);
          else
            if (results.length === 0) {
              // trying to remove the riide leader?
              query = `SELECT leaderName from rides where rideID = '${pp.rideID}' and leaderName = '${pp.rider}'`;
              dbconnection.query(query,function (error: { code: any; } , results: any[])
              {
                if (error != null) 
                  next(error);
                else {
                  if (results.length === 1) {
                    // remove the ride leader
                    query = `update rides set leaderName = '(${pp.rider})' where rideID = '${pp.rideID}' and leadername = '${pp.rider}'`
                    dbconnection.query(query,function (error: { code: any; } , results: any[])
                    {
                      if (error != null) 
                        next(error);
                      else {
                        logUser(`Leader ${pp.rider} left ride ${pp.rideID}`);
                        response.json("OK");
                      }
                    });

                  }
                  if (results.length === 0) {
                    response.json("Error: You are not booked onto this ride.");
                  }
                }
              });
              
            }
          else {
              query = `delete from  Participants where  rider = '${pp.rider}' and rideID = '${pp.rideID}'`;
              dbconnection.query(query,function (error: { code: any; } , results: any[])
              {
                if (error != null) 
                  next(error);
                else {
                  logUser(`Participant ${pp.rider} left ride ${pp.rideID}`);
                  response.json("OK");
                }
              });
          }
        });
      }
 
      /**
       * Calculate which participants have done most rides recently
       * @param fromDate 
       * @param next 
       */

      export function touristTrophy(request: { body: { data: number[]; }; }, response: { json: (arg0: rideCount[]) => void; }, next: (arg0: { code: any; }) => void) {
        const fromDate : number = request.body.data[0];
        const toDate : number = request.body.data[1];
        const trophyTable = [] as rideCount[];

        let query = `SELECT rider,count(rider) as count from rides inner join Participants on Participants.rideID = rides.rideID`;
        query += ` where date > '${fromDate}' and date < '${toDate}' group by rider order by count(rider) desc`;
        dbconnection.query(query,function (error: { code: any; } , results: any)
        {
          if (error != null) {
            next(error);
            return;
          }
          for (let row = 0; row < results.length && row < 20; row++) {
                   
            let tt = results[row];
            let rider = tt.rider;
            let count = tt.count;
            trophyTable[row] = new rideCount(rider,count);
          }
          response.json(trophyTable);
        });
      }
      export function leaderTrophy(request: { body: { data: number[]; }; }, response: { json: (arg0: rideCount[]) => void; }, next: (arg0: { code: any; }) => void) {
        const fromDate : number = request.body.data[0];
        const toDate : number = request.body.data[1];
         const leaderTable = [] as rideCount[];

        let query = `SELECT leaderName,count(leaderName) as count from rides where date > '${fromDate}' and date < '${toDate}'`;
        query += ` group by leaderName order by count(leaderName) desc`;
        dbconnection.query(query,function (error: { code: any; } , results: any)
        {
          if (error != null) {
            next(error);
            return;
          }
          for (let row = 0; row < results.length && row < 20; row++) {
                   
            let tt = results[row];
            let rider = tt.leaderName;
            let count = tt.count;
            leaderTable[row] = new rideCount(rider,count);
          }
          response.json(leaderTable);
        });
      }
/*       SELECT leaderName,count(leaderName) as count from rides
where date > 20226-365 and date < 20226
group by leaderName
order by count(leaderName) desc */