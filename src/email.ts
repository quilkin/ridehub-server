import { Ride } from './common/ride.js'
import { User } from './common/user.js'
import { TimesDates } from './common/timesdates.js'
import { dbconnection}  from './dbconn.js'  ;
import  nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer/lib/smtp-transport/index.js';
import { logUser, logError } from './utils/logger.js';
import { Member } from './common/member.js';
import {Email } from './common/email.js';

var transporter: nodemailer.Transporter<SentMessageInfo>;

function createTransporter() {
    if (transporter) return; // already created
    if (!process.env.emailServer || !process.env.emailUserName || !process.env.emailPassword) {
        throw new Error('Missing email configuration: emailServer, emailUserName and emailPassword are required');
    }
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
 * create and send an email about a new ride to all users, unless they opted out
 */
export function SendNotificationEmails(ride: Ride, response: { json: any; }, next: (arg0: any) => void)  {

    createTransporter();
    
    let date: string = TimesDates.StrFromIntDays(ride.date);
    let body: string = `A new ride (or event) has been posted! :)\n\r    Date: ${date}.\n    Description: ${ride.description}\n\r`;
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
    let sql: string;
    if (process.env.debug)
        sql = "SELECT email FROM logins where notifications > 0 and role > 1";
    else
        sql = "SELECT email FROM logins where notifications > 0";
    dbconnection.query(sql, function (error: any, results: any[])
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

/***
 * create and send an email about a changed ride to all users, unless they opted out
 */
 export function SendChangeNotificationEmails(ride: Ride, riders: string[], response: { json: any; }, deleted: boolean, next: (arg0: any) => void)  {

    createTransporter();
    
    let date: string = TimesDates.StrFromIntDays(ride.date);
    let time: string = TimesDates.fromIntTime(ride.time);
    let body: string = `A ride that you have joined has been changed!\n\r   Date/Time: ${date} at ${time}.\n    Description: ${ride.description}\n\r`;
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

    }
    // get email list from DB
    if (!riders || riders.length === 0) {
        logError('SendChangeNotificationEmails called with no riders');
        response.json(ride.rideID.toString());
        return;
    }
    const riderNames = riders.map(r => r.replace(/'/g, ''));
    const placeholders = riderNames.map(() => '?').join(',');
    let sql: string;
    if (process.env.debug)
        sql = `SELECT email FROM logins where notifications > 0 and role > 1 and name in (${placeholders})`;
    else
        sql = `SELECT email FROM logins where notifications > 0 and name in (${placeholders})`;
    dbconnection.query(sql, riderNames, function (error: any, results: any[])
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

/**
 * Create an email to allow new user to register
  */
export function CreateRegistrationEmail(user: User, hash: string, next: (arg0: any) => void) : eMailMessage{

   createTransporter();
   
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

export function CreatePasswordResetEmail(username: string, email: string, hash: string, next: (arg0: any) => void) : eMailMessage {

    createTransporter();
    
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

 // functions required by membership app

 
/**
 * send group email (requested from client)
 */
export function sendGroupEmail(request: { body: { data: Email; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    let message : Email = request.body.data;

    let sql : string = '';


    if (message.to == 'all') {
        sql = "SELECT email FROM members";
    }
    else if (message.to == 'committee') {
        sql = "SELECT email FROM members where committee!=''";
    }
    else {
        sql = "SELECT email FROM members where email = ?";
    }
    
    var eMail = {
        from: "admin@truro.cc",
        to: "admin@truro.cc",
        subject: message.subject,
        text: message.body,
        bcc: [] as string[]
    
    }
    createTransporter();

    const queryParams = message.to && message.to !== 'all' && message.to !== 'committee' ? [message.to] : [];
    dbconnection.query(sql, queryParams, function (error: any, results: any[])
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
           logUser(`New group emails sent`);
           response.json(`OK`);
        }); 
    })

    
    
} 

// send out automated member lists every month
export function autoMembershipList() {

// find all committee members who should receive an automated list every month
  const sql = `SELECT * from members where committee like '%memberlist%'`;
  dbconnection.query(sql,function (error: { code: any; }, committeeMembers: Member[])
  {
    if (error != null) 
      logError(error.code);

    if (committeeMembers.length > 0) {
        let date: string = new Date().toDateString();
        let mailBody: string = `Automatic monthly TCC Membership list - ${date}.\n\r`;
        mailBody += `CSV file attached`;
        let sql: string = "SELECT * FROM members";
        createTransporter();
        dbconnection.query(sql,function (error: { code: any; }, results: Member[])
        {
            if (error != null) {
                //next(error);
                logError("sql error getting member list");
                return;
            }
            let csvContent = makeCSVfile(results);
            committeeMembers.forEach(function(member: Member) {
                var eMail = {
                    from: "admin@truro.cc",
                    to: member.email,
                    text: mailBody,
                    subject: "TCC Membership list",
                    attachments: [
                        { 
                            filename: `TCC members  ${date}.csv`,
                            content: csvContent
                        }
                    ]

                }
                transporter.sendMail(eMail, function(error: any, info: { response: string; }){
                    if (error != null) {
                        logError(`could not send member list email to ${member.fname} ${member.surname}`)
                        return;
                    }

                    logUser(`Full member list sent to ${member.fname} ${member.surname} `);
 
                }); 
                
            })
        })

    }
    else {
        logError("no committee members are set up to receive list");
    }
})
}

function makeCSVfile(members: Member[]) {
        let csvContent = "";

        members.forEach(function(member: Member) {
            const values=Object.values(member);
            
            for (let i = 0; i < values.length; i++) {
                const val = values[i];
                if (typeof val === 'string')
                { 
                    // don't want commas in csv file
                    if (val.includes(','))
                        values[i] = val.replace(/,/gi, " ");
                    if (val.includes('00:00:00'))
                        // date/time, not recognised
                        values[i] = 'unknown';
                }
                else if (typeof val === 'object'){
                    if (val != null) {
                        try {
                            const dateStr = val.getFullYear()  + "/" + ("0"+(val.getMonth()+1)).slice(-2) + "/" + ("0" + val.getDate()).slice(-2);
                            values[i] = dateStr;
                        }
                        catch {}
                    }
                }
            }
            let row = values.join(",");
            csvContent += row + "\r\n";
        });
        return csvContent;

}

export interface eMailMessage {
    "transport": any,
    "email" : any
}