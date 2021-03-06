var express = require('express');
var app = express();
var fs = require("fs");
var parser = require("body-parser");
var path=require('path');


app.use(express.static(path.resolve('./')));

app.use(parser.json());
app.use(parser.urlencoded({extended:true}));

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017');

var host = "localhost:8081/"

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

app.get('/', function(req, res){
   res.setHeader('Content-Type', 'application/json');
   response = {};
   response["@context"] = "http://schema.org"
   response["@type"] = "WebAPI"
   response["documentation"] = {};
   response["documentation"]["@type"] = "CreativeWork";
   response["documentation"]["hasPart"] = new Array();

   hotel = {};
   hotel["@type"] = "CreativeWork";
   hotel["name"] = "hotel";
   hotel["potentialAction"] = new Array();

   postHotel = {};
   postHotel["@type"] = "CreateAction";
   postHotel["target"] = host + "hotel";
   postHotel["result"] = new Array();
   postHotel["@type"] = "Hotel";
   postHotel["name-input"].push("required");
   postHotel["rooms-input"].push("optional");
   postHotel["stars-input"].push("optional");
   postHotel["location-input"].push("required");
   postHotel["rating-input"].push("required");

   getHotel = {};
   getHotel["@type"] = "SearchAction";
   getHotel["target"] = host + "hotels/{hotelId}"
   getHotel["hotel-input"] = new Array("required hotelId");

   getHotels = {};
   getHotels["@type"] = "SearchAction";
   getHotels["target"] = host + "hotels";

   updateHotel = {};
   updateHotel["@type"] = "UpdateAction";
   updateHotel["target"] = host + "hotels/{hotelId}";
   updateHotel["url-input"] = new Array();
   updateHotel["hotelId-input"].push("required");
   updateHotel["Result"] = new Array();
   updateResult = {};
   updateResult["@type"] = ["Hotel"];
   updateResult["rooms-input"] = ["required"];
   updateResult["stars-input"] = ["required"];
   updateResult["rating-input"] = ["required"];
   updateHotel["Result"].push(updateResult);

   deleteHotel = {};
   deleteHotel["@type"] = "DeleteAction";
   deleteHotel["target"] = host + "hotels/{hotelId}";
   deleteHotel["url-input"] = new Array();
   deleteHotel["hotelId-input"].push("required");

   deleteHotels = {};
   deleteHotels["@type"] = "DeleteAction";
   deleteHotels["target"] = host + "hotels";

   hotel["potentialAction"].push(postHotel);
   hotel["potentialAction"].push(getHotel);
   hotel["potentialAction"].push(getHotels);
   hotel["potentialAction"].push(updateHotel);
   hotel["potentialAction"].push(deleteHotel);
   hotel["potentialAction"].push(deleteHotels);

   user = {};
   user["@type"] = "CreativeWork";
   user["name"] = "user";
   user["potentialAction"] = new Array();

   postUser = {};
   postUser["@type"] = "CreateAction";
   postUser["target"] = host + "users";
   postUser["result"] = new Array();
   postResult = {};
   postResult["@type"] = "User";
   postResult["firsName-input"]= "required";
   postResult["lastName-input"]="required";
   postResult["email-input"]="required";
   postResult["passsword-input"]="required";
   postUser["result"].push(postResult);

   deleteUsers = {};
   deleteUsers["@type"] = "DeleteAction";
   deleteUsers["target"] = host + "users";

   user["potentialAction"].push(postUser);
   user["potentialAction"].push(deleteUsers);

   city = {};
   city["@type"] = "CreativeWork";
   city["name"] = "City";
   city["potentialAction"] = new Array();

   searchCity = {};
   searchCity["@type"] = "SearchAction";
   searchCity["target"] = host + "city/{cityName}";
   searchCity["Result"] = new Array();
   resultCity = {};
   resultCity["@type"] = ["Hotel"];
   resultCity["city-input"] = "required";
   searchCity["Result"].push(resultCity);

   city["potentialAction"].push(searchCity);

   country = {};
   country["@type"] = "CreativeWork";
   country["name"] = "Country";
   country["potentialAction"] = new Array();

   searchCountry = {};
   searchCountry["@type"] = "SearchAction";
   searchCountry["target"] = host + "country/{countryName}";
   searchCountry["Result"] = new Array();
   countryResult = {};
   countryResult["@type"] = "Hotel";
   countryResult["country-input"] = "required";
   searchCountry["Result"].push("countryResult");

   country["potentialAction"].push(searchCountry);

   review = {};
   review["@type"] = "CreativeWork";
   review["name"] = "Review";
   review["potentialAction"] = new Array();

   createReview = {};
   createReview["@type"] = "CreateAction";
   createReview["target"] = host + "review?hotel={hotelId}&msg={msgString}&user={creatorId}&key={keyString}";
   createReview["Result"] = new Array();
   reviewResult = {};
   reviewResult["@type"] = "Review";
   reviewResult["hotelId-input"]="required";
   reviewResult["message-input"]="required";
   reviewResult["userId-input"]="required";
   reviewResult["key-input"]="required";
   createReview["Result"].push(reviewResult);

   searchReview = {};
   searchReview["@type"] = "SearchAction";
   searchReview["target"] = host + "reviews?hotel={hotelId}";
   searchReview["Result"] = new Array();
   searchRevRes = {};
   searchRevRes["@type"] = "Review";
   searchRevRes["hotelId-input"]= "required";
   searchReview["Result"].push(searchRevRes);

   review["potentialAction"].push(createReview);
   review["potentialAction"].push(searchReview);

   order = {};
   order["@type"] = "CreativeWork";
   order["name"] = "Order";
   order["potentialAction"] = new Array();

   createOrder = {};
   createOrder["@type"] = "CreateAction";
   createOrder["target"] = host + "order";
   createOrder["Result"] = new Array();
   createOrdRes = {};
   createOrdRes["@type"] = "Order"
   createOrdRes["hotelId-input"].push("required");
   createOrdRes["roomNumber-input"].push("required");
   createOrder["Result"].push(createOrdRes);

   searchOrders = {};
   searchOrders["@type"] = "SearchAction";
   searchOrders["target"] = host + "orders";

   searchOrder = {};
   searchOrder["@type"] = "SearchAction";
   searchOrder["target"] = host + "orders/{hotelId}";
   searchOrder["Result"] = new Array();
   searchOrdRes = {};
   searchOrdRes["@type"] = "Order";
   searchOrdRes["hotelId-input"] = "required";
   searchOrder["Result"].push(searchOrdRes);

   deleteOrders = {};
   deleteOrders["@type"] = "DeleteAction";
   deleteOrders["target"] = host + "order";

   order["potentialAction"].push(createOrder);
   order["potentialAction"].push(searchOrders);
   order["potentialAction"].push(searchOrder);
   order["potentialAction"].push(deleteOrders);

   offer = {};
   offer["@type"] = "CreativeWork";
   offer["name"] = "Offer";
   offer["potentialAction"] = new Array();

   searchOffers = {};
   searchOffers["@type"] = "SearchAction";
   searchOffers["target"] = host + "offers";

   searchOffer = {};
   searchOffer["@type"] = "SearchAction";
   searchOffer["target"] = host + "offers/{hotelId}";
   searchOffer["Result"] = new Array();
   searchOfferRes = {};
   searchOfferRes["@type"] = "Offer";
   searchOfferRes["hotelId-input"] = "required"; 
   searchOffer["Result"].push(searchOfferRes);

   postOffer = {};
   postOffer["@type"] = "CreateAction";
   postOffer["target"] = host + "offer";
   postOffer["Result"] = new Array();
   postOffRes = {};
   postOffRes["@type"] = "Offer";
   postOffRes["hotelID-input"] = "required";
   postOffRes["roomNumber-input"] = "required";
   postOffRes["startDate-input"] = "required ";
   postOffRes["endDate-input"] = "required ";
   postOffRes["discount-input"] = "optional";
   postOffer["Result"].push(postOffRes);

   offer["potentialAction"].push(searchOffer);
   offer["potentialAction"].push(searchOffers);
   offer["potentialAction"].push(postOffer);

   stars = {};
   stars["@type"] = "CreativeWork";
   stars["name"] = "Stars";
   stars["potentialAction"] = new Array();

   searchStars = {};
   searchStars["@type"] = "SearchAction";
   searchStars["target"] = host + "stars/{stars}";
   searchStars["Result"] = new Array();
   searchStarRes = {};
   searchStarRes["@type"] = "Hotel";
   searchStarRes["starRating-input"] = "required";
   searchStars["Result"].push(searchStarRes);

   stars["potentialAction"].push(searchStars);

   rating = {};
   rating["@type"] = "CreativeWork";
   rating["name"] = "Rating";
   rating["potentialAction"] = new Array();

   searchRating = {};
   searchRating["@type"] = "SearchAction";
   searchRating["target"] = host + "rating/{rating}";
   searchRating["Result"] = new Array();
   searchRatRes = {};
   searchRatRes["@type"] = "Hotel";
   searchRatRes["rating-input"] = "required";
   searchRating["Result"].push(searchRatRes);

   rating["potentialAction"].push(searchRating);

   reviews = {};
   reviews["@type"] = "CreativeWork";
   reviews["name"] = "Reviews";
   reviews["potentialAction"] = new Array();

   searchReview = {};
   searchReview["@type"] = "SearchAction";
   searchReview["target"] = host + "reviews/{hotelId}";
   searchReview["Result"] = new Array();
   searchReviewRes = {};
   searchReviewRes["@type"] = "Review";
   searchReviewRes["hotelId-input"] = "required ";
   searchReviewRes["roomNumber-input"] = "required";
   searchReviewRes["startDate-input"] = "required";
   searchReviewRes["endDate-input"] = "required";
   searchReviewRes["discount-input"] = "required";
   searchReview["Result"].push(searchReviewRes);

   deleteReviews = {};
   deleteReviews["@type"] = "DeleteAction";
   deleteReviews["target"] = host + "reviews";

   postReview = {};
   postReview["@type"] = "CreateAction";
   postReview["target"] = host + "reviews";
   postReview["Result"] = new Array();
   postReviewRes = {};
   postReviewRes["@type"] = "Review";
   postReviewRes["hotelId-input"]= "required ";
   postReviewRes["userMail-input"]= "required " ;
   postReviewRes["review-input"]= "required" ;
   postReview["Result"].push(postReviewRes);

   reviews["potentialAction"].push(searchReview);
   reviews["potentialAction"].push(deleteReviews);
   reviews["potentialAction"].push(postReview);

   response["documentation"]["hasPart"].push(hotel);
   response["documentation"]["hasPart"].push(user);
   response["documentation"]["hasPart"].push(city);
   response["documentation"]["hasPart"].push(country);
   response["documentation"]["hasPart"].push(review);
   response["documentation"]["hasPart"].push(order);
   response["documentation"]["hasPart"].push(offer);
   response["documentation"]["hasPart"].push(stars);
   response["documentation"]["hasPart"].push(rating);
   response["documentation"]["hasPart"].push(reviews);

   res.end(JSON.stringify(response));
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
                  hotelDictionary["starRating"] = hotels[i].stars;
                  hotelDictionary["ratings"] = hotels[i].ratings;
                  locationObject = {};
                  locationObject["object"] = new Array();
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
                  getHotel["result"] = new Array();
                  result = {};
                  result["@type"] = "Hotel";
                  result["name-output"] = "required";
                  result["city-output"] = "required";
                  locationObject.push(location);
                  hotelDictionary["potentialAction"].push(getHotel);
                  hotelDictionary["potentialAction"].push(locationObject);
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
      } hotelDictionary = {};
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
                  getHotel["result"] = new Array();
                  result = {};
                  result["@type"] = ["Hotel"];
                  result["name-ouput"] = "required";
                  result["_id-output"] = "required";
                  result["country-output"] = "optional";
                  result["city-output"] = "optional";
                  hotelDictionary["potentialAction"].push(getHotel);
                  hotelDictionary["potentialAction"].push(location);
                  hotelResult.push(hotelDictionary);
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
                  location = {};
                  location["@type"] = "SearchAction";
                  location["City"] = hotels[i].location["City"];
                  location["_id"] = hotels[i].location["_id"];
                  location["name"] = "http://localhost:8081/city/"+hotels[i].location["cityName"];
                  location["latitude"] =  hotels[i].location["latitude"];
                  location["longitude"] =  hotels[i].location["longitude"];
                  location["Country"] =  hotels[i].location["country"];
                  hotelDictionary["potentialAction"]= new Array();
                  bookRoom = new Array();
                  for(var j = 0; j < hotels[i].rooms.length; j++){
                     room = {};
                     room["@type"] = "OrderAction";
                     room["roomNumber"] = hotels[i].rooms[j]["number"];
                     room["booked"] = hotels[i].rooms[j]["booked"];
                     room["price"] = hotels[i].rooms[j]["price"];
                     room["target"] = "http://localhost:8081/orders";
                     bookRoom.push(room);
               };
                  hotelDictionary["potentialAction"].push(location);
                  hotelDictionary["potentialAction"].push(bookRoom);
                  hotelResult.push(hotelDictionary);

                  };
            res.json(hotelResult);
      
   });
})


