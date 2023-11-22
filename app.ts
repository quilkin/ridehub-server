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
import { getRoutes, getGpx, saveRoute, updateRoute } from "./src/routes.js";
import { getRidesForDate, saveRide, editRide, deleteRide } from "./src/rides.js";
import { getParticipants, saveParticipant, leaveParticipant } from "./src/participants.js";
import { createLogFiles, logError, logUser } from './src/utils/logger.js';
import { apiMethods } from './src/common/apiMethods.js';
import { createPool } from './src/dbconn.js'  ;

const app = express ();
//const httpServer = new http.Server(app);
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static('../client'));

app.listen(port, () => {
    console.log("RideHub server listening on PORT:", port);
  });

app.get('/', function (req, res) {
    res.sendFile('index.html',  { root: '../client' })
});
app.get('/test', function (req, res) {
    //res.json('Ridehub server running!');
    res.send('Ridehub server running!');
})
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
  app.post("/" + apiMethods.getRoutes,    getRoutes)
  app.post("/" + apiMethods.saveRoute,    saveRoute)
  app.post("/" + apiMethods.updateRoute,  updateRoute)
  // logins
  app.post("/" + apiMethods.login,        logIn)
  app.post("/" + apiMethods.signup,       signUp)
  app.post("/" + apiMethods.getLogins,    getLogins)
  app.post("/" + apiMethods.findUser,     findUser)
  app.post("/" + apiMethods.register,     register)
  app.post("/" + apiMethods.changeAccount,changeAccount)
  app.post("/" + apiMethods.forgotPW,     forgotPW)



  //app.post("/" + apiMethods.tcx2gpx,   Tcx2Gpx)
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    
    console.error(err.message);
    logError(err.message);
  
    res.statusMessage = err.message;
    res.status(500).send(err.message)
  }

  app.use(errorHandler);

  // const __filename = fileURLToPath(import.meta.url);
  // const __dirname = path.dirname(__filename);
  createLogFiles('./');
  createPool('./.env');
  dotenv.config({ path: './.env' });
  logError("RideHub server listening on PORT: "  + port);
  logError("Environment: "  + process.env.NODE_ENV);