import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";

class Track{
    protected root: any;
    protected gpx: any;
    protected track: any;
    protected xml: string;
    protected name : string;
    protected trackPnt: any[] = [];
    protected trackPntNew: any[] = [];
    protected parser : XMLParser;


    constructor( xmlText : string) {
        this.xml = xmlText;
        this.name = '';
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix : "@_"
        };
        this.parser = new XMLParser(options);
        
    }
    public checkXML() {
        //const parser = new XMLParser();
        try {
            this.root = this.parser.parse(this.xml);
            }
        catch (err) {
            throw new Error('Invalid XML in file');
        }
    }
    public CreateSmallGPX(): string {
        // shorten to ~100 trackpoints for fast display
        
        const pointCount = this.trackPnt.length;
        const skipPoints = Math.floor(pointCount / 100) + 1;
        this.trackPntNew = [];
        for (let count = 0; count < pointCount; count += skipPoints) {
            this.trackPntNew.push(this.trackPnt[count]);
        }
        if (this.root.gpx.trk === undefined) 
        {
            console.log('route has no trk section');
            return '';
        }
        this.root.gpx.trk.trkseg.trkpt = this.trackPntNew;
        // convert back to XML
        const options = {
            ignoreAttributes : false,
            attributeNamePrefix : "@_"
        };
        const builder = new XMLBuilder(options);
        // mark that this file has been shortened
        //this.gpx['@_shortened'] = 'true';
        let xmlDataStr = builder.build(this.root);
        return xmlDataStr;

    }
}

export class GPXTrack extends Track {
    
    protected trackSeg: any;
     
    public getObjects(): void {

        this.checkXML();

        this.gpx = this.root.gpx;
        this.track = this.gpx.trk;
        if (this.track === undefined) {
            console.log('no track section in file');
            return;
        }
        if (this.track.name != undefined)
            this.name = this.track.name;
        if (this.name.length > 30)
            this.name= this.name.substring(0,30);
        //const trackSegs = this.track.trkseg;
        if (this.track.trkseg.length > 1) {
            throw new Error('multi track segments not yet allowed')

        }
        else {
            this.trackSeg = this.track.trkseg;
            this.trackPnt = this.trackSeg.trkpt;
        }
    }
 
    public CreateGPX(): string {

        // shorten lat/longs to 5 decimals and elevations to 0 decimal
  
        const pointCount = this.trackPnt.length;
 
        for (let count = 0; count < pointCount; ++count ) {
            let lat = this.trackPnt[count]['@_lat'];
            let lon = this.trackPnt[count]['@_lon'];
            let ele = this.trackPnt[count].ele;
            lat = Number.parseFloat(lat).toFixed(5);
            lon = Number.parseFloat(lon).toFixed(5);
            ele = Number.parseFloat(ele).toFixed(0);
            this.trackPnt[count]['@_lat'] = lat.toString();
            this.trackPnt[count]['@_lon'] = lon.toString();
            this.trackPnt[count].ele = ele.toString();

        }
        // convert back to XML
        const options = {
            ignoreAttributes : false,
            attributeNamePrefix : "@_"
        };
        const builder = new XMLBuilder(options);
        // mark that this file has been converted / checked
        this.gpx['@_creator'] = 'quilkin.co.uk';
        if (this.gpx.metadata)
            this.gpx.metadata = null;
        let xmlDataStr = builder.build(this.root);
        return xmlDataStr;
     
    }
    
}

export class TCXTrack extends Track{
    
    // protected root: any;
    // protected track: any;
    // protected trackPnt: any[] = [];
    protected lap: any;

     public getObjects(): void {

        this.checkXML();

        this.lap = {};
        if (this.root.TrainingCenterDatabase.Courses) {
            this.name = this.root.TrainingCenterDatabase.Courses.Course.Name;
            this.track = this.root.TrainingCenterDatabase.Courses.Course.Track;
           // this.lap = this.root.TrainingCenterDatabase.Courses.Course.Lap;
        }
        else if (this.root.TrainingCenterDatabase.Activities) {
            if (this.root.TrainingCenterDatabase.Activities.Activity.Lap.length > 1) 
                throw new Error('multi lap routes not allowed')
            this.track = this.root.TrainingCenterDatabase.Activities.Activity.Lap.Track;
           // this.lap = this.root.TrainingCenterDatabase.Activities.Activity.Lap;
        }
        this.trackPnt = this.track.Trackpoint;
    }
 
    public CreateGPX(): string {
        // convert tcx elements to gpx elements
        // shorten lat/longs to 5 decimals and elevations to 0 decimal
  
        this.root.gpx = {};
        this.root.gpx.trk = {};
        this.root.gpx.trk.trkseg = {};
        
        const pointCount = this.trackPnt.length;
        this.root.gpx.trk.trkseg.trkpt = new Array(pointCount);
 
        for (let count = 0; count < pointCount; ++count ) {
            let lat = this.trackPnt[count].Position.LatitudeDegrees;
            let lon = this.trackPnt[count].Position.LongitudeDegrees;
            let ele = this.trackPnt[count].AltitudeMeters;
            lat = Number.parseFloat(lat).toFixed(5);
            lon = Number.parseFloat(lon).toFixed(5);
            ele = Number.parseFloat(ele).toFixed(0);

            // remove the TCX elements and recreate GPX elements
            delete this.trackPnt[count];

            this.root.gpx.trk.trkseg.trkpt[count] = {};
            this.root.gpx.trk.trkseg.trkpt[count]['@_lat'] = lat.toString();
            this.root.gpx.trk.trkseg.trkpt[count]['@_lon'] = lon.toString();
            this.root.gpx.trk.trkseg.trkpt[count].ele = ele.toString();

        }
        // convert back to XML
        const options = {
            ignoreAttributes : false,
            attributeNamePrefix : "@_"
        };
        const builder = new XMLBuilder(options);
        this.root.gpx.trk.name = this.name;
        // mark that this file has been converted / checked
        this.root.gpx['@_creator'] = 'quilkin.co.uk';

        // get rid of old TCX elements no longer 
        
        delete this.root.TrainingCenterDatabase;
        // prepare for making smallGPX
        this.trackPnt = this.root.gpx.trk.trkseg.trkpt;
        let xmlDataStr = builder.build(this.root);
        return xmlDataStr;

        
    }
}