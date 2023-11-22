
export class TimesDates  {

    date = new Date();

    static pad2(num : number) {
        var s = "00" + num;
        return s.substring(s.length - 2);
    }

    static toIntDays(time : Date | undefined) : number {
        if (time === undefined) {
            console.log('Date error: undefined')
                return 0;
        }
        // return number of whole days since 01/01/1970
        var value = time.valueOf();
        value /= 86400000;
        return parseInt(value.toFixed(0));  
    }
    static dateString(time : Date | undefined) : string{
        if (time === undefined) {
                return 'Unknown date';
        }
        // toLocaleTimeString() is no good for different platforms
        //return [time.getFullYear(), pad2(time.getMonth() + 1), pad2(time.getDate())].join('-');
        return time.toDateString();
    }
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
    static fromIntDays(intdays : number) : Date {
        // return normal date from number of whole days since 01/01/1970
        const msecs = intdays * 86400000;
        const date = new Date(msecs);
        return date;
    }
    
}

