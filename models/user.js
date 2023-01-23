var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
	name: String,
	username: String,
	password: String,
	shopName: String,
	number: Number,
	delivery: Number,
	menuImage: String,
	isAdmin: {type: Boolean, default: false},
	joined: { type: Date, default: Date.now },
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Comment"
		}
	],
	rateCount: Number
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);