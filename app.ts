import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
//import path from 'path';
//import { fileURLToPath } from 'url';
import * as dotenv from "dotenv";
//import http from 'http';

import { logIn, getLogins, findUser, register, changeAccount, forgotPW, signUp } from "./src/logins.js";
import { getRoutesById, getRoutesByDs, getGpx, saveRoute, updateRoute, Tcx2Gpx, shortenRoutes } from "./src/routes.js";
import { getRidesForDate, saveRide, editRide, deleteRide } from "./src/rides.js";
import { getParticipants, saveParticipant, leaveParticipant } from "./src/participants.js";
import { createLogFiles, logError, logUser } from './src/utils/logger.js';
import { apiMethods } from './src/common/apiMethods.js';
import { createPool } from './src/dbconn.js'  ;

const app = express ();
//const httpServer = new http.Server(app);
const port = process.env.PORT || 3000;
app.use(express.json({ limit: '1mb'}));
app.use(cors());
// Configuring body parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1mb',extended: false }));

app.use(methodOverride());
app.use(express.static('../client'));

app.listen(port, () => {
    console.log("RideHub server listening on PORT:", port);
  });

app.get('/', function (req, res) {
    res.sendFile('index.html',  { root: '../client' })
});
app.get('/test', function (req, res) {
    res.send('Ridehub server running!');
    logError('Ridehub server running!');
})
// app.get('/crashtest1', function (req, res,next) {
//   res.send('Ridehub server crash test 1');
//   let err = new Error('crash test');
//   next(err);
//   next(err);
//   next(err);
// })
// app.get('/crashtest2', function (req, res,next) {
//   res.send('Ridehub server crash test 2');
//   function recurse() {
//     recurse();
//   }
//   recurse();
// })

// only used direct from browser
  app.get("/ShortenRoutes",      shortenRoutes)
  // rides 
  app.post("/" + apiMethods.getRides,     getRidesForDate)
  app.post("/" + apiMethods.getGpx,       getGpx)
  app.post("/" + apiMethods.getPpts,      getParticipants)
  app.post("/" + apiMethods.savePpt,      saveParticipant)
  app.post("/" + apiMethods.leavePpt,     leaveParticipant)
  app.post("/" + apiMethods.saveRide,     saveRide)
  app.post("/" + apiMethods.editRide,     editRide)
  app.post("/" + apiMethods.deleteRide,   deleteRide)
  // routes
  app.post("/" + apiMethods.getRoutesById,getRoutesById)
  app.post("/" + apiMethods.getRoutesByDs,getRoutesByDs)
  app.post("/" + apiMethods.saveRoute,    saveRoute)
  app.post("/" + apiMethods.updateRoute,  updateRoute)
  app.post("/" + apiMethods.tcx2gpx,      Tcx2Gpx)
 
  // logins
  app.post("/" + apiMethods.login,        logIn)
  app.post("/" + apiMethods.signup,       signUp)
  app.post("/" + apiMethods.getLogins,    getLogins)
  app.post("/" + apiMethods.findUser,     findUser)
  app.post("/" + apiMethods.register,     register)
  app.post("/" + apiMethods.changeAccount,changeAccount)
  app.post("/" + apiMethods.forgotPW,     forgotPW)

  
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let message = err.message.toString();
    if (message.includes('Learn more at')) {
      // special for gmail error
      let index = message.indexOf('Learn more at');
      message = message.substring(0,index);
    }
    console.error(message);
    logError(message);
  
    res.statusMessage = message;
    res.status(500).send(message);
  }

  app.use(errorHandler);

  createLogFiles('./');
  createPool('./.env');
  dotenv.config({ path: './.env' });
  logError("RideHub server listening on PORT: "  + port);
  //logError("Environment: "  + process.env.NODE_ENV);