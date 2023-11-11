const express = require('express')
const bodyParser = require('body-parser');
const methodOverride = require('method-override')
const cors = require('cors');
import { apiMethods, User, Ride,  Route, Participant } from '../ridehub-common'
import { logIn, getLogins } from "@/logins";
import { getRoutes, getGpx } from "@/routes";
import { getRidesForDate, saveRide, editRide, deleteRide } from "@/rides";
import { getParticipants, saveParticipant, leaveParticipant } from "@/participants";

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

  app.use((err, req, res, next) => {
    
    console.error(err.message);
    //todo: also add to log file
       
    res.statusMessage = err.message;
    res.status(500).send(err.message)
  })
