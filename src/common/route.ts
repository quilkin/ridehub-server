/**
 * Details of a route (gps track etc)
 */
export class Route {

    dest = '';
    route= '';          // the full GPS data, (as created by RideWithGPS etc)
    miniroute= '';      // A shortened version of the route to enable faster display on the overall routes map
    id = 0;             // autoincremened by the database
    climbing = 0;       // how many metres of climbing involved
    distance= 50;       // kilometres
    owner = '';         // defined when someone devised a route - will be teh logged-on username
    hasGPX = false;     // will be false if rid elader hasn't provided a GPS track
    highlighted = false;    // only used by client app - true if it's the currently chosen route on the map
   
}