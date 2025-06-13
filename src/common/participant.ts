export class Participant {
    rider : string = '';
    rideID : number = 0;

    constructor(rider: string,id: number) {
        this.rider = rider;
        this.rideID = id;
    }
    
}
export class rideCount {
    rider : string = '';
    count : number = 0;

    constructor(rider: string,count: number) {
        this.rider = rider;
        this.count = count;
    }
}