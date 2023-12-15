import  { TimesDates }  from './timesdates'
export class Ride {
    leaderName = '';
    routeID = 0;
    date = TimesDates.toIntDays(new Date());
    rideID = 0;
    time = 540;     // default 9 am
    meetingAt = 'Lemon Quay';
    description = '';
    groupSize = 10;
    minSpeed = 0;   
    maxSpeed = 0; 
}