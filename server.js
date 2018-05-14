var express = require('express');
var app = express();
var fs = require("fs");
var parser = require("body-parser");

app.use(parser.json());
app.use(parser.urlencoded({extended:true}));

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
   console.log("connected to mongodb");
});

var roomSchema = mongoose.Schema({
   number : Number,
   booked : Boolean,
   price : Number
});

var hotelSchema = mongoose.Schema({
   name: String,
   rooms: [roomSchema]
});

var Hotel = mongoose.model('Hotel', hotelSchema);
var Room = mongoose.model('Room', roomSchema);
var hilton = new Hotel({ name: 'Hilton'});
var motel1 = new Hotel({ name: 'Motel1'});
var room1 = new Room({number: 1, booked: false, price : 29.5});
var room2 = new Room({number: 2, booked: true, price : 30.0});
var hiltonRooms = [room1, room2];
hilton.rooms = hiltonRooms;
save(hilton);
save(motel1);

function save(obj) {
   obj.save(function (err){
      if(err) return console.error(err);
      console.log(obj.name + ' saved.');
   })
}



app.get('/hotels', function (req, res) {
    Hotel.find({}).exec((err, questions) => {
        if (err) return next(err);
        res.json(questions);
      });  
})


app.post('/hotels', function(req,res){
    var newHotel = new Hotel({name: req.body.name})
    console.log(req.body);
    save(newHotel);
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
