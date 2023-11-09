const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
import { apiMethods, User, Ride,  Route, Participant } from '../ridehub-common'
import { logIn } from "@/logins";
import { getRoutes, getGpx } from "@/routes";
import { getRidesForDate, saveRide, editRide, deleteRide } from "@/rides";
import { getParticipants, saveParticipant, leaveParticipant } from "@/participants";
//import 'dotenv/config';

const app = express ();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

  app.listen(port, () => {
    console.log("RideHub server listening on PORT:", port);
  });

  app.post("/" + apiMethods.getRides, (request: { body: { data: number; }; },     response: { json: (arg0: Ride[]) => void; }) => { getRidesForDate(request,response);  })

  app.post("/" + apiMethods.getRoutes,(request: { body: { data: number; }; },     response: { json: (arg0: Route[]) => void; }) =>  { getRoutes(request,response);  })
  app.post("/" + apiMethods.getGpx,   (request: { body: { data: number; }; },     response: { json: (arg0: string) => void; }) => { getGpx(request,response);  })

  app.post("/" + apiMethods.getPpts,  (request: { body: { data: number[]; }; },   response: { json: (arg0: string[]) => void; })=>{ getParticipants(request,response);  })

  app.post("/" + apiMethods.login,    (request: { body: { data: User; }; },        response: { json: (arg0: User) => void; }) => {  logIn(request,response);  })

  app.post("/" + apiMethods.savePpt,  (request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }) => { saveParticipant(request,response);  })
  app.post("/" + apiMethods.leavePpt, (request: { body: { data: Participant; }; }, response: { json: (arg0: string) => void; }) => { leaveParticipant(request,response);  })

  app.post("/" + apiMethods.saveRide, (request: { body: { data: Ride; }; },        response: { json: (arg0: string) => void; }) => { saveRide(request,response);  })
  app.post("/" + apiMethods.editRide, (request: { body: { data: Ride; }; },        response: { json: (arg0: string) => void; }) => { editRide(request,response);  })
  app.post("/" + apiMethods.deleteRide, (request: { body: { data: number; }; },      response: { json: (arg0: string) => void; }) => { deleteRide(request,response);  })

