import fs from "fs";
var log_file: { write: (arg0: string) => void; };
var user_file: { write: (arg0: string) => void; };
var action_file: { write: (arg0: string) => void; };

export function createLogFiles(logPath : string) {
  if (!fs.existsSync(`${logPath}/logs`)){
    fs.mkdirSync(`${logPath}/logs`);
  }
  log_file = fs.createWriteStream(`${logPath}/logs/rh_error.log`, {flags : 'a'});
  action_file = fs.createWriteStream(`${logPath}/logs/rh_action.log`, {flags : 'a'});
  user_file = fs.createWriteStream(`${logPath}/logs/rh_users.log`, {flags : 'a'});
}

function timeStr(): string {
  return new Date().toLocaleTimeString();
}
function dateStr() : string {
  return new Date().toLocaleDateString();
}
export function logError(mess : string) { 
  try {
   // const message = util.format('%s %s: ***** %s',dateStr(),timeStr(),mess)+ '\n'; 
    const message = `${dateStr()} ${timeStr()}: ***** ${mess}\n`;
    log_file.write(message);
  }
  catch (e){
  }
};
export function logUser(mess: string) { //
  try {
    //const message = util.format('%s %s: %s',dateStr(),timeStr(),mess)+ '\n'; 
    const message = `${dateStr()} ${timeStr()}: ${mess}\n`;
    user_file.write(message);
  }
  catch(e) {
    
  }
};
export function logAction(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void){
  try {
    const action = request.body.data;
    const message = `${dateStr()} ${timeStr()}: ${action}\n`;
    action_file.write(message);
  }
  catch(e) {
    
  }
};
