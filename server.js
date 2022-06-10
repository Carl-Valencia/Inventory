const express  = require('express');
const session  = require('express-session');
const cookieParser = require('cookie-parser');
const mysql = require('mysql2');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const flash    = require('connect-flash');

require('./config/passport')(passport);

const con = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password'
},{
    database: 'inventory',
    users_table: 'users'
});
con.connect((err) => {
    if (!err){
        console.log("connected to MySQL server at port 3306...");
    }
    else{
        console.log("error in port");
        throw err;
    }
});


app.use(morgan('dev')); 
app.use(cookieParser()); 
app.use(express.urlencoded({
	extended: true
}));
app.use(express.static('pages'));
app.use(express.json());

app.set('view engine', 'ejs');

app.use(session({
	secret: 'logintest',
	resave: true,
	saveUninitialized: true
 } )); 
app.use(passport.initialize());
app.use(passport.session()); 
app.use(flash()); 


// routes ======================================================================
require('./app/routes.js')(app, passport); 


app.listen(port);
console.log('Connected in ' + port);
