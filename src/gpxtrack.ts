//import Enumerable from 'linq'
var parseString = require('xml2js').parseString;
 
class Position {
    public LatitudeDegrees!: number;
    public LongitudeDegrees!: number;
}

class TrackPoint {
    private altMeters!: number ;
    private static lastAltMeters: number = 0;

    public get AltitudeMeters(): number {
        return this.altMeters;
    }

    public set AltitudeMeters(value: number) {
        this.altMeters = value;
        if (isNaN(this.altMeters)) {
            this.altMeters = TrackPoint.lastAltMeters;
        } else {
            TrackPoint.lastAltMeters = this.altMeters;
        }
    }

    public DistanceMeters!: number;
    public Positionx!: Position[];
    public pos!: Position;
}

class Track {
    public TrackPoints!: TrackPoint[];
}



class TrackFile {
    protected static root: any;
 
    // not needed ?
    // public static SetRootFromFile(f: string): void {
    //     TrackFile.root = XElement.Load(f);
    // }
 
    public static SetRoot(xmlText: string): void {
        parseString(xmlText,function(error: any,result: any) {
            if (error) {
                console.error(error.message);
                return;
                  //return error.message;
            }
            TrackFile.root = result;
          })
        //TrackFile.root = XElement.Load(tr);
    }
}
 
class GPXTrack extends TrackFile {
    private static readonly ns11: string = "http://www.topografix.com/GPX/1/1";
    private static readonly ns10: string = "http://www.topografix.com/GPX/1/0";
    private static ns1: string;
 
    private static RouteName(): string {
        GPXTrack.ns1 = GPXTrack.ns11;
        let nameElement: any;
        try {
            //nameElement = (from c in root.Descendants(GPXTrack.ns1 + "name") select c).FirstOrDefault();
            nameElement = (Enumerable.from(GPXTrack.root.Descendants(GPXTrack.ns1 + "name")).select c).FirstOrDefault();
            return nameElement.Value;
        } catch {
            GPXTrack.ns1 = GPXTrack.ns10;
            nameElement = GPXTrack.root.Descendants(GPXTrack.ns1 + "name").FirstOrDefault();
            return nameElement.Value;
        }
    }
 
      public static ParseGPX(): Track {
        // const Px: Position[] = [];
        // const tracks: Track[] = from trackElement in root.Descendants(GPXTrack.ns1 + "trkseg")
        //     select new Track {
        //         TrackPoints = (from trackPointElement in trackElement.Descendants(GPXTrack.ns1 + "trkpt")
        //             select new TrackPoint {
        //                 pos = new Position {
        //                     LatitudeDegrees: XmlConvert.ToDouble(trackPointElement.Attribute("lat").Value),
        //                     LongitudeDegrees: XmlConvert.ToDouble(trackPointElement.Attribute("lon").Value),
        //                 },
        //                 AltitudeMeters: trackPointElement.Element(GPXTrack.ns1 + "ele") != null
        //                     ? Convert.ToDouble(trackPointElement.Element(GPXTrack.ns1 + "ele").Value) : 0.0,
        //             }).ToList(),
        //     };
        // return tracks.SingleOrDefault();
        //function ParseGPX(): Track {
            const Px: Position[] = [];
            const tracks: Track[] = Array.from(GPXTrack.root.Descendants(GPXTrack.ns1 + "trkseg")).map(trackElement => {
                return {
                    TrackPoints: Array.from(trackElement.Descendants(GPXTrack.ns1 + "trkpt")).map(trackPointElement => {
                        return {
                            pos: {
                                LatitudeDegrees: parseFloat(trackPointElement.Attribute("lat").Value),
                                LongitudeDegrees: parseFloat(trackPointElement.Attribute("lon").Value),
                            },
                            AltitudeMeters: trackPointElement.Element(GPXTrack.ns1 + "ele") != null
                                ? parseFloat(trackPointElement.Element(GPXTrack.ns1 + "ele").Value) : 0.0,
                        };
                    }),
                };
            });
            return tracks.find(() => true);
        }
    }
 
    public static CreateGPX(): string {
        const xNamespace: string = "http://www.topografix.com/GPX/1/1";
        const trkseg: any = new XElement(xNamespace + "trkseg");
        const GPX: any = new XElement(xNamespace + "gpx",
            new XAttribute("xmlns", xNamespace),
            new XAttribute("version", "1.0"),
            new XAttribute("creator", "quilkin.co.uk"),
            new XElement(xNamespace + "trk",
                new XElement(xNamespace + "name", GPXTrack.RouteName()),
                trkseg,
            ),
        );
        const track: Track = GPXTrack.ParseGPX();
        if (track == null) {
            return "";
        }
        const pointCount: number = track.TrackPoints.Count;
        const skipPoints: number = pointCount / 1000 + 1;
        for (let count: number = 0; count < pointCount; count += skipPoints) {
            const tp: TrackPoint = track.TrackPoints[count];
            const pos: Position = tp.pos;
            trkseg.Add(new XElement(xNamespace + "trkpt",
                new XAttribute("lat", pos.LatitudeDegrees.ToString("0.#####")),
                new XAttribute("lon", pos.LongitudeDegrees.ToString("0.#####")),
                new XElement(xNamespace + "ele", tp.AltitudeMeters.ToString("0.#")),
            ));
        }
        return GPX.ToString();
    }
 
    public static CreateSmallGPX(): string {
        const trkseg: any = new XElement("trkseg");
        const GPX: any = new XElement("gpx",
            new XAttribute("version", "1.0"),
            new XAttribute("creator", "quilkin.co.uk"),
            new XElement("trk",
                new XElement("name", GPXTrack.RouteName()),
                trkseg,
            ),
        );
        const track: Track = GPXTrack.ParseGPX();
        if (track == null) {
            return "";
        }
        const pointCount: number = track.TrackPoints.Count;
        const skipPoints: number = pointCount / 200 + 1;
        for (let count: number = 0; count < pointCount; count += skipPoints) {
            const tp: TrackPoint = track.TrackPoints[count];
            const pos: Position = tp.pos;
            trkseg.Add(new XElement("trkpt",
                new XAttribute("lat", pos.LatitudeDegrees.ToString("0.#####")),
                new XAttribute("lon", pos.LongitudeDegrees.ToString("0.#####")),
            ));
        }
        return GPX.ToString();
    }
}