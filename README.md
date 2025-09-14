# RideHub server

Server-side code to run Truro Cycling Club's RideHub facility.
See [Ridehub2](https://github.com/quilkin/ridehub2) for the client code.

# Development

Developed using Visual Studio Code, Node.js, express and mysql
To compile Typescript to Javascript: tsc
To run on development machine: node dist\app.js  

# Database

MySql used for data storage. The same database is used for both RideHub and the [Membership](https://github.com/quilkin/membership-server) facility. 
SQL database creation code can be found in file 'mysql.sql'