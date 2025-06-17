import { createPool, dbconnection } from './dbconn.js'  ;
import { User } from './common/user.js'
import { logUser } from './utils/logger.js';
import { getHash } from './utils/hash.js'
import { CreateRegistationEmail, CreatePasswordResetEmail, eMailMessage} from './email.js'


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
      if (results.length === 0) {
        logUser('** User login: unknown user: ' + user.name + ' email: ' + user.email);
        response.json(user);
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
      logUser('User login: ' + user.id + ' name ' + user.name + ' email: ' + user.email);
      
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

  export function findUser(request: { body: { data: string; }; }, response: { json: (arg0: User) => void; }, next: (arg0: Error) => void) {
    
    let userName : string = request.body.data;
    let sql = `select *  from logins where name = '${userName}'`;
    dbconnection.query(sql,function (error: Error | null, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else {
          if (results.length != 1) {
           error = new Error(`DB Error: ${results.length} users found `);
           next(error);
          }
          else {
            const msgTime = results[0].messagetime;
            const diffMs = new Date().getTime() - msgTime.getTime();
            if (diffMs > 15 * 1000 * 60) {
              // 15 minutes
              error = new Error(`Sorry, email code has timed out. Please request your details again.`);
              next(error);
            }
            else
              response.json(results[0]);
          }
        }
      });

  }

  export async function register(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    let user : User = request.body.data;
    const hash : string = await getHash(user.name + user.name);
    if (user.code === hash)
    {
      let sql = `update logins set role = 1 where name = '${user.name}'`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) {
          next(error);
        }
        else {
          logUser('User register: name ' + user.name + ' email: ' + user.email);
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
      let sql = `update logins set pw = '${hash}' where id = ${user.id}`;
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
       
    let sql = `update logins set units = '${user.units}', climbs=${user.climbs}, notifications=${user.notifications} where id = ${user.id}`;
    dbconnection.query(sql,function (error: { code: any; }, results: User[])
    {
      if (error != null) {    next(error); return;   }
    });
    if (user.name !== '') // name has actually been changed 
    {
      let sql = `update logins set name= '${user.name}' where id = ${user.id}`;
      dbconnection.query(sql,function (error: { code: any; }, results: User[])
      {
        if (error != null) { 
          response.json("Sorry, this username has already been taken");
            // next(error); 
             return;  }
      });
    };
    logUser('User changed account: ' + user.id );
    if (user.email !== '') 
      logUser(`User ${user.id} changed email to ${user.email} `) ;
    if (user.name !== '') 
      logUser(`User ${user.id} changed username to ${user.name} `) ;
    if (user.pw !== '') 
      logUser(`User ${user.id} changed password `) ;
    response.json("OK");

  }
  
  export async function signUp(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    const user : User = request.body.data;
    if (user.pw.length < 4 || user.pw.length > 10) {
      response.json("Password must be between 4 and 10 characters");
      return;
    }
    let pwHash : string = await getHash(user.pw);
    let sql =  "SELECT Id, name, pw, email FROM logins";
    dbconnection.query(sql,async function (error: { code: any; }, users: User[])
    {
      if (error != null) {    next(error);  return;   }
      //users.forEach ((existingUuser) => {
      for (const existingUser of users) {
        const name = existingUser.name.trim();
        const email = existingUser.email.trim();
        if (name.toLowerCase() === user.name.toLowerCase()) {
          response.json("Sorry, this username has already been taken");
          return;
        }
        if (email === user.email ) {
          response.json("Sorry, only one login allowed per email address");
          return;
        }
      };
      let userHash = await getHash(user.name + user.name);

      const message = CreateRegistationEmail(user,userHash,next);
      message.transport.sendMail(message.email, function(error: any, info: any){
        if (error != null) {
            console.log("registration email failed");
            next(error);
            return;
        }
        //console.log("email sent ok");
        const now = new Date();
        
        var pDateSeconds = now.valueOf()/1000;
        sql =  `insert into logins (name, pw, email,role,messagetime,units,climbs,notifications) values`;
        sql += ` ('${user.name}','${pwHash}','${user.email}',0,FROM_UNIXTIME('${pDateSeconds}'),'k',1,1)`;
        dbconnection.query(sql,function (error: { code: any; }, results: User[])
        {
          if (error != null)
          {    
            next(error);    
            return;
          }
          let reply = "Thank you, please wait for an email and click link to complete registration."
          reply +=  "Please check that rides@truro.cc is in your contact list and not treated as junk mail"
          logUser('User signup: ' + ' name ' + user.name + ' email: ' + user.email);
          response.json(reply);
        }); // query 2
      }); // sendmail
    }); // query 1
  }

  export async function forgotPW(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

    const email = request.body.data;
    
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
      const now = new Date();
      
      const code = await getHash(username + username);
      const message =  CreatePasswordResetEmail(username,email,code,next);
      message.transport.sendMail(message.email, function(error: any, info: any){
        if (error != null) {
            console.log("password reset email failed");
            next(error);
            return;
        }
        // save the time this message was sent
        var pDateSeconds = now.valueOf()/1000;
        sql = `update logins set messagetime = FROM_UNIXTIME('${pDateSeconds}') where email = '${email}'`
        dbconnection.query(sql,async function (error: { code: any; }, users: User[])
        {
          if (error != null)
          {    
            next(error);    
            return;
          }
          let reply = "OK, now please wait for an email and click the link to set a new password.";
          reply += "Please check that rides@truro.cc is in your contact list and not treated as junk mail";
          logUser('User password request: ' + ' name ' + username + ' email: ' + email);
          response.json(reply);
        }); // query 2
      }); // send mail
    }); // query 1
  }