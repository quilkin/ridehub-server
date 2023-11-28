import { dbconnection } from './dbconn.js'  ;
import { Route} from './common/route.js'
import { GPXTrack, TCXTrack } from './gpxtrack.js'


export function getRoutes(request: { body: { data: number; }; }, response: { json: (arg0: Route[]) => void; }, next: (arg0: { code: any; }) => void) {
    const which : number = request.body.data;

    let query: string;
	  switch (which) {
	    case 1: query = `SELECT * FROM routes where distance<50`;       break;
	    case 2: query = `SELECT * FROM routes where distance>=50 and distance < 80`;     break;
	    case 3: query = `SELECT * FROM routes where distance>=80`;      break;
	    case 0:
	   default: query = `SELECT id,dest,description,distance,climbing,ownername,hasGPX FROM routes`;    break;
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
 
    //let result: string = "";
    let fullText: string= "";
    let shortText: string = "";
    
    if (route.hasGPX == false || route.route.length > 1000) {
      fullText = route.route;
  
  
    if (route.route.includes("TrainingCenterDatabase")) {
        //  garmin stuff
        const tcxTrack = new TCXTrack(fullText);
        tcxTrack.getObjects();
        fullText = tcxTrack.CreateGPX();
        shortText = tcxTrack.CreateSmallGPX();
    } 
    // else  if (route.gpxData.toLowerCase().includes("quilkin")) {
    //     // already converted but needs smallGPX
    //     fullText = route.gpxData;
    // }
      else if (route.route.toLowerCase().includes("gpx")) {
        const gpxTrack = new GPXTrack(fullText);
        gpxTrack.getObjects();
        fullText = gpxTrack.CreateGPX();
        shortText = gpxTrack.CreateSmallGPX();
    } 
    else {
      throw new Error('gpx data type not catered')
    }

    fullText = GetRidOfApostrophes(fullText);
    shortText = GetRidOfApostrophes(shortText);

    let query: string = `insert into routes (dest,distance,description,climbing,route,ownername,hasGPX,miniroute)`;
    query += ` values ('${route.dest}','${route.distance}','${route.description}','${route.climbing}',`;
    query += `'${fullText}','${route.owner}',${route.hasGPX ? 1 : 0},'${shortText}')`;

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
  const tcx = request.body.data;
  try {
    if (tcx.includes("TrainingCenterDatabase"))
    {
          const tcxTrack = new TCXTrack(tcx);
        tcxTrack.getObjects();
        const conversion =  tcxTrack.CreateGPX();
        response.json(conversion); 
    }
  }
  catch (error : any) {
    next(error);
  }
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

/**
 * make a shortened version of each route, for faster 
 * only ever called direct from a browser (not from client app)
 * 
 */
export function shortenRoutes(request: any, response: { json: (arg0: string) => void; }, next: (arg0: { code: any; }) => void) {
  
  let query = `SELECT id,route,miniroute FROM routes`;      
	dbconnection.query(query,function (error: { code: any; }, results: any[])
    {
      if (error != null) {
        next(error);
        return;
      }
      results.forEach ( function (route) {
        if (route.route.length < 10)
           return;
        if (route.route.includes('quilkin')===false) {
          // need to process this
          const gpxTrack = new GPXTrack(route.route);
          gpxTrack.getObjects();
          route.route = gpxTrack.CreateGPX();
        }
 
        if (route.miniroute != null)
          // already done
          return;
        const gpxTrack = new GPXTrack(route.route);
  
        gpxTrack.getObjects();
        const shortText = gpxTrack.CreateSmallGPX();
        query = `update routes set miniroute = '${shortText}' where id = ${route.id}`
        dbconnection.query(query,function (error: { code: any; }, results: any)
        {
          if (error != null) {
            next(error);
            return;
          }
          console.log('updated route '+ route.id);
        })
      });
    });
    response.json("OK");
  

}