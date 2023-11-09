var dbconnection = require('./dbconn');

import { apiMethods, Ride, User } from '../../ridehub-common'

function GetRidOfApostrophes(data : string): string
{
    return data.replace("'", "''");
}

export function getRidesForDate(request: { body: { data: number; }; }, response: { json: (arg0: Ride[]) => void; }) {
    const date = request.body.data;
    const sql = `SELECT * FROM rides where date > ${date-1} and date <= ${date+60} order by date asc`;

    dbconnection.query(sql,function (error: { code: any; }, results: Ride[])
    {
      if (error != null) {
        throw error;
      }
      response.json(results);
    });
  }
 
  export function saveRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }) {
    const ride = request.body.data;
    ride.meetingAt = GetRidOfApostrophes(ride.meetingAt);
    ride.description = GetRidOfApostrophes(ride.description);

    // check for existing rides
    let sql = `SELECT dest FROM rides where date= '${ride.date}' and leaderName = '${ride.leaderName}'`
    dbconnection.query(sql,function (error: { code: any; }, results: string[])
    {
      if (error != null) {  throw error;   }
      if (results.length > 0) {
        response.json("There is already a ride with you as leader on the same date. Please choose another date.");
        return;
      }
      sql = `insert into rides (routeID,leaderName,date,time,meetingAt,description,groupSize,minSpeed,maxSpeed)`;
      sql += ` values ('${ride.routeID}','${ride.leaderName}','${ride.date}','${ride.time}','${ride.meetingAt}',`;
      sql += `'${ride.description}','${ride.groupSize}','${ride.minSpeed}','${ride.maxSpeed}')`;
      // get new ride ID
      sql += "; SELECT CAST(LAST_INSERT_ID() AS int)";
      dbconnection.query(sql,function (error: { code: any; }, results: number)
      {
        if (error != null) {  throw error;   }

        response.json(results.toString());
        if (ride.leaderName.toLowerCase().startsWith("tester") === false)
           SendNotificationEmails(ride);
        return;
      })
    });

  }
  export function editRide(request: { body: { data: Ride; }; }, response: { json: (arg0: string) => void; }) {

  }
  export function deleteRide(request: { body: { data: number; }; }, response: { json: (arg0: string) => void; }) {
    const rideID = request.body.data;
    const sql = `delete from rides where rideID = ${rideID}`;

    dbconnection.query(sql,function (error: { code: any; }, results: string)
    {
      if (error != null) {
        throw error;
      }
      response.json(results);
    });
  }

  function SendNotificationEmails(ride: Ride) {

    return;

    // todo.....
    // create and send an email about the new ride to all users, unless they opted out
// 	try {
//     let URLstr: string = Connections.serviceURL;
 
//     let ec: EmailConnection = new EmailConnection();
//     let from: MailAddress = new MailAddress("rides@truro.cc");
//     let to: MailAddress = new MailAddress("rides@truro.cc");
 
//     let time: string = Logdata.JSDateToDateTime(ride.Date).ToLongDateString();
//     let body: string = "A new ride has been posted! :)\n\r    Date/Time: {0}.\n    Decription: {1}\n\rPlease visit https://ridehub.truro.cc for details\n\r\n\r";
//     body += "============================================================================================\n\r";
//     body += "If you no longer wish to receive these emails, you can edit your preferences in the RideHub 'Account' page\n\r";
//     body += "If you are are unable to do this, please reply to this email with 'unsubscribe' in the message\n\r";
//     body += "If you wish to close your account, please reply to this email with 'close account' in the message\n\r";
 
//     let message: MailMessage = new MailMessage(from, to);
//     message.Subject = "TCC Ride Hub";
//     message.Body = string.Format(body, time, ride.Descrip);
 
//     // get email list from DB
//     let query: string = "SELECT email FROM logins where notifications > 0 ";
//     using (let routeAdapter: MySqlDataAdapter = new MySqlDataAdapter(query, gpxConnection.Connection)) {
//         let dataRoutes: DataTable = new DataTable();
//         routeAdapter.Fill(dataRoutes);
 
//         let length: number = dataRoutes.Rows.Count;
//         for (let row: number = 0; row < length; row++) {
//             let email: string = "";
//             let dr: DataRow = dataRoutes.Rows[row];
//             try {
//                 email = dr["email"] as string;
//                 message.Bcc.Add(email);
//             } catch (ex) {
//                 Trace.WriteLine(ex.Message);
//                 log.Error = ex.Message;
//             }
//         }
//     }
 
//     try {
//         let client: SmtpClient = new System.Net.Mail.SmtpClient(ec.Server);
//         client.Credentials = new System.Net.NetworkCredential(ec.User, ec.PW);
//         client.Send(message);
//     } catch (ex) {
//         result = "Sorry, there is an error with the email service: " + ex.Message;
//     }
// } catch (ex2) {
//     result = "Error: " + ex2.Message;
//     log.Error = ex2.Message;
// } finally {
//     log.Result = result;
//     log.Save(gpxConnection);
//     gpxConnection.Close();
// }

  }