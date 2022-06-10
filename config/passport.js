const LocalStrategy   = require('passport-local').Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcrypt-nodejs');
const dbconfig = require('./database');
const con = mysql.createConnection(dbconfig.connection);
con.query('USE ' + dbconfig.database);
module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        con.query("SELECT * FROM users WHERE id = ? ",[id], function(err, rows){
            if (err) return done(err);
    if (rows[0]) {
      return done(null, rows[0]);
    } else {
      return done(null, true)
    }
        });
    });
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true 
        },
        function(req, email, password, done) {
            con.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); 
                }

                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                return done(null, rows[0]);
            });
            
        })
    );
    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true
        },
        function(req, email, password, done) {
            con.query("SELECT * FROM users WHERE email = ?",[email], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('userMessage', 'Email already has an account'));
                } else {
                    var newUserMysql = {
                        email: email,
                        password: bcrypt.hashSync(password, null, null),  
                        isAdmin: req.body.isAdmin
                    };
                    var insertQuery = "INSERT INTO users ( email, password, isAdmin ) values (?,?,?)";
                    con.query(insertQuery,[newUserMysql.email, newUserMysql.password, newUserMysql.isAdmin],function(err, row) {
                        if(!err){
                        newUserMysql.id = row.insertId;
                        return done(null, false, req.flash('userMessage', 'Successfully Added User'));
                        }
                        else{
                            console.log(err, rows.insertId, req.flash('userMessage', "Adding User Failed"));
                        }
                    });
                }
            })
        }
        )
    );
    
};
