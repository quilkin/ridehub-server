import { Ride, TimesDates } from '../../ridehub-common'
var dbconnection = require('./dbconn');

export function SendNotificationEmails(ride: Ride, next) {


    var nodemailer = require('nodemailer');
    require('dotenv').config();

    // todo.....
    // create and send an email about the new ride to all users, unless they opted out

    var transporter = nodemailer.createTransport({
        host: process.env.emailServer,
        secure: true,
        auth: {
        user: process.env.emailUserName,
        pass: process.env.emailPassword
        }
    });
    
    //let time: string = Logdata.JSDateToDateTime(ride.Date).ToLongDateString();
    let time: string = TimesDates.StrFromIntDays(ride.date);
    let body: string = `A new ride has been posted! :)\n\r    Date/Time: ${time}.\n    Decription: ${ride.description}\n\r`;
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
    let sql: string = "SELECT email FROM logins where notifications > 0 and role > 1";
    dbconnection.query(sql,function (error: { code: any; }, results: string[])
    {
        if (error != null) {
        next(error);
        return;
        }
        eMail.bcc = results;

    // transporter.sendMail(eMail, function(error: any, info: { response: string; }){
    // if (error != null) {
    //     next(error);
    //     return;
    // }
    // else {
    //     console.log('Email sent: ' + info.response);
    //     }
    // }); 
    })
    transporter.sendMail(eMail, function(error: any, info: { response: string; }){
        if (error != null) {
            next(error);
            return;
        }
        else {
         //   console.log('Email sent: ' + info.response);
            }
    }); 
 }