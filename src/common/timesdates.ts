
export class TimesDates  {

    date = new Date();

    /**
     * Adds a leding zero to a number, if necesssary to make it 2 chars wide
     * @param num 
     * @returns double-digit string
     */
    static pad2(num : number) {
        var s = "00" + num;
        return s.substring(s.length - 2);
    }

    /**
     * Dates are stored internally as no.of days since 1/1/1970
     * @param time 
     * @returns number of days
     */
    static toIntDays(time : Date | undefined) : number {
        if (time === undefined) {
            console.log('Date error: undefined')
                return 0;
        }
        // return number of whole days since 01/01/1970
        var value = time.valueOf();
        value /= 86400000;
        //return parseInt(value.toFixed(0));  
        return Math.floor(value);
    }
    static dateString(time : Date | undefined) : string{
        if (time === undefined) {
                return 'Unknown date';
        }
        // toLocaleTimeString() is no good for different platforms
        //return [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
        return time.toDateString();
    }

    /**
     * get time of day HH:MM from minutes;
     * @param intTime 
     * @returns minutes
     */
    static fromIntTime(intTime : number) : string {
        // return time of day from minutes;
        const hours = Math.floor(intTime / 60);
        const mins = intTime % 60;
        return TimesDates.pad2(hours) + ':' +TimesDates.pad2(mins);
    }
    static StrFromIntDays(intdays : number) : string {
        // return normal date from number of whole days since 01/01/1970
        // var msecs = intdays * 86400000;
        // var date = new Date(msecs);
        return TimesDates.dateString(this.fromIntDays(intdays));
    }
    /**
     * return normal date from number of whole days since 01/01/1970
     * @param intdays 
     * @returns js date
     */
    static fromIntDays(intdays : number) : Date {
        // return normal date from number of whole days since 01/01/1970
        const msecs = intdays * 86400000;
        const date = new Date(msecs);
        return date;
    }
    
}

