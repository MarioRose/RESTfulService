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

var orderSchema = mongoose.Schema({
   hotel : hotelSchema,
   room : roomSchema
});


var Hotel = mongoose.model('Hotel', hotelSchema);
var Room = mongoose.model('Room', roomSchema);
var Order = mongoose.model('Order',orderSchema);


var hilton = new Hotel({ name: 'Hilton'});
var motel1 = new Hotel({ name: 'Motel1'});
var room1 = new Room({number: 1, booked: false, price : 29.5});
var room2 = new Room({number: 2, booked: true, price : 30.0});
var hiltonRooms = [room1, room2];
hilton.rooms = hiltonRooms;
save(hilton);
save(motel1);
console.log(hilton.name);

function save(obj) {
   obj.save(function (err){
      if(err) return console.error(err);
      console.log(obj.name + ' saved.');
   });
}

app.get('/hotels', function (req, res) {
    Hotel.find({}).exec((err, hotels) => {
        if (err) return next(err);
        res.json(hotels);
      });  
})

app.delete('/hotels',function (req,res) {
   Hotel.remove({}).exec(); 
   res.end("All hotels were successfully removed.")
})

app.post('/hotels', function(req,res){
   var newHotel = new Hotel({name: req.body.name});
   if(req.body.rooms){
      var rooms = new Array();
      for(var room in req.body.rooms){
         var roomNumber = req.body.rooms[room].number;
         var roomPrice = req.body.rooms[room].price;
         var roomBooked = req.body.rooms[room].booked;
         rooms.push(new Room({number: roomNumber, booked: roomBooked, price: roomPrice}));
      }
      newHotel.rooms = rooms;
   }
   save(newHotel);
   res.end("Hotel " + req.body.name + " created.");
})

app.delete('/hotels/:name', function (req, res) {
   Hotel.remove({name : req.params.name}).exec();
   console.log('Hotel was deleted , name '+req.params.name);
   res.end("Hotel " + req.params.name + " was successfully deleted.");
})

app.get('/hotels/:name', function (req, res) {
   Hotel.find({name : req.params.name}).exec((err, hotel) => {
      if(err) return next(err);
      res.json(hotel);
   });
})

app.get('/hotels/:name/:number', function(req, res) {
   Hotel.findOne({ name: req.params.name }, function(err, hotel) {
      if (err) {
         console.log("invalid name");
      }
      if (hotel) {
         for(var i = 0; i < hotel.rooms.length; i++){
            if(hotel.rooms[i].number == req.params.number){
               res.json(hotel.rooms[i]);
            }
         }
      } 
   });
});

app.get('/orders/',function(req,res){
   Order.find({}).exec((err, orders) => {
         if (err) return next(err);
         res.json(orders);
      }); 
});

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Hotel app listening at http://%s:%s", host, port)
})
