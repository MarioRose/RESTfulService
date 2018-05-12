var express = require('express');
var app = express();
var fs = require("fs");

app.get('/listHotels', function (req, res) {
	fs.readFile( __dirname + "/" + "hotels.json", 'utf8', function (err, data) {
		console.log( data );
		res.end( data );
	});
})

app.get('/:id', function (req, res) {
   fs.readFile( __dirname + "/" + "hotels.json", 'utf8', function (err, data) {
      var hotels = JSON.parse( data );
      var hotel = hotels["hotel" + req.params.id] 
      console.log( hotel );
      res.end( JSON.stringify(hotel));
   });
})

var server = app.listen(8081, function () {

var host = server.address().address
var port = server.address().port

console.log("Example app listening at http://%s:%s", host, port)

})
