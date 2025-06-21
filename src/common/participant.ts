/**
 * Person who has signed up for a given ride
 */
export class Participant {
    rider : string = '';
    rideID : number = 0;

    constructor(rider: string,id: number) {
        this.rider = rider;
        this.rideID = id;
    }
    
}

/**
 * Helper class to enable calculation of ride stats
 */
export class rideCount {
    rider : string = '';
    count : number = 0;

    constructor(rider: string,count: number) {
        this.rider = rider;
        this.count = count;
    }
}