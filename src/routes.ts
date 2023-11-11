var dbconnection = require('./dbconn');
import { Route} from '../../ridehub-common'

export function getRoutes(request: { body: { data: number; }; }, response: { json: (arg0: Route[]) => void; }, next) {
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
  export function getGpx(request: { body: { data: number; }; }, response: { json: (arg0: string) => void; }, next) {
    const routeId : number = request.body.data;
    const query = `SELECT route FROM routes where id=${routeId}`;
    dbconnection.query(query,function (error: { code: any; }, results: string[])
    {
      if (error != null) {
        next(error);
        return;
      }
      if (results.length == 0) {
         // Sending 404 when not found something is a good practice
         //   results.status(404).send('Route not found');
      }
      response.json(results[0]);
    });
  }