app.post('/hotels/:id', function (req, res) {
   Hotel.findOne({_id : req.params.id}).exec((err, hotel) => {
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

app.put('/hotels/:id', function (req, res) {
   Hotel.findOne({_id : req.params.id}).exec((err, hotel) => {
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

app.get('/hotels/:id/:number', function(req, res) {
   Hotel.findOne({ _id: req.params.id }, function(err, hotel) {
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

app.delete('/hotels/:id/:number', function(req, res) {
   Hotel.findOne({ _id: req.params.id }, function(err, hotel) {
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

app.put('/hotels/:id/:number', function(req, res) {
   Hotel.findOne({ _id: req.params.id }, function(err, hotel) {
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
      Hotel.find({stars : req.params.stars}).exec((err, hotels) => {
            if(err) return next(err);
            hotelResult = new Array();
            for(var i = 0; i<hotels.length; i++){
                  
                  starDictionary = {};
                  starDictionary["@context"] = "http://schema.org";
                  starDictionary["@type"] = "Hotel";
                  starDictionary["name"] = hotels[i].name;
                  starDictionary["starRating"] = hotels[i].stars;
                  location = {};
                  location["@type"] = "SearchAction";
                  location["City"] = hotels[i].location["City"];
                  location["_id"] = hotels[i].location["_id"];
                  location["name"] = "http://localhost:8081/city/"+hotels[i].location["cityName"];
                  location["latitude"] =  hotels[i].location["latitude"];
                  location["longitude"] =  hotels[i].location["longitude"];
                  location["Country"] =  hotels[i].location["country"];
                  starDictionary["potentialAction"]= new Array();
                  bookRoom = {};
                  bookRoom["@type"] = "OrderAction";
                  bookRoom["rooms"] = new Array();
                  for(var j = 0; j < hotels[i].rooms.length; j++){
                     var room = hotels[i].rooms[j];
                     bookRoom["rooms"].push(room);
               };
                  starDictionary["potentialAction"].push(location);
                  starDictionary["potentialAction"].push(bookRoom);
                  hotelResult.push(starDictionary);

                  };
            res.json(hotelResult);
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
               countryDictionary = {};
               countryDictionary["@context"] = "http://schema.org";
               countryDictionary["@type"] = "Hotel";
               countryDictionary["name"] = hotels[i].name;
               location = {};
               location["@type"] = "SearchAction";
               location["City"] = hotels[i].location["City"];
               location["_id"] = hotels[i].location["_id"];
               location["name"] = "http://localhost:8081/city/"+hotels[i].location["cityName"];
               location["latitude"] =  hotels[i].location["latitude"];
               location["longitude"] =  hotels[i].location["longitude"];
               location["Country"] =  hotels[i].location["country"];
               countryDictionary["potentialAction"]= new Array();
               getHotel = {};
               getHotel["@type"] = "SearchAction";
               getHotel["name"] = hotels[i].name;
               getHotel["query"] = "http://localhost:8081/hotels/"+hotels[i]["_id"];
               countryDictionary["potentialAction"].push(getHotel);
               countryDictionary["potentialAction"].push(location);
               matchedHotels.push(countryDictionary);
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
               cityDictionary = {};
               cityDictionary["@context"] = "http://schema.org";
               cityDictionary["@type"] = "Hotel";
               cityDictionary["name"] = hotels[i].name;
               location = {};
               location["@type"] = "SearchAction";
               location["City"] = hotels[i].location["City"];
               location["_id"] = hotels[i].location["_id"];
               location["name"] = "http://localhost:8081/city/"+hotels[i].location["cityName"];
               location["latitude"] =  hotels[i].location["latitude"];
               location["longitude"] =  hotels[i].location["longitude"];
               location["Country"] =  hotels[i].location["country"];
               cityDictionary["potentialAction"]= new Array();
               getHotel = {};
               getHotel["@type"] = "SearchAction";
               getHotel["name"] = hotels[i].name;
               getHotel["query"] = "http://localhost:8081/hotels/"+hotels[i]["_id"];
               cityDictionary["potentialAction"].push(getHotel);
               cityDictionary["potentialAction"].push(location);
               matchedHotels.push(cityDictionary);
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
