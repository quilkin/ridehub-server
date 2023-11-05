const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
var dbconnection = require('./src/dbconn')
import { Ride } from './src/classes/ride'
import { Request } from "express"

const app = express ();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let books : any[] = [];

app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
  });

  function getRidesForDate(request: Request<{ date: string}>, response: { json: (arg0: any[]) => void; }) {
    const date : number = parseInt(request.body.data);

    let sql = `SELECT * FROM rides where date > ${date-1} and date <= ${date+60} order by date asc`;
    //console.log(date + ' sql: ' + sql);
    dbconnection.query(sql,function (error: null, results: any[],fields: any)
    {
      if (error != null) {
        throw error;
      }
      //console.log(`found ${results.length} rides`)
      response.json(results);
    });
  }

  function getRoutes(request: Request<{ which: string}>, response: { json: (arg0: any[]) => void; }) {
    const which : number = parseInt(request.body.data);

    let query: string;
	  switch (which) {
	    case 1:
	        query = `SELECT * FROM routes where distance<50`;
	        break;
	    case 2:
	        query = `SELECT * FROM routes where distance>=50 and distance < 80`;
	        break;
	    case 3:
	        query = `SELECT * FROM routes where distance>=80`;
	        break;
	    case 0:
	    default:
	        query = `SELECT hasGPX,id,dest,description,distance,climbing,ownername FROM routes`;
	        break;
	  }
    //console.log(which + ' query: ' + query);
    dbconnection.query(query,function (error: null, results: any[],fields: any)
    {
      if (error != null) {
        throw error;
      }
      //console.log(`found ${results.length} routes`)
      response.json(results);
    });
  }

  app.post("/GetRidesForDate", (request: any, response: { json: (arg0: any[]) => void; }) =>
  {
    console.log('getRidesForDate '  + request.body.data);
    getRidesForDate(request,response);
  })

  app.post("/GetRoutes", (request: any, response: { json: (arg0: any[]) => void; }) =>
  {
    console.log('getRoutes '  + request.body.data);
    getRoutes(request,response);
  })

// app.get("/getRidesForDate/:date", (request: Request<{ date: string}>, response: { json: (arg0: Ride[]) => void; }) => {
//   const date : number = parseInt(request.params.date);

//   var sql = `SELECT * FROM rides where date > ${date-1} and date <= ${date+60} order by date asc`;
//   dbconnection.query(sql,date,function (error: null, results: Ride[],fields: any)
//   {
//     if (error != null) {
//       throw error;
//     }
//     console.log(`found ${results.length} rides`)
//     response.json(results);
//   });
  
// });

app.get('/book/:isbn', (req: { params: { isbn: any; }; }, res: { json: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; send: { (arg0: string): void; new(): any; }; }; }) => {
  // Reading isbn from the URL
  const isbn = req.params.isbn;

  // Searching books for the isbn
  for (let book of books) {
      if (book.isbn === isbn) {
          res.json(book);
          return;
      }
  }

  // Sending 404 when not found something is a good practice
  res.status(404).send('Book not found');
});


app.post('/book', (req: { body: any; }, res: { send: (arg0: string) => void; }) => {
    
    const book = req.body;

    // Output the book to the console for debugging
    console.log(book);
    books.push(book);

    res.send('Book is added to the database');
});