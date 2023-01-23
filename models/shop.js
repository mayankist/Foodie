var mongoose = require("mongoose");

var shopSchema = new mongoose.Schema({
	author:{
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String,
		shopName:String,
		number:Number,
		delivery:Number,
		name:String
	},
	likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
	createdAt: { type: Date, default: Date.now },
	dishName: String,
	dishPrice: String,
	image: String,
	shopCount: Number,
  	rateCount: Number,
  	totalVote: Number
});

module.exports = mongoose.model("Shop", shopSchema);