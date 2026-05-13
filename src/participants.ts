import { dbconnection } from './dbconn.js';
import { Request, Response, NextFunction } from 'express';
import { Participant, rideCount } from './common/participant.js';
import { logUser } from './utils/logger.js';

    //  get comma-separated list of participants for each displayed ride
    export function getParticipants(request: Request, response: Response, next: NextFunction) {
        const rideIDs : number[] = request.body.data;
        const participantMap = new Map<number, string[]>();
        
        // Initialize map for each ride
        rideIDs.forEach(id => participantMap.set(id, []));

        const placeholders = rideIDs.map(() => '?').join(',');
        const query = `SELECT rideID, rider FROM Participants WHERE rideID IN (${placeholders})`;
        
        dbconnection.query(query, rideIDs, (error, results: any[]) => {
          if (error != null) {
            next(error);
            return;
          }
          results.forEach(row => {
            const riders = participantMap.get(row.rideID);
            if (riders) riders.push(row.rider);
          });
          
          const participants = rideIDs.map(id => participantMap.get(id)?.join(',') ?? '');
          response.json({ success: true, data: participants });
        });
      }
   
      export function getParticipantsForRide(rideID: number, next: NextFunction) : Promise<string[]> {
        return new Promise((resolve, reject) => {
          const query = `SELECT rider FROM Participants WHERE rideID = ?`;
          dbconnection.query(query, [rideID], (error, results: any[]) => {
            if (error != null) {
              next(error);
              reject(error);
              return;
            }
            const riders = results.map(row => row.rider);
            resolve(riders);
          });
        });
      }
      
      export function saveParticipant(request: Request, response: Response, next: NextFunction) {
        const pp : Participant = request.body.data;
        const checkQuery: string = `SELECT rider FROM Participants WHERE rideID = ? AND rider = ?`;

        dbconnection.query(checkQuery, [pp.rideID, pp.rider], (error, results: any[]) => {
          if (error != null) {
            next(error);
            return;
          }
          if (results.length > 0) {
            response.json({ success: false, message: "You are already booked onto this ride. Please choose another ride" });
          } else {
            const insertQuery = `INSERT INTO Participants (rider, rideID) VALUES (?, ?)`;
            dbconnection.query(insertQuery, [pp.rider, pp.rideID], (error) => {
              if (error != null) {
                next(error);
              } else {
                logUser(`Participant ${pp.rider} added to ride ${pp.rideID}`);
                response.json({ success: true, message: "Participant added successfully" });
              }
            });
          }
        });
      }

      export function leaveParticipant(request: Request, response: Response, next: NextFunction) {
        const pp : Participant = request.body.data;
        const checkParticipantQuery = `SELECT rider FROM Participants WHERE rideID = ? AND rider = ?`;

        dbconnection.query(checkParticipantQuery, [pp.rideID, pp.rider], (error, results: any[]) => {
          if (error != null) {
            next(error);
            return;
          }
          
          if (results.length === 0) {
            // trying to remove the ride leader?
            const checkLeaderQuery = `SELECT leaderName FROM rides WHERE rideID = ? AND leaderName = ?`;
            dbconnection.query(checkLeaderQuery, [pp.rideID, pp.rider], (error, results: any[]) => {
              if (error != null) {
                next(error);
                return;
              }
              
              if (results.length === 1) {
                // remove the ride leader
                const updateLeaderQuery = `UPDATE rides SET leaderName = ? WHERE rideID = ? AND leaderName = ?`;
                dbconnection.query(updateLeaderQuery, [`(${pp.rider})`, pp.rideID, pp.rider], (error) => {
                  if (error != null) {
                    next(error);
                  } else {
                    logUser(`Leader ${pp.rider} left ride ${pp.rideID}`);
                    response.json({ success: true, message: "Leader removed successfully" });
                  }
                });
              } else {
                response.json({ success: false, message: "You are not booked onto this ride." });
              }
            });
          } else {
            const deleteQuery = `DELETE FROM Participants WHERE rider = ? AND rideID = ?`;
            dbconnection.query(deleteQuery, [pp.rider, pp.rideID], (error) => {
              if (error != null) {
                next(error);
              } else {
                logUser(`Participant ${pp.rider} left ride ${pp.rideID}`);
                response.json({ success: true, message: "Participant removed successfully" });
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

      export function touristTrophy(request: Request, response: Response, next: NextFunction) {
        const fromDate : number = request.body.data[0];
        const toDate : number = request.body.data[1];

        const query = `SELECT rider, COUNT(rider) as count FROM rides INNER JOIN Participants ON Participants.rideID = rides.rideID WHERE date > ? AND date < ? GROUP BY rider ORDER BY COUNT(rider) DESC LIMIT 20`;
        
        dbconnection.query(query, [fromDate, toDate], (error, results: any[]) => {
          if (error != null) {
            next(error);
            return;
          }
          
          const trophyTable = results.map(row => new rideCount(row.rider, row.count));
          response.json({ success: true, data: trophyTable });
        });
      }
      export function leaderTrophy(request: Request, response: Response, next: NextFunction) {
        const fromDate : number = request.body.data[0];
        const toDate : number = request.body.data[1];

        const query = `SELECT leaderName, COUNT(leaderName) as count FROM rides WHERE date > ? AND date < ? GROUP BY leaderName ORDER BY COUNT(leaderName) DESC LIMIT 20`;
        
        dbconnection.query(query, [fromDate, toDate], (error, results: any[]) => {
          if (error != null) {
            next(error);
            return;
          }
          
          const leaderTable = results.map(row => new rideCount(row.leaderName, row.count));
          response.json({ success: true, data: leaderTable });
        });
      }
