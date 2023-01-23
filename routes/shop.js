var express	 	= require("express");
var router 		= express.Router();
var Shop 		= require("../models/shop");
var User    = require("../models/user");

var multer    = require('multer');
var storage   = multer.diskStorage({
  destination: function(req, file, callback) {
      callback(null,'./public/uploads/shop');
    }, filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
});
var upload    = multer({storage: storage});
var cloudinary  = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'meraroom', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

router.get("/",function(req,res){
  User.find(req.params.user_id,function(err,foundUser){
    if(err){
      console.log(err);
      return res.render("back");
    }else{
	    var noMatch = '';
	    if(req.query.search){
	    	const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		
		    Shop.find({$or:[
			 	    {dishName:regex},
            {dishPrice:regex},
			 	  ]}, function(err, allShops){
			      if(err){
			   	  console.log(err);
			    } else {
			   	  if(allShops.length < 1){
			   		  noMatch = "Cannot find your query, try again!";
			   	  }else if(allShops.length > 0) {
              noMatch = allShops.length;
            }
			   	  res.render("phone",{shop:allShops, noMatch:noMatch, user:foundUser});
			    }
		    });
	    } else if (req.query.sortby){
	      if(req.query.sortby === "mostrated") {
      	  Shop.find({})
      	  	.sort({
      	    	totalVote: -1
      	  	})
      	  	.exec(function(err, allShops) {
      	    	if (err) {
      	      	console.log(err);
      	   	 	} else {
                allShops.shopCount = allShops.length;
      	      	res.render("phone", {
      	        	shop: allShops,
      	        	currentUser: req.user,
      	        	noMatch: noMatch,
                  user:foundUser
      	      	});
      	    	}
      	  	});
    	  }else if(req.query.sortby === "leastrated") {
      		Shop.find({})
        	  .sort({
          		totalVote: 1
        	  })
        	  .exec(function(err, allShops) {
          		if (err) {
          			console.log(err);
          		} else {
                allShops.shopCount = allShops.length;
          			res.render("phone", {
            			shop: allShops,
            			currentUser: req.user,
            			noMatch: noMatch,
                  user:foundUser
          			});
          		}
        	  });
    	  }else if(req.query.sortby === "rateCount") {
          Shop.find({})
            .sort({
              rateCount: -1
            })
            .exec(function(err, allShops) {
              if (err) {
                console.log(err);
              } else {
                allShops.shopCount = allShops.length;
                res.render("phone", {
                  shop: allShops,
                  currentUser: req.user,
                  noMatch: noMatch,
                  user:foundUser
                });
              }
            });
        }else if(req.query.sortby === "new"){
			    Shop.find({}).sort({createdAt:-1}).exec(function(err, allShops){
				    if(err){
				    	console.log(err);
				    } else {
              allShops.shopCount = allShops.length;
				    	res.render("phone",{shop:allShops, currentUser: req.user, noMatch:noMatch,user:foundUser});
				    }
			    });
		    }else if(req.query.sortby === "old"){
          Shop.find({}, function(err, allShops){
            if(err){
              console.log(err);
            } else {
              allShops.shopCount = allShops.length;
              res.render("phone",{shop:allShops, currentUser: req.user, noMatch:noMatch,user:foundUser});
            }
          });
        }else{
		    	Shop.find({}, function(err, allShops){
		    		if(err){
		    			console.log(err);
		    		} else {
              allShops.shopCount = allShops.length;
		    			res.render("phone",{shop:allShops, currentUser: req.user, noMatch:noMatch,user:foundUser});
		    		}
		    	});
		    }
	    } else {
		    Shop.find({})
      	  .sort({
      	  	totalVote: -1
      	  })
      	  .exec(function(err, allShops) {
      	  	if (err) {
      	    		console.log(err);
      	    	} else {
              allShops.shopCount = allShops.length;
      	    	res.render("phone", {
      	      	shop: allShops,
      	      	currentUser: req.user,
      	      	noMatch: noMatch,
                user:foundUser
      	    	});
      	  	}
      	  });
	    }
    }
  });
});

