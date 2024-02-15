var erst = require("fs");
var zweit = require("pg");
var CSVleser = require("csv-reader");
zweit.defaults.ssl = true;

var URL_verbindung = "postgres://xlansmvjflnxtz:257badba089faafbe082af26a4e01317faba95fd83dadf7dcc18f773d213b663@ec2-54-246-87-132.eu-west-1.compute.amazonaws.com:5432/d8pj7ns69e43bb";

var DB_Klient= new zweit.Client(URL_verbindung);
DB_Klient.connect();
var Eingeben = erst.createReadStream("books.csv", "utf8");

Eingeben
    .pipe(CSVleser({parseNumbers: true, parseBooleans: true, trim: true}))
    .on('data', function (row) {
        console.log(row[1]);
        DB_Klient.query("Insert Into bookss (book_id, title, author, year )" + "values ($1,$2, $3,$4)", row, function (dbError, dnResponse) {
            console.log(dbError)
        })
    })
    .on('end', function (data) {
        console.log('Fertig!');
    });

