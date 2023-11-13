var dbconnection = require('./dbconn');

import { User } from '../../ridehub-common'
import {  logUser } from '@/utils/logger';

async function getHash(text : string)  {
    if (text === null || text === undefined || text === "") {
	    return "";
	  }
    // see https://stackoverflow.com/questions/18338890
    const msgBuffer = new TextEncoder().encode(text);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.toUpperCase();
  }

  export async function logIn(request: { body: { data: User; }; }, response: { json: (arg0: User) => void; }, next) {
    let user : User = request.body.data;
    const hash : string = await getHash(user.pw);
    // can login with either username or email
    let query: string = `SELECT id, name, pw, email, role, units, climbs, notifications FROM logins where name = '${user.name}' or email = '${user.name}'`;

    dbconnection.query(query,function (error: { code: any; },  results: User[])
    {
      if (error != null) {
        next(error);
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