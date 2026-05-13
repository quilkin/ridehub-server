import { dbconnection } from './dbconn.js'  ;
import { Route} from './common/route.js'
import { GPXTrack, TCXTrack } from './gpxtrack.js'
import {  logUser } from './utils/logger.js';

export function getRoutesById(request: { body: { data: number[]; }; }, response: { json: (arg0: Route[]) => void; }, next: (arg0: any) => void) {
    const idList : number[] = request.body.data;
    if (idList.length === 0) {
      response.json([]);
      return;
    }

    const placeholders = idList.map(() => '?').join(',');
    const query = `SELECT id,dest,distance,climbing,ownername,hasGPX,miniroute FROM routes WHERE id IN (${placeholders})`;

    dbconnection.query(query, idList, function (error: any, results: any[])
    {
      if (error != null) {
        next(error);
        return;
      }
      response.json(results);
    });
  }
  export function getRoutesByDistance(request: { body: { data: number[]; }; }, response: { json: (arg0: Route[]) => void; }, next: (arg0: any) => void) {
    if (request.body.data.length < 2) {
      next(new Error('insufficient distance info for getting routes'));
      return;
    }
    const min : number = request.body.data[0];
    const max : number = request.body.data[1];

    const query = `SELECT id,dest,distance,climbing,ownername,hasGPX,miniroute FROM routes WHERE distance >= ? AND distance < ?`;

    dbconnection.query(query, [min, max], function (error: any, results: any[])
    {
      if (error != null) {
        next(error);
        return;
      }
      response.json(results);
    });
  }

  
  export function getGpx(request: { body: { data: number; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
    const routeId : number = request.body.data;
    const query = `SELECT route FROM routes WHERE id = ?`;
    dbconnection.query(query, [routeId], function (error: any, results: string[])
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

  export function saveRoute(request: { body: { data: Route; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void){
    const route = request.body.data;
    const dest = route.dest || '';

    let fullText: string = '';
    let shortText: string = '';

    if (route.hasGPX === false || route.route.length > 1000) {
      fullText = route.route;

      if (route.route.includes('TrainingCenterDatabase')) {
        const tcxTrack = new TCXTrack(fullText);
        tcxTrack.getObjects();
        fullText = tcxTrack.CreateGPX();
        shortText = tcxTrack.CreateSmallGPX();
      } else if (route.route.toLowerCase().includes('gpx')) {
        const gpxTrack = new GPXTrack(fullText);
        gpxTrack.getObjects();
        fullText = gpxTrack.CreateGPX();
        shortText = gpxTrack.CreateSmallGPX();
      } else {
        fullText = '';
        shortText = '';
      }
    }

    const query = `INSERT INTO routes (dest,distance,climbing,route,ownername,hasGPX,miniroute) VALUES (?,?,?,?,?,?,?)`;
    const params = [dest, route.distance, route.climbing, fullText, route.owner, route.hasGPX ? 1 : 0, shortText];

    dbconnection.query(query, params, function (error: any, results: { insertId: string; })
    {
      if (error != null) {
        next(error);
        return;
      }
      logUser(`Route ${dest} saved `);
      response.json(results.insertId.toString());
    });
  }
export function Tcx2Gpx(request: { body: { data: string; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
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

export function updateRoute(request: { body: { data: Route; }; }, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {

    const route = request.body.data;
    const dest = route.dest || '';
    const sql = `UPDATE routes SET distance = ?, climbing = ?, dest = ? WHERE id = ?`;
    const params = [route.distance, route.climbing, dest, route.id];

    dbconnection.query(sql, params, function (error: any, results: { insertId: string; })
    {
      if (error != null) {
        next(error);
        return;
      }
      response.json("OK");
    });

}

/**
 * make a shortened version of each route, for faster 
 * only ever called direct from a browser (not from client app)
 * 
 */
export function shortenRoutes(request: any, response: { json: (arg0: string) => void; }, next: (arg0: any) => void) {
  const query = `SELECT id,route,dest,miniroute FROM routes`;
  dbconnection.query(query, function (error: any, results: any[]) {
    if (error != null) {
      next(error);
      return;
    }

    const updates: Array<{ id: number; shortText: string }> = [];

    results.forEach(function (route) {
      if (!route.route || route.route.length < 10) {
        return;
      }
      if (!route.route.includes('quilkin')) {
        const gpxTrack = new GPXTrack(route.route);
        gpxTrack.getObjects();
        route.route = gpxTrack.CreateGPX();
      }

      if (route.miniroute != null) {
        return;
      }

      const gpxTrack = new GPXTrack(route.route);
      gpxTrack.getObjects();
      const shortText = gpxTrack.CreateSmallGPX();
      const count1 = (route.route.match(/trkpt/g) || []).length / 2;
      const count2 = (shortText.match(/trkpt/g) || []).length / 2;
      console.log('Route ' + route.dest + ' shortened from ' + count1 + ' to ' + count2 + ' trackpoints');
      updates.push({ id: route.id, shortText });
    });

    if (updates.length === 0) {
      response.json('OK');
      return;
    }

    let completed = 0;
    updates.forEach((item) => {
      const updateQuery = `UPDATE routes SET miniroute = ? WHERE id = ?`;
      dbconnection.query(updateQuery, [item.shortText, item.id], function (error: any) {
        if (error != null) {
          next(error);
          return;
        }
        completed += 1;
        if (completed === updates.length) {
          response.json('OK');
        }
      });
    });
  });
}