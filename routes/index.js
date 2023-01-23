var express 	= require("express"),
	router 		= express.Router(),
	passport 	= require("passport"),
	User 		= require("../models/user"),
	Shop 		= require("../models/shop"),
	Comment 	= require("../models/comment");;

router.get("/",function(req, res){
	res.redirect("phone");
});

router.get("/user", function(req, res){
	res.render("user");
});

router.get("/shoppost",isLoggedIn, function(req, res){
	res.render("shoppost");
});

//handling user sign
router.post("/register", function(req, res){
	var newUser = new User({
      name: req.body.name,
      username: req.body.username,
      shopName: req.body.shopName,
      number: req.body.number,
      delivery: req.body.delivery,
      menuImage: req.body.menuImage
    });
	if(req.body.adminCode === 'secretcode123'){
		newUser.isAdmin = true;
	}
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			req.flash('error', err.message);
			return res.render('user');
		}
		passport.authenticate("local")(req, res, function(){
			req.flash('success',"Hello" + user.username);
			res.redirect("/phone");
		});
	});
});

router.get("/login", function(req, res){
	if (req.user) {
		req.flash('error', err.message);
    	return res.redirect("/phone");
  	} else {
    	res.render("user");
  	}
});

router.post("/login", passport.authenticate("local", {
	successRedirect: "/",
	failureRedirect: "/user",
	failureFlash: true		
}), function(req, res){
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("back");
});

// user profile
router.get("/user/:user_id", function(req, res) {
  	User.findById(req.params.user_id).populate("comments").exec(function(err, foundUser) {
    	if (err || !foundUser) {
    		console.log(err);
    		req.flash("error", "This user doesn't exist");
      		return res.render("back");
    	}
    	Shop.find()
      		.where("author.id")
      		.equals(foundUser._id)
      		.exec(function(err, shop) {
        		if (err) {
        			console.log(err);
        			req.flash("error", "Something went wrong");
          			res.render("back");
        		}
            	res.render("usershow", {
              		user: foundUser,
              		shop: shop
            	});
          	});
  		});
});

// edit profile
router.get("/user/:user_id/edit",isLoggedIn,function(req, res) {
    res.render("useredit", {user: req.user});
});

// update profile
router.put("/user/:user_id",isLoggedIn,function(req, res) {
    User.findByIdAndUpdate(req.params.user_id,req.body.user, function(err, user) {
      	if (err) {
      		console.log(err);
      	} else {
      		req.flash("success", "Updated your profile!");
        	res.redirect("/user/" + req.params.user_id);
      	}
    });
});

// delete user
router.delete("/user/:user_id", isLoggedIn, function(req,res) {
  	User.findByIdAndRemove(req.params.user_id, function(err) {
    	if (err) {
    		console.log(err);
    		req.flash("error", err.message);
      		res.redirect("/phone");
    	}else{
    		req.flash('error','Profile deleted');
        	res.redirect("/phone");
      	}
  	});
});

//Comments New
router.get("/user/:user_id/comments/",isLoggedIn, function(req, res){
	//find shop by id
	User.findById(req.params.id, function(err, user){
		if(err){
			console.log(err);
		}else{
			res.render("usershow", {user: user});
		}
	});
});

//Comments Create
router.post("/user/:user_id/comments/",isLoggedIn, function(req, res){
	//lookup user using id
	User.findById(req.params.user_id, function(err, user) {
       	if (err) {
         		console.log(err);
         		res.redirect("back");
       	} else {
			Comment.create(req.body.comment, function(err, comment){
				if(err){
					req.flash("error", "Something went wrong");
					console.log(err);
				}else{
					//add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
            		user.rateCount = user.comments.length;
					//save comment
					comment.save();
					user.comments.push(comment);
					user.save();
					req.flash("success", "Successfully added comment");
					res.redirect("/user/" + user._id);
				}
			});		
		}
	});
});

// Comment Destroy Route
router.delete("/user/:user_id/comments/:comment_id", function(req, res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			req.flash('error', err.message);
			res.redirect("back");
		} else{
			User.findByIdAndUpdate(
      		  req.params.id,
      		  { $pull: { comments: { $in: [req.params.comment_id] } } },
      		  function(err) {
      		    if (err) {
      		      console.log(err);
      		    }
      		  }
      		);
      		req.flash("success","Comment deleted");
			res.redirect("back");
		}
	});
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/user");
}

module.exports = router;