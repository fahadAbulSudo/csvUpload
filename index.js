// Import required modules and set up the Express application
const express = require('express');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const app = express();
const port = 8000;

const userName = process.env.USERNAME1
const passWord = process.env.PASSWORD
const dbName = process.env.DATABASE
const secretKey = process.env.SECRETKEY1

// Connect to the MongoDB database
const db = require('./config/mongoose');

// Import necessary middleware and libraries
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

// Configure Express application settings and middleware
app.use(express.urlencoded());
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

// Create a MongoStore for session management
const mongoStore = MongoStore.create({
    mongoUrl: `mongodb+srv://${userName}:${passWord}@cluster0.y53e56l.mongodb.net/${dbName}?retryWrites=true&w=majority`,
    mongooseConnection: db,
    autoRemove: 'disabled'
});

// Configure Express to use sessions and connect-flash for flash messages
app.use(session({
    name: 'issueTracker',
    secret: secretKey,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 100)
    },
    store: mongoStore
}));

app.use(flash());
app.use(customMware.setFlash);

// Set up routes by including the 'routes' module
app.use('/', require('./routes'));

// Start the server and listen on the specified port
app.listen(port, function(err) {
    if (err) {
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running on port: ${port}`);
});
