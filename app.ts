import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cors from "cors";
import type { ErrorRequestHandler } from "express";
import * as dotenv from "dotenv";


import { logIn, getLogins, findUser, register, changeAccount, forgotPW, signUp, checkMember, getEmergencyContact } from "./src/logins.js";
import { getRoutesById, getRoutesByDistance, getGpx, saveRoute, updateRoute, Tcx2Gpx, shortenRoutes } from "./src/routes.js";
import { getRidesForDate, saveRide, editRide, deleteRide, ridecount } from "./src/rides.js";
import { getParticipants, saveParticipant, leaveParticipant, touristTrophy, leaderTrophy } from "./src/participants.js";
import { createLogFiles, logError, logUser, logAction } from './src/utils/logger.js';
import { getMembers, saveMember, editMember, deleteMember, payment, findMember, findLoginName } from "./src/members.js";
import { sendGroupEmail } from "./src/email.js";
import { autoMembershipList } from "./src/email.js";
import { apiMethods } from './src/common/apiMethods.js';
import { createPool } from './src/dbconn.js'  ;
import path from "path/win32";

const app = express ();
const port = process.env.PORT || 3000;
dotenv.config({ path: './.env' });
createLogFiles('./');
createPool('./.env');

app.use(express.json({ limit: '1mb'}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: '1mb',extended: false }));

app.use(methodOverride());

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from shared TCC service' });
});

app.use('/membership', express.static('membership-client'));
// serve built client assets at /assets so absolute paths in index.html resolve
app.use('/assets', express.static('membership-client/assets'));

app.use('/ridehub', express.static('ridehub-client'));
// serve built client assets at /assets so absolute paths in index.html resolve
app.use('/assets', express.static('ridehub-client/assets'));


app.listen(port, () => {
    console.log("RideHub server listening on PORT:", port);
  });

app.get('/', function (req, res) {
    res.sendFile('index.html',  { root: '../client' })
});

// only used direct from browser
app.get("/ShortenRoutes",      shortenRoutes)
app.get('/actions', function (req, res) {
  res.sendFile('./logs/rh_action.log',  { root: './' })
})
app.get('/errors', function (req, res) {
  res.sendFile('./logs/rh_error.log',  { root: './' })
})
app.get('/users', function (req, res) {
  res.sendFile('./logs/rh_users.log',  { root: './' })
})
app.get('/test', function (req, res) {
    res.send('Ridehub server running!');
    logError('Ridehub server running!');
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
  app.post("/" + apiMethods.ridecount,   ridecount)
  app.post("/" + apiMethods.touristTrophy,touristTrophy)
  app.post("/" + apiMethods.leaderTrophy, leaderTrophy)
  // routes
  app.post("/" + apiMethods.getRoutesById,getRoutesById)
  app.post("/" + apiMethods.getRoutesByDs,getRoutesByDistance)
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
  app.post("/" + apiMethods.logAction,    logAction)
  app.post("/" + apiMethods.checkMember,    checkMember)
  app.post("/" + apiMethods.getEmergencyContact,    getEmergencyContact)

    // membership
  app.post("/" + apiMethods.getMembers,     getMembers)
  app.post("/" + apiMethods.saveMember,     saveMember)
  app.post("/" + apiMethods.editMember,     editMember)
  app.post("/" + apiMethods.deleteMember,   deleteMember)
  app.post("/" + apiMethods.findMember,   findMember)
  app.post("/" + apiMethods.findLoginName,   findLoginName)
   app.post("/" + apiMethods.findLoginName,   findLoginName)
  app.post("/" + apiMethods.payment,   payment)
  app.post("/" + apiMethods.groupEmail, sendGroupEmail)
  
  const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    let message = err.message.toString();
    // if (message.includes('Learn more at')) {
    //   // special for gmail error
    //   let index = message.indexOf('Learn more at');
    //   message = message.substring(0,index);
    // }
    console.error(message);
    logError(message);
  
    res.statusMessage = message;
    res.status(500).send(message);
  }

  app.use(errorHandler);
  
  logError("RideHub server listening on PORT: "  + port);
