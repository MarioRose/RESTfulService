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
   hotelName : String,
   roomNumber : Number
});


var Hotel = mongoose.model('Hotel', hotelSchema);
var Room = mongoose.model('Room', roomSchema);
var Order = mongoose.model('Order',orderSchema);


// var hilton = new Hotel({ name: 'Hilton'});
// var motel1 = new Hotel({ name: 'Motel1'});
// var room1 = new Room({number: 1, booked: false, price : 29.5});
// var room2 = new Room({number: 2, booked: true, price : 30.0});
// var hiltonRooms = [room1, room2];
// hilton.rooms = hiltonRooms;
// save(hilton);
// save(motel1);

function save(obj) {
   obj.save(function (err){
      if(err) return console.error(err);
      console.log('Object saved.');
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
   if(req.body.hasOwnProperty('rooms')){
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
   res.end("Hotel " + req.params.name + " was successfully deleted.");
})

app.get('/hotels/:name', function (req, res) {
   Hotel.find({name : req.params.name}).exec((err, hotel) => {
      if(err) return next(err);
      res.json(hotel);
   });
})

app.post('/hotels/:name', function (req, res) {
   Hotel.findOne({name : req.params.name}).exec((err, hotel) => {
      if(err) return next(err);
      for(var i=0; i<hotel.rooms.length; i++){
         if(hotel.rooms[i].number == req.body.roomNumber){
            res.end("This room already exists.");
            return;
         }
      }
      var newRooms = new Array();
      for(var i=0; i<hotel.rooms.length; i++){
         newRooms.push(hotel.rooms[i]);
      }
      var newRoom = new Room({number: req.body.roomNumber, booked: req.body.roomBooked, price: req.body.roomPrice});
      newRooms.push(newRoom);
      hotel.set({rooms: newRooms});
      save(hotel);
      res.end("New room was successfully created.");
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
})

app.delete('/hotels/:name/:number', function(req, res) {
   Hotel.findOne({ name: req.params.name }, function(err, hotel) {
      if (err) {
         console.log("invalid name");
      }
      if (hotel) {
         var newRooms = new Array();
         for(var i = 0; i < hotel.rooms.length; i++){
            if(hotel.rooms[i].number != req.params.number){
               newRooms.push(hotel.rooms[i]);
            } 
         }
         hotel.set({ rooms: newRooms});
         save(hotel);
         res.end("Room deleted");
      } 
   });
})

app.put('/hotels/:name/:number', function(req, res) {
   Hotel.findOne({ name: req.params.name }, function(err, hotel) {
      if (err) {
         console.log("invalid name");
      }
      if (hotel) {
         for(var i = 0; i < hotel.rooms.length; i++){
            if(hotel.rooms[i].number == req.params.number){
               if(req.body.hasOwnProperty('roomPrice')){
                  hotel.rooms[i].set({price : req.body.roomPrice});
                  save(hotel);
               }
               if(req.body.hasOwnProperty('roomBooked')){
                  hotel.rooms[i].set({booked : req.body.roomBooked})
                  save(hotel);
               }
               res.end("Room updated.");
            }
         }
      } 
   });
})

app.get('/orders/',function(req,res){
   Order.find({}).exec((err, orders) => {
         if (err) return next(err);
         res.json(orders);
   }); 
})

app.post('/orders/', function(req, res){
   var hotelName = req.body.hotelName;
   var roomNumber = req.body.roomNumber;
   Hotel.findOne({ name: hotelName}, function(err, hotel) {
      if (err) {
         console.log("invalid name");
      }
      if (hotel) {
         for(var i = 0; i < hotel.rooms.length; i++){
            if(hotel.rooms[i].number == roomNumber){
               if(hotel.rooms[i].booked){
                  res.end("Room is already booked.");
               } else {
                  var newOrder = new Order({hotelName: hotel.name, roomNumber: hotel.rooms[i].number});
                  save(newOrder);
                  hotel.rooms[i].set({ booked: true});
                  save(hotel);
                  res.end("Order successfully created");
               }
            }
         }
      }
   })
})

app.delete('/orders/', function(req, res){
   Order.remove({}).exec(); 
   res.end("All orders were successfully removed.")
})

var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Hotel app listening at http://%s:%s", host, port)
})
