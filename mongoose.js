
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected to mongodb");
	var Hotel = mongoose.model('Hotel', hotelSchema);
	var Room = mongoose.model('Room', roomSchema);
	var room1 = new Room({number: 1, booked: false});
	var room2 = new Room({number: 2, booked: true});
	var hiltonRooms = new Array(room1, room2);
	var hilton = new Hotel({ name: 'Hilton', rooms: hiltonRooms});
	console.log(hilton.name); // 'Silence'	
});

var hotelSchema = mongoose.Schema({
	name: String,
	rooms: [Room]
});

var roomSchema = mongoose.Schema({
	number : Number,
	booked : Boolean
});


