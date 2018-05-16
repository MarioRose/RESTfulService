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
   price : Number,
   
});

var locationSchema = mongoose.Schema({
      locationName : String,
      latitude : Number,
      longitude : Number,
      Country : String
});

var hotelSchema = mongoose.Schema({
   hotelName: String,
   rooms: [roomSchema],
   stars : Number,
   location : locationSchema
});

var orderSchema = mongoose.Schema({
   hotelName : String,
   roomNumber : Number
});

var userSchema = mongoose.Schema({
      firstName : String,
      lastName : String,
      email : String,
      password : String
});

var websiteSchema = mongoose.Schema({
      hotel : hotelSchema,
      url : String
});

var reviewSchema = mongoose.Schema({
      hotel : hotelSchema,
      user : userSchema,
      review : String
});

var offerSchema = mongoose.Schema({
      hotel : hotelSchema,
      room : roomSchema,
      startDate : String,
      endDate : String,
});

var bookmarkSchema = mongoose.Schema({
      user : userSchema,
      hotel : hotelSchema,
});

var reservationSchema = mongoose.Schema({
      hotel : hotelSchema,
      room : roomSchema,
      startDate : String,
      endDate : String
});

var Hotel = mongoose.model('Hotel', hotelSchema);
var Room = mongoose.model('Room', roomSchema);
var Order = mongoose.model('Order',orderSchema);
var Location = mongoose.model('Location',locationSchema);
var User = mongoose.model('User',userSchema);
var Website = mongoose.model('Website',websiteSchema);
var Review = mongoose.model('Review', reviewSchema);
var Offer = mongoose.model('Offer',offerSchema);
var Bookmark = mongoose.model('Bookmark',bookmarkSchema);


var hilton = new Hotel({ name: 'Hilton',stars:5});
var motel1 = new Hotel({ name: 'Motel1',stars:3});
var room1 = new Room({number: 1, booked: false, price : 29.5});
var room2 = new Room({number: 2, booked: true, price : 30.0,});
var hiltonRooms = [room1, room2];
hilton.rooms = hiltonRooms;
save(hilton);
save(motel1);

function save(obj) {
   obj.save(function (err){
      if(err) return console.error(err);
      console.log('Object saved.');
   });
}

function remove(obj){
      obj.remove(function(err){
            if(err) return console.error(err);
            console.log('Object removed');
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
   var newHotel = new Hotel({hotelName: req.body.name, stars : req.body.stars});
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

app.get('/stars/:stars',function(req,res){
      Hotel.find({stars : req.params.stars}).exec((err, hotel) => {
            if(err) return next(err);
            res.json(hotel);
       });
})

app.put('/stars/:name',function(req,res){
      Hotel.find({name : req.params.name}).exec((err, hotel) => {
            if(err) return next(err);
            hotel.stars = req.body.stars;
            res.json(hotel);
       });
})

app.post('/users',function(req,res){      
      var newUser = new User({firstName : req.body.firstName, lastName : req.body.lastName, email : req.body.email, password : req.body.password });

      if(newUser == null || newUser.password == null){
            res.status(401).send('User creation failed! Unauthorized Error');
      }
      if (newUser.firstName == null || newUser.lastName == null || newUser.email == null){
            res.status(400).send("One of the paramters is missing! Bad request");
      }
      res.json(newUser);
      save(newUser);
})

app.delete('/users',function(req,res){
      
      User.find({email : req.body.email}).exec((err,user)=>{
            if (user.password == req.body.password){
                  User.remove({email : req.body.email}).exec();
            }
           else{
                 res.status(401).send("Unauthorized to delete user");
           }

      })
     
})


var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Hotel app listening at http://%s:%s", host, port)
})
