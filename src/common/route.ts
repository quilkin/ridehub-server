export class Route {

    dest = '';
    route= '';     // was 'gpxData'
    miniroute= '';     // was 'gpxData'
    id = 0;
    climbing = 0;
    distance= 50;
    owner = '';
    //hasGPX = this.gpxData.length > 0;
    hasGPX = false;
    // // not actually used but required for compatability with old DB
    // description = '';
    highlighted = false;    // only used by client app
   
}