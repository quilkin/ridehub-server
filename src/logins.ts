import { createPool, dbconnection } from './dbconn.js'  ;
//import crypto from 'crypto';

import { User } from './common/user.js'
import { logUser } from './utils/logger.js';
import { getHash } from './utils/hash.js'
import { SendRegistationEmail, SendPasswordResetEmail} from './email.js'



//let dbconnection = createPool();
// async function getHash(text : string)  {
//     if (text === null || text === undefined || text === "") {
// 	    return "";
// 	  }
//     // see https://stackoverflow.com/questions/18338890
//     const msgBuffer = new TextEncoder().encode(text);                    
//     const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
//     //const hashBuffer = await crypto.createHmac('sha256', '').update(msgBuffer).digest('hex');
//     // convert ArrayBuffer to Array
//     const hashArray = Array.from(new Uint8Array(hashBuffer));
//     // convert bytes to hex string                  
//     const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//     return hashHex.toUpperCase();
//   }

  export async function logIn(request: { body: { data: User; }; }, response: { json: (arg0: User) => void; }, next: (arg0: { code: any; }) => void) {
    let user : User = request.body.data;
    const hash : string = await getHash(user.pw);
    // can login with either username or email
    let query: string = `SELECT id, name, pw, email, role, units, climbs, notifications FROM logins where name = '${user.name}' or email = '${user.name}'`;

    dbconnection.query(query,function (error: { code: any; },  results: User[])
    {
      if (error != null) {
        next(error);
        return;
      }
      const checkedUser = results[0];
        // can login with either username or email
      if (checkedUser.name === user.name || checkedUser.email === user.name) {
        if (checkedUser.pw === hash) {
        
          user = checkedUser;
          // don't want to return the password
          user.pw = '';
        }
      }
      logUser('User login: ' + user.id + 'name ' + user.name + ' email: ' + user.email);
      
      response.json(user);
    });
  }
    
  export function getLogins(request: any, response: { json: (arg0: User[]) => void; }, next: (arg0: { code: any; }) => void) {
      let sql = "SELECT id, name, email, notifications FROM logins";
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else
            response.json(results);
      });
  }

  export function findUser(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    
    let userName : string = request.body.data;
    let sql = `select id, messagetime  from logins where name = ${userName}`;
    dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else {
          if (results.length != 1)
            response.json(`DB Error: ${results.length} users found `);

          else {
            const msgTime = results[0].messageTime;
            const diffMs = new Date().getTime() - msgTime.getTime();
            if (diffMs > 15 * 1000 * 60) {
              // 15 minutes
              response.json(`Sorry, email code has timed out. Please request your details again.`);
            }
            else
              response.json(`OK${results[0].id}`);
          }
        }
      });

  }

  export async function register(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    let user : User = request.body.data;
    const hash : string = await getHash(user.name + user.name);
    if (user.code === hash)
    {
      let sql = `update logins set role = 1 where name = '${User.name}'`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else {
          logUser('User register: ' + user.id + 'name ' + user.name + ' email: ' + user.email);
          response.json("Thank you, you have now registered");
        }

      });

    }

  }

  export async function changeAccount(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    const user : User = request.body.data;
    if (user.pw !== '') // password has actually been changed 
    {
      const hash : string = await getHash(user.pw);
      let sql = `update logins set pw = '${user.pw}' where id = ${user.id}`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {    next(error);  return;   }
      });
    }
    if (user.email !== '') // email has actually been changed 
    {
      let sql = `update logins set email = '${user.email}' where id = ${user.id}`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {    next(error); return; }
      });
    }
    if (user.name !== '') // name has actually been changed 
    {
      let sql = `update logins set name= '${user.name}' where id = ${user.id}`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {    next(error);  return;  }
      });
    }
    let sql = `update logins set units = '${user.units}', climbs=${user.climbs}, notifications=${user.notifications} where id = ${user.id}`;
    dbconnection.query(sql,function (error: { code: any; }, results: User[])
    {
      if (error != null) {    next(error); return;   }
    });
    logUser('User changed account: ' + user.id + 'name ' + user.name );
    response.json("OK");
  }
  
  export async function signUp(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    const user : User = request.body.data;
    if (user.pw.length < 4 || user.pw.length > 10) {
      response.json("Password must be between 4 and 10 characters");
      return;
    }
    const hash : string = await getHash(user.pw);
    let sql =  "SELECT Id, name, pw, email FROM logins";
    dbconnection.query(sql,function (error: { code: any; }, users: User[])
    {
      if (error != null) {    next(error);  return;   }
      users.forEach ((existingUuser) => {
        const name = existingUuser.name.trim();
        const email = existingUuser.email.trim();
        if (name.toLowerCase() === user.name.toLowerCase()) {
          response.json("Sorry, this username has already been taken");
          return;
        }
        if (email === user.email ) {
          response.json("Sorry, only one login allowed per email address");
          return;
        }
      });
    });
    await SendRegistationEmail(user,next);

    sql =  `insert into logins (name, pw, email,role,messagetime,units,climbs,notifications) values`;
    sql += ` ('${user.name}','${user.pw}','${user.email}',${user.role},'${user.messageTime}','${user.units}',${user.climbs},${user.notifications})`;
    dbconnection.query(sql,function (error: { code: any; }, results: User[])
    {
      if (error != null)
       {    
        next(error);    
        return;
      }
      let reply = "Thank you, please wait for an email and click link to complete registration."
      reply +=  "Please check that rides@truro.cc is in your contact list and not treated as junk mail"
      response.json(reply);
    });

  }

  export async function forgotPW(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    const email = request.body.data;
    let reply = "OK, now please wait for an email and click the link to set a new password.\n\r";
        reply += "-------------------------------------------------------------------------\n\r";
        reply += "Please check that rides@truro.cc is in your contact list and not treated as junk mail";
    let username = "";
    let sql = `SELECT Id, name, email FROM logins where email = '${email}'`
    dbconnection.query(sql,async function (error: { code: any; }, users: User[])
    {
      if (error != null)
      {    
        next(error);    
        return;
      }
      if (users.length == 0) {
        response.json("Error: cannot find an account with that email");
        return;
      }
      if (users.length > 1) {
        response.json(`Error: ${users.length} users found with that email`);
        return;
      }
      username = users[0].name.trim();
      await SendPasswordResetEmail(username,email,next);
       // save the time this message was sent
      sql = `update logins set messagetime = '${0}' where email = '${email}'`

    });

  }