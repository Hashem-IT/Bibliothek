var Ausdruken  = require("express");
var part       = require("pg");
var bodyP      = require("body-parser");
var session    = require("express-session");
const pfad     = require('path');
var CON_STRING = "postgres://xlansmvjflnxtz:257badba089faafbe082af26a4e01317faba95fd83dadf7dcc18f773d213b663@ec2-54-246-87-132.eu-west-1.compute.amazonaws.com:5432/d8pj7ns69e43bb"

    if (CON_STRING == undefined) {
        console.log("Fehler: Umgebungsvariable DB_CON_STRING nicht gesetzt!");
        process.exit(1);
    }

part.defaults.ssl = true;
var dbClient = new part.Client(CON_STRING);
dbClient.connect();
var urlencodedParser = bodyP.urlencoded({
    extended: false
});

const PORT = 1991;
var app = Ausdruken();

app.use(session({
    secret: "This is a secret!",
    resave: false,
    saveUninitialized: true
}));
app.set("views", "views");
app.set("view engine", "pug");
app.get("/", function (req, res) {
    res.render("Anmeldung");
});
app.get('/Registrierung',function(req,res){
    res.sendFile(pfad.join(__dirname+'/Registrierung.html'));
});
app.get('/Registrierung',function(req,res) {
    res.sendFile('Registrierung.html');
    res.redirect("/Anmeldung");
});
app.post("/Anmeldung", urlencodedParser, function (req, res) {
    var user = req.body.username;
    var password = req.body.password;
    dbClient.query("SELECT * FROM users WHERE name=$1 AND password=$2", [user, password], function (dbError, dbResponse) {
        if (dbResponse.rows.length == 0) {
            res.render("Anmeldung", {
                Anmeldung_Fehler: "Bitte geben Sie Benutzername und Geheimzahl nochmal ein!!!  oder Registrieren Sie Erst" 
            });
        } else {
            req.session.user = user;
            res.redirect("/Suchen");
        }
    });
});
app.post("/Registrierung", urlencodedParser, function (req, res) {

    var user = req.body.usrname;
    var password = req.body.pin;
    dbClient.query("INSERT INTO users (name, password) VALUES ($1, $2)", [user, password], function (dbError, dbResponse) {
        res.redirect("/");
    });
});

app.post("/Registrieren", urlencodedParser, function (req, res) {
    var user = req.body.username;
    var password = req.body.password;
    dbClient.query("INSERT INTO users (name, password) VALUES ($1, $2)", [user, password], function (dbError, dbResponse) {
            res.redirect("/");
        });
});

app.get("/Suchen", function (req, res) {

    if (req.session.user != undefined)
        res.render("Suchen");
    else
        res.render("Fehler");
});

app.post("/Suchen", urlencodedParser, function (req, res) {
    var input = req.body.name;
    if (req.session.user != undefined) {
        dbClient.query("SELECT * FROM books WHERE title=$1 or author=$1", [input], function (dbError, dbResponse) {

            if (dbResponse.rows.length == 0) {
                res.render("Fehler", {
                        Anmeldung_Fehler: "Not found!"
                });
                } else {
                        res.render("books", {
                        books: dbResponse.rows
                                            });
                         }
        });
    } else
        res.render("Fehler");
});

app.get("/books/:id", function (req, res) {
    var id = req.params.id;
    if (req.session.user != undefined) {

        dbClient.query("select * from books where book_id =$1", [id], function (dbError, dbResponse) {
            var book_cache = dbResponse.rows[0];
            dbClient.query("select * from critces where book_isbn =$1", [id], function (dbError, dbResponse) {
                res.render("book", {
                    book: book_cache,
                    critces: dbResponse.rows
                });
            });

        });
    } else
        res.render("Fehler")
});

app.post("/books/:id", urlencodedParser, function (req, res) {
    var id     = req.params.id;
    var text   = req.body.textname;
    var rating = req.body.Ratingname;
    dbClient.query("INSERT INTO critces  (book_isbn,critxt,rating)VALUES ((select book_id from books where book_id=$1),$2,$3)", [id, text, rating], function (dbError, dbResponse) {
        console.log(dbError);
        res.render("Bewertung");
    });
});

app.get("/Ausloggen", function (req, res) {
    req.session.destroy(function (err) {
        console.log("Session Zerstoert.");
    });
    res.render("Ausloggen");
});

app.listen(PORT, function () {
    console.log(`meine Buchladen-App hoert auf Port ${PORT}`);
});
