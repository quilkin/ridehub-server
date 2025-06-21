import  { TimesDates }  from './timesdates'

/**
 * Class for a 'Ride' - contains a route ID (which will reference a GPS track), date/time of the ride and other info
 */
export class Ride {
    leaderName = '';
    routeID = 0;
    date = TimesDates.toIntDays(new Date());
    rideID = 0;             // will be autoincrented by the database
    time = 540;             // times stored as minutes. Default start time is 9 am
    meetingAt = '';         // place to start ride
    description = '';
    groupSize = 10;         // default size, can be amended by the ride leader. This started out during Covid when we were limited to 6 per group
    minSpeed = 0;   
    maxSpeed = 0; 
    emailRequired = false;  // only true if ride details hav been changed and riders need a notification
}