const express = require('express')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const cors = require('cors');
//const errorLog = require('./src/utils/logger').errorlog;
//import {errorLog } from './src/utils/logger'
import { apiMethods, User, Ride,  Route, Participant } from '../ridehub-common'
import { logIn, getLogins } from "@/logins";
import { getRoutes, getGpx, saveRoute } from "@/routes";
import { getRidesForDate, saveRide, editRide, deleteRide } from "@/rides";
import { getParticipants, saveParticipant, leaveParticipant } from "@/participants";
import { createLogFiles, logError, logUser } from '@/utils/logger';

const app = express ();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());


  app.listen(port, () => {
    console.log("RideHub server listening on PORT:", port);
  });

  //app.post("/" + apiMethods.getRides, (request: { body: { data: number; }; },     response: { json: (arg0: Ride[]) => void; }, next: (arg0: { code: any; }) => void) => { getRidesForDate(request,response,next);  })
  app.post("/" + apiMethods.getRides,  getRidesForDate )
  app.post("/" + apiMethods.getRoutes, getRoutes)
  app.post("/" + apiMethods.getGpx,    getGpx)
  app.post("/" + apiMethods.getPpts,   getParticipants)
  app.post("/" + apiMethods.login,     logIn)
  app.post("/" + apiMethods.getLogins, getLogins)
  app.post("/" + apiMethods.savePpt,   saveParticipant)
  app.post("/" + apiMethods.leavePpt,  leaveParticipant)
  app.post("/" + apiMethods.saveRide,  saveRide)
  app.post("/" + apiMethods.editRide,  editRide)
  app.post("/" + apiMethods.deleteRide,deleteRide)
  app.post("/" + apiMethods.saveRoute, saveRoute)
  //app.post("/" + apiMethods.tcx2gpx,   Tcx2Gpx)

  app.use((err, req, res, next) => {
    
    console.error(err.message);
    logError(err.message);

    res.statusMessage = err.message;
    res.status(500).send(err.message)
  })

  createLogFiles(__dirname);
  // var fs = require('fs');
  // var util = require('util');

  // var logFile = fs.createWriteStream(__dirname +'/error.log', {flags : 'a'});
  // var userFile = fs.createWriteStream(__dirname + '/users.log', {flags : 'a'});

// function logError(mess : string) { 
//   try {
//     const time = new Date().toLocaleTimeString();
//     const date = new Date().toLocaleDateString();
//     const message = util.format('%s %s: %s',time,date,mess)+ '\n'; 
//     log_file.write(message);
//   }
//   catch (e){
//   }
// };
// function logUser(mess: string) { //
//   try {
//     const time = new Date().toLocaleTimeString();
//     const date = new Date().toLocaleDateString();
//     const message = util.format('%s %s: %s',time,date,mess)+ '\n'; 
//     //const message = `${Date.now.toString()}: d\n`;
//     user_file.write(message);
//   }
//   catch(e) {
    
//   }
// };