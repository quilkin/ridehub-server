import { createPool, dbconnection } from './dbconn.js'  ;
import { User } from './common/user.js'
import { logUser } from './utils/logger.js';
import { getHash } from './utils/hash.js'
import { CreateRegistrationEmail, CreatePasswordResetEmail, eMailMessage} from './email.js'


  export function logIn(request: { body: { data: User; }; }, response: { json: (arg0: User) => void; }, next: (arg0: any) => void) {
    let user : User = request.body.data;
    const hash : string = getHash(user.pw);
    // can login with either username or email
    let query: string = `SELECT id, name, pw, email, role, units, climbs, notifications FROM logins where name = ? or email = ?`;

    dbconnection.query(query, [user.name, user.name], function (error: any,  results: User[])
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
    
  export function getLogins(request: any, response: { json: (arg0: User[]) => void; }, next: (arg0: any) => void) {
      let sql = "SELECT id, name, email, notifications FROM logins";
      dbconnection.query(sql, function (error: any, results: User[])
      {
        if (error != null) {
          next(error);
          return;
        }
        response.json(results);
      });
  }

  export function findUser(request: { body: { data: string; }; }, response: { json: (arg0: User) => void; }, next: (arg0: any) => void) {
    
    let userName : string = request.body.data;
    let sql = `select *  from logins where name = ?`;
    dbconnection.query(sql, [userName], function (error: any, results: User[])
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

  export function register(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

    let user : User = request.body.data;
    const hash : string = getHash(user.name + user.name);
    if (user.code === hash)
    {
      let sql = `update logins set role = 1 where name = ?`;
      dbconnection.query(sql, [user.name], function (error: any, results: User[])
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

  export function changeAccount(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

    const user : User = request.body.data;
    let updateCount = 0;
    let errorOccurred = false;

    const sendResponse = () => {
      updateCount++;
      if (updateCount === (user.pw ? 1 : 0) + (user.email ? 1 : 0) + 1 + (user.name ? 1 : 0)) {
        if (!errorOccurred) {
          logUser('User changed account: ' + user.id);
          if (user.email !== '')
            logUser(`User ${user.id} changed email to ${user.email}`);
          if (user.name !== '')
            logUser(`User ${user.id} changed username to ${user.name}`);
          if (user.pw !== '')
            logUser(`User ${user.id} changed password`);
          response.json("OK");
        }
      }
    };

    if (user.pw !== '') {
      const hash : string = getHash(user.pw);
      let sql = `update logins set pw = ? where id = ?`;
      dbconnection.query(sql, [hash, user.id], function (error: any, results: User[]) {
        if (error != null) { errorOccurred = true; next(error); return; }
        sendResponse();
      });
    }
    if (user.email !== '') {
      let sql = `update logins set email = ? where id = ?`;
      dbconnection.query(sql, [user.email, user.id], function (error: any, results: User[]) {
        if (error != null) { errorOccurred = true; next(error); return; }
        sendResponse();
      });
    }

    let sql = `update logins set units = ?, climbs = ?, notifications = ? where id = ?`;
    dbconnection.query(sql, [user.units, user.climbs, user.notifications, user.id], function (error: any, results: User[]) {
      if (error != null) { errorOccurred = true; next(error); return; }
      sendResponse();
    });

    if (user.name !== '') {
      let sql = `update logins set name = ? where id = ?`;
      dbconnection.query(sql, [user.name, user.id], function (error: any, results: User[]) {
        if (error != null) {
          errorOccurred = true;
          response.json("Sorry, this username has already been taken");
          return;
        }
        sendResponse();
      });
    } else {
      sendResponse();
    }

  }
  
  export function signUp(request: { body: { data: User; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

    const user : User = request.body.data;
    if (user.pw.length < 4 || user.pw.length > 10) {
      response.json("Password must be between 4 and 10 characters");
      return;
    }
    let pwHash : string = getHash(user.pw);
    let sql =  "SELECT Id, name, pw, email FROM logins";
    dbconnection.query(sql, function (error: any, users: User[])
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
      let userHash = getHash(user.name + user.name);

      const message = CreateRegistrationEmail(user,userHash,next);
      message.transport.sendMail(message.email, function(error: any, info: any){
        if (error != null) {
            console.log("registration email failed");
            next(error);
            return;
        }
        //console.log("email sent ok");
        const now = new Date();
        var pDateSeconds = now.valueOf()/1000;
        sql = `insert into logins (name, pw, email, role, messagetime, units, climbs, notifications) values (?, ?, ?, 0, FROM_UNIXTIME(?), 'k', 1, 1)`;
        dbconnection.query(sql, [user.name, pwHash, user.email, pDateSeconds], function (error: any, results: User[])
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

  export function forgotPW(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

    const email = request.body.data;
    
    let username = "";
    let sql = `SELECT Id, name, email FROM logins where email = ?`;
    dbconnection.query(sql, [email], function (error: any, users: User[])
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
      
      const code = getHash(username + username);
      const message =  CreatePasswordResetEmail(username,email,code,next);
      message.transport.sendMail(message.email, function(error: any, info: any){
        if (error != null) {
            console.log("password reset email failed");
            next(error);
            return;
        }
        // save the time this message was sent
        var pDateSeconds = now.valueOf()/1000;
        sql = `update logins set messagetime = FROM_UNIXTIME(?) where email = ?`;
        dbconnection.query(sql, [pDateSeconds, email], function (error: any, users: User[])
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

  export function checkMember(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

  const rider = request.body.data;
  // should return just one member
  const sql = `SELECT members.number, members.surname from members inner join logins on logins.email = members.email where logins.name = ?`;
  dbconnection.query(sql, [rider], function (error: any, results: any[])
  {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length > 0) {
        response.json("yes");
        return;
      }
      response.json("no");
  });
}

// helper class for below, as ridehub server doesn't have acces to 'member' class
class contact {
    phone : string = '';
    nextOfKin : string = '';
    nokPhone : string = '';

    constructor(rPhone: string,name: string,ephone: string) {
        this.nextOfKin = name;
        this.nokPhone = ephone;
        this.phone = rPhone;
    }
    
}

export function getEmergencyContact(request: { body: { data: string; }; }, response: { json: (arg0: string[]) => void; }, next: (arg0: any) => void) {
  const rider = request.body.data;
  
  const sql = `SELECT * from members inner join logins on logins.email = members.email where logins.name = ?`;
  let details = new contact('unknown', 'not yet defined', '0000 000000');
  dbconnection.query(sql, [rider], function (error: any, results: contact[])
  {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length > 0) {
        details = results[0];
        // response.json([noK.nextOfKin,noK.nokPhone]);
        // return;
      }
      const riderPhone = details.phone;
      const nok = details.nextOfKin;
      const nokPhone = details.nokPhone;
      response.json([riderPhone,nok,nokPhone]);
  });
}