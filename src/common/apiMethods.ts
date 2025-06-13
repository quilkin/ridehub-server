export enum apiMethods {
  // doesn't matter what these strings are as long as they are all different!
  // (same enum used by client and server)
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
  