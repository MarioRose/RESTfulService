const app = require('express').Router();
const hotels = require('./rooms');

app.use('/hotels', hotels);

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
})

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
    Hotel.find({}).exec((err, hotels) => {
        if (err) return next(err);
        res.json(hotels);
      });  
})

app.delete('/',function (req,res) {
    Hotel.remove({}).exec(); 
    console.log('All hotels are removed');
})

app.post('/', function(req,res){
    var newHotel = new Hotel({name: req.body.name})
    console.log(req.body);
    save(newHotel);
})

app.delete('/:name', function (req, res) {
    Hotel.remove({name : req.params.name}).exec();
    console.log('Hotel was deleted , name '+req.params.name);
 })

 app.get('/:name', function (req, res) {
    Hotel.find({name : req.params.name}).exec((err, hotel) => {
       if(err) return next(err);
       res.json(hotel);
    });
 })

module.exports = app;