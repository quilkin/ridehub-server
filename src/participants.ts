var dbconnection = require('./dbconn');
import { Request } from "express"
import { Participant } from '../../ridehub-common'


    //  get comma-separated list of participants for each displayed ride
    export function getParticipants(request: { body: { data: number[]; }; }, response: { json: (arg0: string[]) => void; }, next) {
        const rideIDs : number[] = request.body.data;
        const participants = [] as string[];
        
        for (let index = 0; index < rideIDs.length; index++) {
            let pp = ",";
            let query = `SELECT rider FROM Participants where rideID = '${rideIDs[index]}' `;
          dbconnection.query(query,function (error: { code: any; } , results: any[])
          {
            if (error != null) {
              next(error);
              return;
            }
            for (let row = 0; row < results.length; row++) {
                    pp = pp + results[row].rider + ",";
            }
    
            participants[index] = pp;
            if (index >= rideIDs.length-1) 
            {
              // got them all now
              response.json(participants);
              return;
            }
          });
        }
      }
      export function saveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }, next) {
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
              query = `insert into Participant (rider, rideID) values ('${pp.rider}','${pp.rideID}')`;
              dbconnection.query(query,function (error: { code: any; } , results: any[])
              {
                if (error != null) 
                  next(error);
                else
                  // todo: change this string to 'OK' ?
                  response.json("*");
              });
          }
      });

	}

      export function leaveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }, next) {
        let result: string = "";
        const pp : Participant = request.body.data;
        let query: string = `SELECT rider FROM Participants where rideID = '${pp.rideID}' and rider = '${pp.rider}'`;

        dbconnection.query(query,function (error: { code: any; } , results: any[])
        {
          if (error != null) 
            next(error);
          else
            if (results.length === 0) {
              response.json("Error: You are not booked onto this ride.");
            }
          else {
              query = `delete from  Participants where  rider = '${pp.rider}' and rideID = '${pp.rideID}'`;
              dbconnection.query(query,function (error: { code: any; } , results: any[])
              {
                if (error != null) 
                  next(error);
                else
                  response.json("OK");
              });
          }
        });

    }