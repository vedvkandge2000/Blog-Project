
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate')




const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
  secret: 'our little secret.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-vedant:"+process.env.PASSWORD+"@cluster0-pppat.mongodb.net/blogDB", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false} );
mongoose.set('useCreateIndex', true);

const postSchema = new mongoose.Schema({
  title: String,
  imgUrl: String,
  content: String
});

const Post = mongoose.model("Post",postSchema);

const userSchema = new mongoose.Schema( {
  username:  {
    type: String,
    createIndexes: true
  },
  password: {
    type: String,
    createIndexes: true
  },
  googleId: {
    type: String,
    createIndexes: true
  },
  posts: [postSchema]
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/Blogging",
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id, username:profile.emails[0].value }, function (err, user) {
      return cb(err, user);
    });
  }
));


app.get("/",function(req,res) {
  res.render("start");
})

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/auth/google/Blogging",
    passport.authenticate("google", { failureRedirect: "/login" }),
    function(req, res) {
      // Successful authentication, redirect Home page.
      res.redirect("/home");
  });

  app.get("/login",function(req,res) {
  res.render("login")
});

app.get("/register",function(req,res) {
  res.render("register")
});


app.get("/home",function(req,res) {

  Post.find(function(err, foundPost) {
      if(err){
        console.log(err);
      }else{
        res.render("home",
        {
          posts:foundPost,
          userId: req.user.id,
          email: req.user.username,
        });
      }
  })
});

app.get("/logout",function(req,res) {
  req.logout();
  res.redirect("/");
});

app.post("/posts/:postId",function(req,res) {
  const requestedId = req.params.postId;
  const pageName = req.body.button;

  // console.log(pageName);
  // User.findOne({_id: req.user.id}, function(err,foundUser) {
  //   console.log(foundUser.posts);
  //   const foundPost = foundUser.posts.filter(post => {
  //     post._id == requestedId;
  //   });
  //   typeof(requestedId);
  //   console.log(requestedId);
  //   console.log(foundPost);
  //   if (err) {
  //     console.log(err);
  //   }else {
  //     res.render("post",{titleContent:foundPost[0].title, bodyContent:foundPost[0].content, postId:requestedId, img:foundPost[0].imgUrl});
  //   }
  //
  //
  // })

  Post.findOne({_id: requestedId}, function(err, foundPost){
      // if (err) {
      //   console.log(err);
      // }else {
        //console.log(foundPost);
        if(pageName === "home"){
          res.render("allPosts",{titleContent:foundPost.title, bodyContent:foundPost.content, postId:requestedId, img:foundPost.imgUrl});
        }
        else if(pageName === "myBlogs"){
          res.render("post",{titleContent:foundPost.title, bodyContent:foundPost.content, postId:requestedId, img:foundPost.imgUrl});
        }
      //}
   });
});

app.get("/myBlogs/:userId",function(req,res) {
  const requestedUserId = req.params.userId;
  // console.log(requestedUserId);
  User.findOne({_id: requestedUserId}, function(err, found) {
    if(err){
    console.log(err);
  }else {
    if(found){
      res.render("myBlogs", {posts: found.posts, userId:requestedUserId})
    }
  }
});
});

app.post("/register", function(req,res) {

  User.register({username:req.body.username}, req.body.password,function(err,user) {
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req,res,function() {
        res.redirect("/home")
      });
    }
  });

});

app.post("/login", function(req,res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function() {
        res.redirect("/home");
      })
    }
  })
});



app.get("/about",function(req,res) {
  res.render("about",{aboutContent:aboutContent});
});

app.get("/contact",function(req,res) {
  res.render("contact",{contactContent:contactContent});
});

app.post("/new",function(req,res) {
    res.render("compose");
});

app.post("/post",function(req,res) {
  const action = req.body.button;
  if(action === "edit"){

    Post.findOne({_id:req.body.id}, function(err, foundUser){
        if (err) {
          console.log(err);
        }else {

          res.render("Edit",{previousTitle:foundUser.title, previouscontent:foundUser.content, postId:foundUser._id, previousUrl:foundUser.imgUrl});
        }
     });
    }
  else if (action === "delete") {

    User.findOneAndUpdate({_id:req.user.id}, {$pull: {posts: {_id: req.body.id}}}, function(err, foundUser) {
      if(!err){
        Post.findOneAndDelete({_id: req.body.id}, function(err) {
          if(!err){
            res.redirect("/myBlogs/"+req.user.id);
          }
        })
      }
    });

    }
});



app.post("/edit",function(req,res) {


  User.findOneAndUpdate({_id:req.user.id}, {$pull: {posts: {_id: req.body.id}}},function(err) {
    if(err){
      res.send(err);
    }else{

          const updatedPost = new Post({
            title:req.body.title,
            imgUrl:req.body.img,
            content:req.body.post
          });
          User.findOne({_id: req.user.id}, function(err, found) {
              found.posts.push(updatedPost);
              found.save(function(err) {
                if(!err){
                  // console.log(req.user.id);
                  Post.findOneAndDelete({_id:req.body.id}, function(err) {
                    if(!err){
                      updatedPost.save(function(err) {
                        if(err){
                          console.log(err);
                        }else {
                          res.redirect("/myBlogs/"+req.user.id);
                        }
                      })
                    }
                  })

                }
              });
            });




    }
  });
});

app.post("/compose",function(req,res) {

  const newPost = new Post({
    title:req.body.title,
    imgUrl:req.body.img,
    content:req.body.post
  });

  User.findOne({_id: req.user.id}, function(err, found) {
      found.posts.push(newPost);
      found.save(function(err) {
        if(!err){
          // console.log(req.user.id);
        }
      });
    })
    newPost.save(function(err) {
      if(err){
        console.log(err);
      }else {
        res.redirect("/myBlogs/"+req.user.id);
      }
    })
})




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
