import fs from "fs";
import util from "util";
var log_file: { write: (arg0: string) => void; };
var user_file: { write: (arg0: string) => void; };
var action_file: { write: (arg0: string) => void; };

export function createLogFiles(path : string) {
  if (!fs.existsSync(path +'/logs')){
    fs.mkdirSync(path +'/logs');
  }
  log_file = fs.createWriteStream(path +'/logs/rh_error.log', {flags : 'a'});
  action_file = fs.createWriteStream(path +'/logs/rh_action.log', {flags : 'a'});
  user_file = fs.createWriteStream(path + '/logs/rh-users.log', {flags : 'a'});
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
    user_file.write(message);
  }
  catch(e) {
    
  }
};
export function logAction(request: { body: { data: String; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void){
  try {
    const action = request.body.data;
    const time = new Date().toLocaleTimeString();
    const date = new Date().toLocaleDateString();
    const message = util.format('%s %s: %s',date,time,action)+ '\n'; 
    action_file.write(message);
  }
  catch(e) {
    
  }
};
// export function getLogFiles(request: any, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

//   const read_log_file = fs.createReadStream('./logs/ridehub.log');
//   const data = read_log_file.read();
//   response = data;
//   //user_file = fs.createWriteStream(path + '/logs/users.log', {flags : 'a'});
// }