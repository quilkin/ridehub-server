import { dbconnection } from './dbconn.js'  ;
import { Route} from './common/route.js'
import { GPXTrack } from './gpxtrack.js'

export function getRoutes(request: { body: { data: number; }; }, response: { json: (arg0: Route[]) => void; }, next: (arg0: { code: any; }) => void) {
    const which : number = request.body.data;

    let query: string;
	  switch (which) {
	    case 1: query = `SELECT * FROM routes where distance<50`;       break;
	    case 2: query = `SELECT * FROM routes where distance>=50 and distance < 80`;     break;
	    case 3: query = `SELECT * FROM routes where distance>=80`;      break;
	    case 0:
	   default: query = `SELECT hasGPX,id,dest,description,distance,climbing,ownername FROM routes`;    break;
	  }
    dbconnection.query(query,function (error: { code: any; }, results: any[])
    {
      if (error != null) {
        next(error);
      }
      else
        response.json(results);
    });
  }
  export function getGpx(request: { body: { data: number; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
    const routeId : number = request.body.data;
    const query = `SELECT route FROM routes where id=${routeId}`;
    dbconnection.query(query,function (error: { code: any; }, results: string[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length == 0) {
          response.json(`getGPX: Route ${routeId} not found.`);
          return;
        }

      response.json(results[0]);
    });
  }

  function GetRidOfApostrophes(data : string): string
  {
      return data.replace("'", "''");
  }


  export function saveRoute(request: { body: { data: Route; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void){
    

    const route = request.body.data;
    route.dest = GetRidOfApostrophes(route.dest);
    route.description = GetRidOfApostrophes(route.description);
 
    let result: string = "";
    let fullText: string= "";
    let shortText: string = "";
    
    if (route.hasGPX == false || route.gpxData.length > 1000) {
      fullText = route.gpxData;
      const gpxTrack = new GPXTrack(fullText);
      // todo: garmin stuff
        // if (route.gpxData.includes("TrainingCenterDatabase")) {
        //     const sr: System.IO.StringReader = new System.IO.StringReader(route.URL);
        //     GarminTrack.SetRootSR(sr);
        //     fullText = GarminTrack.TCXtoGPX();
        // } else 
        if (route.gpxData.toLowerCase().includes("quilkin")) {
           // already converted
            fullText = route.gpxData;
        }
         else if (route.gpxData.toLowerCase().includes("gpx")) {
            //const sr: System.IO.StringReader = new System.IO.StringReader(route.gpxData);
            gpxTrack.getObjects();
            fullText = gpxTrack.CreateGPX();
            // if (fullText == "") {
            //     fullText = route.gpxData;
            // }
            shortText = gpxTrack.CreateSmallGPX();
        } 
        else {
            fullText = route.gpxData;
            if (route.hasGPX) {
              // will catch if not valid XML
              try {
                gpxTrack.checkXML();
              }
              catch (e : any) {
                next(e);
                return;
              }
            }
        }

        fullText = GetRidOfApostrophes(fullText);
        shortText = GetRidOfApostrophes(shortText);

        let query: string = `insert into routes (dest,distance,description,climbing,route,ownername,hasGPX)`;
        query += ` values ('${route.dest}','${route.distance}','${route.description}','${route.climbing}',`;
        query += `'${fullText}','${route.owner}',${route.hasGPX ? 1 : 0})`;

        dbconnection.query(query,function (error: { code: any; }, results: { insertId: string; })
        {
          if (error != null) {
            next(error);
            return;
          }
          response.json(results.insertId.toString());
        })
      }
    }
    export function Tcx2Gpx(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
      // const tcx = request.body.data;
      // try {
      //   if (tcx.includes("TrainingCenterDatabase"))
      //   {
      //       // full text of TCX file
      //       //System.IO.StringReader sr = new System.IO.StringReader(tcx);
      //       GarminTrack.SetRoot(tcx);
      //       const conversion = GarminTrack.TCXtoGPX();
      //       response.json(conversion); 
      //   }
      // }
      // catch (error : any) {
      //   next(error);
      // }
    }

    export function updateRoute(request: { body: { data: Route; }; }, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {

        const route = request.body.data;
        route.dest = GetRidOfApostrophes(route.dest);
        route.description = GetRidOfApostrophes(route.description);

        const sql = `update routes set distance = ${route.distance}, climbing = ${route.climbing}, dest = '${route.dest}' where id = ${route.id}`
        dbconnection.query(sql,function (error: { code: any; }, results: { insertId: string; })
        {
          if (error != null) {
            next(error);
            return;
          }
          response.json("OK");
        })

    }

