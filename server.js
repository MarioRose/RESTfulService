var express = require('express');
var app = express();
var fs = require("fs");
var parser = require("body-parser");
var path=require('path');
var jsonld = require("jsonld");


app.use(express.static(path.resolve('./')));

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
      cityName : String,
      latitude : Number,
      longitude : Number,
      country : String
});

var hotelSchema = mongoose.Schema({
   name: String,
   rooms: [roomSchema],
   stars : Number,
   location : locationSchema,
   rating : Number
});

var orderSchema = mongoose.Schema({
   hotelId : String,
   hotelName : String,
   roomNumber : Number
});

var userSchema = mongoose.Schema({
      firstName : String,
      lastName : String,
      email : String,
      password : String
});

var reviewSchema = mongoose.Schema({
      hotelId : String,
      hotelName : String,
      userMail : String,
      review : String
});

var offerSchema = mongoose.Schema({
      hotelId : String,
      hotelName : String,
      roomNumber : Number,
      startDate : String,
      endDate : String,
      discount : String
});

var Hotel = mongoose.model('Hotel', hotelSchema);
var Room = mongoose.model('Room', roomSchema);
var Order = mongoose.model('Order',orderSchema);
var Location = mongoose.model('Location',locationSchema);
var User = mongoose.model('User',userSchema);
var Review = mongoose.model('Review', reviewSchema);
var Offer = mongoose.model('Offer',offerSchema);

function save(obj) {
   obj.save(function (err){
      if(err) return console.error(err);
      console.log('Object saved.');
   });
}

app.get('/' , function(req,res){
   var reader = new FileReader();
  reader.onload = function(e) {
    var contents = e.target.result;
    // Display file content
    displayContents(contents);
  };
   res.end('index.html')
})

app.get('/hotels-api', function(req, res){
   res.setHeader('Content-Type', 'application/json');
})

app.get('/hotels', function (req, res) {
      
      Hotel.find({}).exec((err, hotels) => {
            if (err) return next(err);
            hotelResult = new Array;
            for(var i = 0; i<hotels.length; i++){
                  
                  hotelDictionary = {};
                  hotelDictionary["@context"] = "http://schema.org";
                  hotelDictionary["@type"] = "Hotel";
                  hotelDictionary["name"] = hotels[i].name;
                  location = {};
                  location["@type"] = "SearchAction";
                  location["City"] = hotels[i].location["City"];
                  location["_id"] = hotels[i].location["_id"];
                  location["name"] = "http://localhost:8081/city/"+hotels[i].location["cityName"];
                  location["latitude"] =  hotels[i].location["latitude"];
                  location["longitude"] =  hotels[i].location["longitude"];
                  location["Country"] =  hotels[i].location["country"];
                  hotelDictionary["potentialAction"]= new Array();
                  getHotel = {};
                  getHotel["@type"] = "SearchAction";
                  getHotel["name"] = hotels[i].name;
                  getHotel["query"] = "http://localhost:8081/hotels/"+hotels[i]["_id"];
                  hotelDictionary["potentialAction"].push(getHotel);
                  hotelDictionary["potentialAction"].push(location);
                  hotelResult.push(hotelDictionary);

                  };
            res.json(hotelResult);
            });  
})


app.delete('/hotels',function (req,res) {
   Hotel.remove({}).exec(); 
   res.end("All hotels were successfully removed.")
})

app.post('/hotels', function(req,res){
   if(!req.body.hasOwnProperty("hotels")){
       var newHotel = new Hotel({name: req.body.name, stars : req.body.stars, rating: req.body.rating});
      if(req.body.hasOwnProperty('rooms')){
         var rooms = new Array();
         for(var j=0; j<req.body.rooms.length; j++){
            var roomNumber = req.body.rooms[j].number;
            var roomPrice = req.body.rooms[j].price;
            var roomBooked = req.body.rooms[j].booked;
            rooms.push(new Room({number: roomNumber, booked: roomBooked, price: roomPrice}));
         }
         newHotel.rooms = rooms;
      }
         var location = new Location({cityName: req.body.cityName, 
            latitude: req.body.latitude, longitude: req.body.longitude, 
            country: req.body.countryName});
         newHotel.location = location;
         console.log(newHotel.name);
      save(newHotel);
   }else {
   for (var i = 0; i < req.body.hotels.length; i++){
      var newHotel = new Hotel({name: req.body.hotels[i].name, stars : req.body.hotels[i].stars, rating: req.body.hotels[i].rating});
      if(req.body.hotels[i].hasOwnProperty('rooms')){
         var rooms = new Array();
         for(var j=0; j<req.body.hotels[i].rooms.length; j++){
            var roomNumber = req.body.hotels[i].rooms[j].number;
            var roomPrice = req.body.hotels[i].rooms[j].price;
            var roomBooked = req.body.hotels[i].rooms[j].booked;
            rooms.push(new Room({number: roomNumber, booked: roomBooked, price: roomPrice}));
         }
         newHotel.rooms = rooms;
      }
         var location = new Location({cityName: req.body.hotels[i].cityName, 
            latitude: req.body.hotels[i].latitude, longitude: req.body.hotels[i].longitude, 
            country: req.body.hotels[i].countryName});
         newHotel.location = location;
      save(newHotel);
   }}
   res.end("Hotels created.");
})

app.delete('/hotels/:id', function (req, res) {
   Hotel.remove({_id : req.params.id}).exec();
   res.end("Hotel " + req.params.name + " was successfully deleted.");
})

