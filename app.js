require("dotenv").config();
var express 				= require("express"),
	app						= express(),
	bodyParser				= require("body-parser"),
	mongoose 				= require("mongoose"),
	passport 				= require("passport"),
	methodOverride 			= require("method-override"),
	flash					= require("connect-flash"),
	Shop 					= require("./models/shop"),
	Comment 				= require("./models/comment"),
	User					= require("./models/user"),
	LocalStrategy 			= require("passport-local"),
	passportLocalMongoose 	= require("passport-local-mongoose");

var shopRoutes 		= require("./routes/shop"),
	indexRoutes 	= require("./routes/index");

var url = process.env.DATABASEURL || "mongodb+srv://Mayank:workforme@cluster0.uq1zw.mongodb.net/Fooddie?retryWrites=true&w=majority";
// var url = process.env.DATABASEURL || "mongodb://localhost/newfoodie1";
mongoose.connect(url);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

app.locals.moment = require('moment');

app.use(require("express-session")({
	secret: "my fooddie app",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser 	= req.user;
	res.locals.error		= req.flash("error");
	res.locals.success		= req.flash("success");
	next();
});

app.use("/", indexRoutes);
app.use("/phone", shopRoutes);

const host = "0.0.0.0";
const port = process.env.PORT || 3001;
app.listen(port,host, function() {
  console.log("FooddieApp is started!" + port);
});