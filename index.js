// Import required modules and set up the Express application
console.log("Hello")

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const port = 8000;
const redis = require('redis');
require('./workers/csvWorker'); 

// const userName = process.env.USERNAME1
// const passWord = process.env.PASSWORD
const dbName = process.env.DATABASE
const secretKey = process.env.SECRETKEY1
 
// Connect to the MongoDB database
const db = require('./config/mongoose');

// Import necessary middleware and libraries
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const passport = require('./config/passport');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMware = require('./config/middleware');


// Configure Express application settings and middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'assets' directory
app.use(express.static('assets'));

// Configure Express to use EJS layouts for views
app.use(expressLayouts);
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);
app.set('view engine', 'ejs');
app.set('views', './views');

// // Create a MongoStore for session management
// const mongoStore = MongoStore.create({
//     mongoUrl: `mongodb+srv://${userName}:${passWord}@cluster0.y53e56l.mongodb.net/${dbName}?retryWrites=true&w=majority`,
//     mongooseConnection: db,
//     autoRemove: 'disabled'
// });
// Create a MongoStore for session management
const mongoStore = MongoStore.create({
  mongoUrl: `mongodb://127.0.0.1:27017/${dbName}`,
  mongooseConnection: db,
  autoRemove: 'disabled'
});

// Session management
app.use(
    session({
      name: 'csvUpload',
      secret: secretKey, // Replace with your secret key
      resave: false,
      saveUninitialized: false,
      cookie: {
          maxAge: (1000 * 60 * 100)
      },
      store: mongoStore
    })
  );
  
// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(customMware.setFlash);

// Set up routes
const routes = require('./routes');
app.use('/', routes);

// Create an HTTP server and bind Socket.IO to it
const server = http.createServer(app);
const io = socketIo(server);

// Import and initialize Socket.IO event handling
const socketController = require('./controllers/socketController');
io.on('connection', socketController.handleSocketConnection);

// Start the server and listen on the specified port
server.listen(port, function(err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }

  console.log(`Server is running on port: ${port}`);
});

// Export the app and io instances for use in other modules
module.exports = { app, io };

// Start the server and listen on the specified port
// app.listen(port, function(err) {
//     if (err) {
//         console.log(`Error in running the server: ${err}`);
//     }

//     console.log(`Server is running on port: ${port}`);
// });
