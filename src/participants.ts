var dbconnection = require('./dbconn');
import { Request } from "express"
import { Participant } from '../../ridehub-common'


    //  get comma-separated list of participants for each displayed ride
    export function getParticipants(request: { body: { data: number[]; }; }, response: { json: (arg0: string[]) => void; }) {
        const rideIDs : number[] = request.body.data;
        const participants = [] as string[];
        
        for (let index = 0; index < rideIDs.length; index++) {
            let pp = ",";
            let query = `SELECT rider FROM Participants where rideID = '${rideIDs[index]}' `;
          dbconnection.query(query,function (error: { code: any; } , results: any[])
          {
            if (error != null) {
              throw error;
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
      export function saveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }) {
	    let result: string = "";
        const pp : Participant = request.body.data;
        let query: string = `SELECT rider FROM Participants where rideID = '${pp.rideID}' and rider = '${pp.rider}'`;

        try {
            dbconnection.query(query,function (error: { code: any; } , results: any[])
            {
                if (error != null) {   throw error;   }
                if (results.length > 0) {
                  response.json("You are aleady booked onto this ride. Please choose another ride");
                }
                else {
                    query = `insert into Participants (rider, rideID) values ('${pp.rider}','${pp.rideID}')`;
                    dbconnection.query(query,function (error: { code: any; } , results: any[])
                    {
                        if (error != null) {    throw error;   }
                        // todo: change this string to 'OK' ?
                        response.json("*");
                        return;
                    });
               }
	        });
        }
        catch (e ) {
            const err = e as Error;
            response.json(err.message);
            return;
            //log.Error = ex.Message;
          }
        finally {
	            // log.Result = result;
	            // log.Save(gpxConnection);
	            // gpxConnection.Close();
	        }
	}

      export function leaveParticipant(request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }) {
        let result: string = "";
        const pp : Participant = request.body.data;
        let query: string = `SELECT rider FROM Participants where rideID = '${pp.rideID}' and rider = '${pp.rider}'`;

        try {
            dbconnection.query(query,function (error: { code: any; } , results: any[])
            {
                if (error != null) {   throw error;   }
                if (results.length === 0) {
                  response.json("Error: You are not booked onto this ride.");
                }
                else {
                    query = `delete from  Participants where  rider = '${pp.rider}' and rideID = '${pp.rideID}'`;
                    dbconnection.query(query,function (error: { code: any; } , results: any[])
                    {
                        if (error != null) {    throw error;   }
                        response.json("OK");
                    });
               }
           });
        }
        catch (e ) {
            const err = e as Error;
            //console.log(err.message);
            response.json(err.message);
            return;
            //log.Error = ex.Message;
          }
        finally {
	            // log.Result = result;
	            // log.Save(gpxConnection);
	            // gpxConnection.Close();
	        }
    }