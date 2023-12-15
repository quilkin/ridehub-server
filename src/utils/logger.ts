import fs from "fs";
import util from "util";
var log_file: { write: (arg0: string) => void; };
var user_file: { write: (arg0: string) => void; };

export function createLogFiles(path : string) {
  if (!fs.existsSync(path +'/logs')){
    fs.mkdirSync(path +'/logs');
  }
  log_file = fs.createWriteStream(path +'/logs/ridehub.log', {flags : 'a'});
  //user_file = fs.createWriteStream(path + '/logs/users.log', {flags : 'a'});
}

export function logError(mess : string) { 
  try {
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    const message = util.format('%s %s: ***** %s',date,time,mess)+ '\n'; 
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
    log_file.write(message);
  }
  catch(e) {
    
  }
};