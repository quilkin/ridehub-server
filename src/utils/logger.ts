var fs = require('fs');
var util = require('util');
var log_file: { write: (arg0: string) => void; };
var user_file: { write: (arg0: string) => void; };

export function createLogFiles(path : string) {
  log_file = fs.createWriteStream(path +'/logs/error.log', {flags : 'a'});
  user_file = fs.createWriteStream(path + '/logs/users.log', {flags : 'a'});
}

export function logError(mess : string) { 
  try {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    const message = util.format('%s %s: %s',date,time,mess)+ '\n'; 
    log_file.write(message);
  }
  catch (e){
  }
};
export function logUser(mess: string) { //
  try {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    const message = util.format('%s %s: %s',date,time,mess)+ '\n'; 
    //const message = `${Date.now.toString()}: d\n`;
    user_file.write(message);
  }
  catch(e) {
    
  }
};