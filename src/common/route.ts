export class Route {
    dest = '';
    gpxData= '';
    id = 0;
    climbing = 0;
    distance= 0;
    owner = '';
    hasGPX = this.gpxData.length > 0;
    // not actually used but required for compatability with old DB
    description = '';

  
    // public distStr(userUnits : string): string   {
    //     var distance = 0;
    //     if (this.distance !== undefined) {
    //         distance = this.distance;
    //     }
    //     if (distance === 0)
    //         return '?';
    //     var units = ' km ';
    //     if (userUnits === 'm') {
    //         units = ' ml ';
    //         distance = Math.round(distance * 0.62137);
    //     }
    //     return distance.toString() + units;
    // }
    // public climbStr(userUnits : string) {
    //     var units = ' m';
    //     var climbing = 0;
    //     if (this.climbing !== undefined) {
    //         climbing = this.climbing;
    //         if (climbing ===0)
    //             return '';
    //         if (userUnits === 'm') {
    //             units = ' ft';
    //             climbing = Math.round(climbing * 3.3);
    //         }
    //         var climbingStr =  climbing + units ;
    //         return climbingStr;
    //     }
    //     return '';
    // }
    // public climbColour () {
    //     const ratio = this.climbRatio();
    //     if (ratio > 17) return 'red';
    //     if (ratio > 12) return 'orange';
    //     if (ratio > 0) return 'green';
    //     return 'white';
    // }
    // public climbRatio()
    // {
    //     if (this.climbing == undefined) 
    //         return 0;
    //     if (this.climbing ===0)
    //         return 0;
    //     if (this.distance ===0)
    //         return 0;

    //     const climbRatio = this.climbing / this.distance;
    //     return Math.round(climbRatio);
    // }
}