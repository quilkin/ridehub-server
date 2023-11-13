class GarminTrack extends TrackFile {
    private static readonly ns1: string = "http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2";
 
    private static RouteName(): string {
        // obtain a single element with specific tag (first instance), useful if only expecting one instance of the tag in the target doc
        const nameElement: XElement = (from c in root.Descendants(ns1 + "Name") select c).First();
        return nameElement.Value;
    }
 
    private static ParseTCX(): Track {
        const tracks: Track[] = 
            from trackElement in root.Descendants(ns1 + "Track")
            select new Track {
                TrackPoints: 
                    (from trackPointElement in trackElement.Descendants(ns1 + "Trackpoint")
                     select new TrackPoint {
                          AltitudeMeters: trackPointElement.Element(ns1 + "AltitudeMeters") != null
                                         ? Convert.ToDouble(trackPointElement.Element(ns1 + "AltitudeMeters").Value) : 0.0,
                         
                         DistanceMeters: trackPointElement.Element(ns1 + "DistanceMeters") != null
                                         ? Convert.ToDouble(trackPointElement.Element(ns1 + "DistanceMeters").Value) : 0.0,
 
                         Positionx: 
                             (from positionElement in trackPointElement.Descendants(ns1 + "Position")
                              select new Position {
                                  LatitudeDegrees: Convert.ToDouble(positionElement.Element(ns1 + "LatitudeDegrees").Value),
                                  LongitudeDegrees: Convert.ToDouble(positionElement.Element(ns1 + "LongitudeDegrees").Value),
                             
                            }).ToList()
                        }).ToList()
            };
 
        return tracks.SingleOrDefault();
    }
 
    public static TCXtoGPX(): string {
        var trkseg = new XElement("trkseg");
        const GPX: XElement = new XElement("gpx",
            new XAttribute("version", "1.0"),
            new XAttribute("creator", "quilkin.co.uk"),
            new XElement("trk",
                new XElement("name", RouteName()),
                trkseg
            )
        );
 
        const track: Track = ParseTCX();
        const pointCount: number = track.TrackPoints.Count;
 
        // limit the number of points to < 1000, shorten lat/longs to 5 decimals and elevations to 1 decimal
 
        const skipPoints: number = Math.floor(pointCount / 1000) + 1;
 
        for (let count: number = 0; count < pointCount; count += skipPoints) {
            const tp: TrackPoint = track.TrackPoints[count];
            const pos: Position = tp.Positionx[0];
            trkseg.Add(new XElement("trkpt",
                new XAttribute("lat", pos.LatitudeDegrees.toString("0.#####")),
                new XAttribute("lon", pos.LongitudeDegrees.toString("0.#####")),
                new XElement("ele", tp.AltitudeMeters.toString("0.#"))));
        }
        return GPX.ToString();
    }
}