router.post("/",isLoggedIn, upload.single('image'), function(req, res){
  if (req.file === undefined) {
    Shop.create(req.body.data, function(err, newlyCreated) {
    	if(err){
      	req.flash('error', err.message);
      	console.log(err);
    	} else {
      	newlyCreated.author.id = req.user._id;
        newlyCreated.author.name = req.user.name;
      	newlyCreated.author.username = req.user.username;
        newlyCreated.author.shopName = req.user.shopName;
        newlyCreated.author.number = req.user.number;
        newlyCreated.author.delivery = req.user.delivery;
      	//save comment
      	newlyCreated.save();
      	res.redirect("/phone");
    	}
    });
  } else {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the shop object under image property
        req.body.data.image = result.secure_url;
        // add author to shop
        Shop.create(req.body.data, function(err, newlyCreated) {
          if(err){
            req.flash('error', err.message);
            console.log(err);
          } else {
            newlyCreated.author.id = req.user._id;
            newlyCreated.author.name = req.user.name;
            newlyCreated.author.username = req.user.username;
            newlyCreated.author.shopName = req.user.shopName;
            newlyCreated.author.number = req.user.number;
            newlyCreated.author.delivery = req.user.delivery;
            //save comment
            newlyCreated.save();
            res.redirect("/phone");
          }
        });
    });
  }
});

//show - shows more info about one shop
router.get("/:id", function(req, res){
	Shop.findById(req.params.id).populate("likes dislikes").exec(function(err, foundShop){
		if(err || !foundShop){
			console.log(err);
			req.flash('error', 'Sorry, the dish does not exist!');
			return res.redirect('/phone');
		}else{
		  res.render("show", {shop: foundShop});
    }
	});
});

// Shop Like Route
router.post("/:id/like",isLoggedIn, function (req, res) {
    Shop.findById(req.params.id, function (err, foundShop) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }

        // check if req.user._id exists in foundShop.likes
        var foundUserLike = foundShop.likes.some(function (like) {
            return like.equals(req.user._id);
        });
        var foundUserDislike = foundShop.dislikes.some(function (dislike) {
            return dislike.equals(req.user._id);
        });

        if (foundUserLike || foundUserDislike) {
            // user already liked, removing like
            foundShop.likes.pull(req.user._id);
        } else {
            // adding the new user like
            foundShop.likes.push(req.user);
        }
        foundShop.rateCount = foundShop.likes.length + foundShop.dislikes.length;
        foundShop.totalVote = foundShop.likes.length - foundShop.dislikes.length;
        foundShop.save(function (err) {
            if (err) {
                console.log(err);
                req.flash("error", "Something went wrong!");
                return res.redirect("back");
            }
            req.flash("success", "You Liked a dish!");
            return res.redirect("back");
        });
    });
});

// Shop Disike Route
router.post("/:id/dislike",isLoggedIn, function (req, res) {
    Shop.findById(req.params.id, function (err, foundShop) {
        if (err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            return res.redirect("back");
        }

        // check if req.user._id exists in foundShop.dislikes
        var foundUserDislike = foundShop.dislikes.some(function (dislike) {
            return dislike.equals(req.user._id);
        });
        var foundUserLike = foundShop.likes.some(function (like) {
            return like.equals(req.user._id);
        });

        if (foundUserDislike || foundUserLike) {
            // user already disliked, removing dislike
            foundShop.dislikes.pull(req.user._id);
        } else {
            // adding the new user dislike
            foundShop.dislikes.push(req.user);
        }
        foundShop.rateCount = foundShop.likes.length + foundShop.dislikes.length;
        foundShop.totalVote = foundShop.likes.length - foundShop.dislikes.length;
        foundShop.save(function (err) {
            if (err) {
                console.log(err);
                req.flash("error", "Something went wrong!");
                return res.redirect("back");
            }
            req.flash("error", "You Disliked a dish!");
            return res.redirect("back");
        });
    });
});

//Edit shop Route
router.get("/:id/edit",function(req, res){
	Shop.findById(req.params.id,req.body.shop, function(err, foundShop){
		if(err){
			console.log(err);
			res.redirect("/phone");
		}else{
			res.render("edit", {shop: foundShop});
		}
	});
});

//Update shop Route
router.put("/:id",isLoggedIn,function(req, res){
	Shop.findByIdAndUpdate(req.params.id, req.body.shop, function(err, updatedShop){
		if(err){
			console.log(err);
			req.flash("error", err.message);
			res.redirect("/phone");
		}else{
			req.flash("success","Successfully Updated!");
			res.redirect("/phone/" + req.params.id);
		}
	});
});

//Destroy shop Route
router.delete("/:id",isLoggedIn,function(req, res){
	Shop.findByIdAndRemove(req.params.id, function(err){
		if(err){
			console.log(err);
			req.flash('error', err.message);
			res.redirect("/phone");
		}else{
			req.flash('error', 'Dish deleted!');
			res.redirect("/phone");
		}
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/user");
}

module.exports = router;