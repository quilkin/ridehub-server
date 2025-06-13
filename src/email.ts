import { Ride } from './common/ride.js'
import { User } from './common/user.js'
import { TimesDates } from './common/timesdates.js'
import { dbconnection}  from './dbconn.js'  ;
import  nodemailer from 'nodemailer';
import { getHash } from './utils/hash.js'
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';
import { Options } from 'nodemailer/lib/mailer/index.js';
import { logUser } from './utils/logger.js';

var transporter: nodemailer.Transporter<SentMessageInfo>;

function createTransporter() {
    transporter = nodemailer.createTransport({
        host: process.env.emailServer,
        secure: true,
        auth: {
            user: process.env.emailUserName,
            pass: process.env.emailPassword
        }
    });
}

/***
 * create and send an email about the new ride to all users, unless they opted out
 */
export function SendNotificationEmails(ride: Ride, response: { json: any; }, next: (arg0: { code: any; }) => void)  {

    createTransporter();
    
    let date: string = TimesDates.StrFromIntDays(ride.date);
    let body: string = `A new ride (or event) has been posted! :)\n\r    Date: ${date}.\n    Decription: ${ride.description}\n\r`;
    body += "Please visit https://ridehub.truro.cc for details\n\r\n\r";
    body += "============================================================================================\n\r";
    body += "If you no longer wish to receive these emails, you can edit your preferences in the RideHub 'Account' page\n\r";
    body += "If you are are unable to do this, please reply to this email with 'unsubscribe' in the message\n\r";
    body += "If you wish to close your account, please reply to this email with 'close account' in the message\n\r";
    
    var eMail = {
    from: "rides@truro.cc",
    to: "rides@truro.cc",
    subject: "TCC Ride Hub",
    text: body,
    bcc: [] as string[]
    // bcc: results
    }
    // get email list from DB
    // todo: ***** send to all roles after testing ****************
    //let sql: string = "SELECT email FROM logins where notifications > 0 and role > 1";
    let sql: string = "SELECT email FROM logins where notifications > 0";
    dbconnection.query(sql,function (error: { code: any; }, results: any[])
    {
        if (error != null) {
            next(error);
            return;
        }
        eMail.bcc = [];
        for (let row = 0; row < results.length; row++) {
            let e = results[row];
            eMail.bcc.push(e.email)
          }
    
        transporter.sendMail(eMail, function(error: any, info: { response: string; }){
            if (error != null) {
                next(error);
                return;
              }
          const rideID = ride.rideID;
          logUser(`New ride emails sent for ride ${rideID}`);
           response.json(rideID.toString());
        }); 
    })
 }


 export function SendChangeNotificationEmails(ride: Ride, riders: string[], response: { json: any; }, deleted: boolean, next: (arg0: { code: any; }) => void)  {

    createTransporter();
    
    let date: string = TimesDates.StrFromIntDays(ride.date);
    let time: string = TimesDates.fromIntTime(ride.time);
    let body: string = `A ride that you have joined has been changed!\n\r   Date/Time: ${date} at ${time}.\n    Decription: ${ride.description}\n\r`;
    if (deleted)
     body += 'it has been cancelled, sorry';
    else
     body += "Please visit https://ridehub.truro.cc for details\n\r\n\r";
    
    var eMail = {
    from: "rides@truro.cc",
    to: "rides@truro.cc",
    subject: deleted? "TCC Ride : your ride has been cancelled" : "TCC Ride : your ride has changed",
    text: body,
    bcc: [] as string[]
    // bcc: results
    }
    // get email list from DB
    // todo: ***** send to all roles after testing ****************
    let sql: string = `SELECT email FROM logins where notifications > 0  and name in (${riders})`;
    dbconnection.query(sql,function (error: { code: any; }, results: any[])
    {
        if (error != null) {
            next(error);
            return;
        }
        eMail.bcc = [];
        for (let row = 0; row < results.length; row++) {
            let e = results[row];
            eMail.bcc.push(e.email)
          }
           
        transporter.sendMail(eMail, function(error: any, info: { response: string; }){
            if (error != null) {
                next(error);
                return;
              }
          const rideID = ride.rideID;
          logUser(`Change emails sent for ride ${rideID}`);
          response.json(rideID.toString());
        }); 
    })
 }


export interface eMailMessage {
    "transport": any,
    "email" : any
}
export function CreateRegistationEmail(user: User, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage{

   createTransporter();
   
   //user.code = await getHash(user.name + user.name);
   user.code = hash;
   const urlStr = `${process.env.serviceURL}?user=${user.name}&regcode=${user.code}`;
   const body = `Please click ${urlStr}  to complete your registration\n\r\n\rFor security, this link will expire in 15 minutes!`;
   
   var eMail = {
    from: "rides@truro.cc",
    to: user.email,
    subject: "TCC rides signup",
    text: body
   }
   let message : eMailMessage = {"transport": transporter,"email" : eMail}
   return message;
}

export function CreatePasswordResetEmail(username: string, email: string, hash: string, next: (arg0: { code: any; }) => void) : eMailMessage {

    createTransporter();
    
    //const code = await getHash(username + username);
    const urlStr = `${process.env.serviceURL}?pwuser=${username}&regcode=${hash}`;
    const body = `Please click ${urlStr} to reset your password or other details\n\r\n\rFor security, this link will expire in 15 minutes!`;
    
    var eMail = {
     from: "rides@truro.cc",
     to: email,
     subject: "TCC RideHub forgotten password",
     text: body
    }
 
    let message : eMailMessage = {"transport": transporter,"email" : eMail}
    return message;
 }