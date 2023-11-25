import { XMLParser, XMLBuilder, XMLValidator } from "fast-xml-parser";
//import _ from 'lodash';

// class Position {
//     public Lat = 0; 
//     public Lng = 0;
// }

// class TrackPoint {
//     private altMeters = 0;
//     private static lastAltMeters: number = 0;

//     public get AltitudeMeters(): number {
//         return this.altMeters;
//     }

//     public set AltitudeMeters(value: number) {
//         this.altMeters = value;
//         if (isNaN(this.altMeters)) {
//             this.altMeters = TrackPoint.lastAltMeters;
//         } else {
//             TrackPoint.lastAltMeters = this.altMeters;
//         }
//     }

//     public DistanceMeters = 0;
//     public Positionx: Position[] = [];
//     public pos: Position = new Position;
// }

// class Track {
//     public TrackPoints: TrackPoint[] = [];
// }

 

export class GPXTrack {
    private static readonly ns11: string = "http://www.topografix.com/GPX/1/1";
    private static readonly ns10: string = "http://www.topografix.com/GPX/1/0";
    private static ns1: string;
    
    protected root: any;
    protected gpx: any;
    protected track: any;
    protected trackSeg: any;
    protected trackPnt: any[] = [];
    protected trackPntNew: any[] = [];
    protected xml: string;
    protected name : string;
 
    constructor( xmlText : string) {
        this.xml = xmlText;
        this.name = '';
    }
 
    public getObjects(): void {
        const options = {
            ignoreAttributes: false,
            attributeNamePrefix : "@_"
        };
        const parser = new XMLParser(options);
        try {
            this.root = parser.parse(this.xml);
            }
        catch (err) {
            throw new Error('Invalid XML in file');
        }
        this.gpx = this.root.gpx;
        this.track = this.gpx.trk;
        this.name = this.track.name;
        //const trackSegs = this.track.trkseg;
        if (this.track.trkseg.length > 1) {
            throw new Error('multi track segments not yet allowed')
            // this.trackPnt = [];
            // for (let seg=0; seg < this.track.trkseg.length; seg++) {
            //     this.trackSeg[seg] = this.track.trkseg[seg];
            //     this.trackPnt[seg] = this.trackSeg[seg].trkpt;
            //     // const trackSeg = trackSegs[seg];
            //     // for (let trkpnt=0; trkpnt < trackSeg.trkpt.length; trkpnt++) {
            //     //     this.trackPnt.push(trackSeg.trkpt[trkpnt]); 
            //     // }
            //     //.prototype.push.apply(this.trackPnt,trackSegs[seg]);
            //     //this.trackPnt.push(this.track.trkseg[seg].trkpt);
            //     //this.trackPnt = [...this.trackPnt,...trackSegs[seg]];
            //     //this.trackPnt = this.trackPnt.concat(trackSegs[seg].trkpt);
            // }
            // // trackSegs[0] = this.trackPnt;
            // // for (let seg=1; seg < trackSegs.length; seg++) {
            // //     trackSegs[seg] = null;
            // // }
            // // this.trackSeg = trackSegs[0];
        }
        else {
            this.trackSeg = this.track.trkseg;
            this.trackPnt = this.trackSeg.trkpt;
        }
    }
 

    public checkXML() {
        const parser = new XMLParser();
        this.root = parser.parse(this.xml);
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
 
    public CreateSmallGPX(): string {
        // shorten to 100 trackpoints for fast display
  
        const pointCount = this.trackPnt.length;
        const skipPoints = Math.floor(pointCount / 100) + 1;
        this.trackPntNew = [];
        for (let count = 0; count < pointCount; count += skipPoints) {
            this.trackPntNew.push(this.trackPnt[count]);
        }
        this.trackPnt = this.trackPntNew;
        // convert back to XML
        const options = {
            ignoreAttributes : false,
            attributeNamePrefix : "@_"
        };
        const builder = new XMLBuilder(options);
        // mark that this file has been shortened
        this.gpx['@_shortened'] = 'true';
        let xmlDataStr = builder.build(this.root);
        return xmlDataStr;

    }
}