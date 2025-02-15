[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MVUO33FO)
# Term Project

Add design docs in *images/*

## Instructions to setup and run project
Clearly explain the steps required to install and configure necessary packages,
for both the server and the client, and the sequence of steps required to get
your application running.

To install all necessary packages:
- Install the project directory and CD into the server folder, run "npm install".
- Then CD into the client folder and run "npm install".

To get the website running:
Open a command prompt in admin mode and run "mongod", then run "use phreddit" and then "db.dropDatabase();" to make sure the database is clean.
Then open another command prompt and run "mongosh".
Open another command prompt and CD into the server folder in the project. Start the server by running "node server/server.js"
Open another command prompt and initialize the database by CDing into the server folder again and running:
"node init.js <mongoDB_URL> <firstName> <lastName> <email> <displayName> <password>"
Open one last command prompt and CD into the folder of the project again but this time CD into the client folder and start the client with "npm start"
The website should now open automatically and you can browse it, creating new data as necessary.

To run the jest tests.
Clear the mongod database by running "db.dropDatabase();" on the terminal. Then run the first test by cding into the server folder and running "npm test mongoDB.test.js". Just in case, clear the database again then run the second test by cding into the server folder and running "npm test express.test.js", you may need to turn off the server on the other command prompt for this to work. Finally to run the last test, clear the database again but cd into the client folder this time and run "npm test react.test.js"

## Team Member 1 Contribution
Worked solo.