app.get('/hotels/:id', function (req, res) {
   Hotel.find({_id : req.params.id}).exec((err, hotels) => {
      if(err) return next(err);
      hotelResult = new Array();
            for(var i = 0; i<hotels.length; i++){
                  
                  hotelDictionary = {};
                  hotelDictionary["@context"] = "http://schema.org";
                  hotelDictionary["@type"] = "Hotel";
                  hotelDictionary["name"] = hotels[i].name;
                  hotelDictionary["starRating"] = hotels[i].stars;
                  hotelDictionary["location"] = hotels[i].location;
                  hotelDictionary["potentialAction"]= new Array();
                  bookRoom = {};
                  bookRoom["@type"] = "OrderAction";
                  bookRoom["rooms"] = new Array();
                  for(var j = 0; j < hotels[i].rooms.length; j++){
                     var room = hotels[i].rooms[j];
                     bookRoom["rooms"].push(room);
               };
                  hotelDictionary["potentialAction"].push(bookRoom);
                  hotelResult.push(hotelDictionary);

                  };
            res.json(hotelResult);
      
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

app.put('/hotels/:name', function (req, res) {
   Hotel.findOne({name : req.params.name}).exec((err, hotel) => {
      if(err) return next(err);
      if(req.body.hasOwnProperty('newRooms')){
         var rooms = new Array();
         for(var i=0; i<req.body.newRooms.length; i++){
            var roomNumber = req.body.newRooms[i].number;
            var roomPrice = req.body.newRooms[i].price;
            var roomBooked = req.body.newRooms[i].booked;
            rooms.push(new Room({number: roomNumber, booked: roomBooked, price: roomPrice}));
         }
         hotel.set({rooms : rooms})
         save(hotel);
      }
      if(req.body.hasOwnProperty('newStars')){
         hotel.set({stars : req.body.newStars});
      }
      if(req.body.hasOwnProperty('newRating')){
         hotel.set({rating : req.body.newRating});
      }
      res.end("Hotel updated.");
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
               if(req.body.hasOwnProperty('newPrice')){
                  hotel.rooms[i].set({price : req.body.newPrice});
                  save(hotel);
               }
               if(req.body.hasOwnProperty('newBooked')){
                  hotel.rooms[i].set({booked : req.body.newBooked})
                  save(hotel);
               }
               res.end("Room updated.");
            }
         }
      } 
   });
})

app.get('/orders',function(req,res){
   Order.find({}).exec((err, orders) => {
         if (err) return next(err);
         res.json(orders);
   }); 
})

app.post('/orders', function(req, res){
   var hotelId = req.body.hotelId;
   var roomNumber = req.body.roomNumber;
   Hotel.findOne({ _id: hotelId}, function(err, hotel) {
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

app.delete('/orders', function(req, res){
   Order.remove({}).exec(); 
   res.end("All orders were successfully removed.")
})

app.get('/orders/:id', function(req, res){
   Order.find({_id : req.params.id}).exec((err, orders) => {
            if(err) return next(err);
            res.json(orders);
   });
})

app.get('/stars/:stars',function(req,res){
      Hotel.find({stars : req.params.stars}).exec((err, hotel) => {
            if(err) return next(err);
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

      });
     
})

app.get('/offers',function(req,res){
      Offer.find({}).exec((err, offers) => {
            if (err) return next(err);
            res.json(offers);
      }); 
   })
   
   app.post('/offers', function(req,res){
      var newOffer = new Offer({hotelName: req.body.hotelName, roomNumber: req.body.roomNumber, startDate: req.body.startDate, endDate: req.body.endDate, discount: req.body.discount});
      save(newOffer);
      res.end("New offer created.");
   })
   
   app.get('/offers/:name', function(req,res){
      Offer.find({hotelName : req.params.name}).exec((err, offers) => {
         if(err) return next(err);
         res.json(offers);
      });
   })

app.get('/reviews/:id',function(req,res){
     Review.find({hotelName : req.params.id}).exec((err,review) =>{
            if(err) return next(err);
            res.json(review);
     });
})

app.delete('/reviews',function(req,res){
      Review.remove({}).exec();
})

app.post('/reviews',function(req,res){

      User.find({email : req.body.userMail}).exec((err,user) =>{

            if (user == null){
                  res.status(401).send("Unauthorized to create review");
            }

            var newReview = new Review({hotelName : req.body.hotelName, userMail : req.body.userMail, review : req.body.review});
            res.json(newReview);
            save(newReview);

      });
})

app.get('/rating/:rating', function(req,res){
      Hotel.find({rating : req.params.rating}).exec((err, hotels) => {
            if(err) return next(err);
            res.json(hotels);
       });
})

app.get('/country/:country', function(req, res){
   Hotel.find({}).exec((err, hotels) => {
      if(err) return next(err);
      var matchedHotels = new Array();
      for(var i = 0; i<hotels.length; i++){
         if(hotels[i].location){
            if(hotels[i].location.country == req.params.country){
               matchedHotels.push(hotels[i]);
            }
         }
      }
      res.json(matchedHotels);
   });
})

app.get('/city/:city', function(req, res){
   Hotel.find({}).exec((err, hotels) => {
      if(err) return next(err);
      var matchedHotels = new Array();
      for(var i = 0; i<hotels.length; i++){
         if(hotels[i].location){
            if(hotels[i].location.cityName == req.params.city){
               matchedHotels.push(hotels[i]);
            }
         }
      }
      res.json(matchedHotels);
   });
})


var server = app.listen(8081, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Hotel app listening at http://%s:%s", host, port)
})
