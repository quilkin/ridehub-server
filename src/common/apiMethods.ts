/**
 * Helper names so that server and cleint can easily use the name when exchanging data.
 * Doesn't matter what these strings are as long as they are all different!
 * I hope tehy are all self-explanatory.
 */
export enum apiMethods {

    signup = 'Signup',
    login = 'Login',
    changeAccount = 'ChangeAccount',
    forgotPW ='ForgetPassword',
    getRides = 'GetRidesForDate',  
    getRoutesById = 'GetRoutesByID',    
    getRoutesByDs = 'GetRoutesByDistance',       
    getPpts = 'GetParticipants',
    getGpx = 'GetGPXforRoute',
    saveRoute = 'SaveRoute',
    saveRide = 'SaveRide',
    editRide = 'EditRide',
    updateRoute = 'UpdateRoute',
    savePpt = 'SaveParticipant',
    leavePpt= 'LeaveParticipant',
    deleteRide = 'DeleteRide',
    tcx2gpx = 'TCX2GPX',
    getLogins = 'GetLogins',
    register = 'Register',
    checkTimeout = 'CheckTimeout',
    findUser = 'FindUser',
    touristTrophy = 'TouristTrophy',
    leaderTrophy = 'LeaderTrophy',
    logAction = 'LogAction'
    
  }
  