//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const { execPath } = require("process");
const mongoose =require("mongoose");
// const encrypt = require("mongoose-encryption");
// const md5= require("md5");
// const bcrypt = require("bcrypt");
// const saltRounds=10;
const session=require('express-session');
const passport=require('passport');
const passportLocalMongoose=require('passport-local-mongoose');

const app=express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.set('strictQuery',true);
mongoose.connect("mongodb://127.0.0.1/userDB",{useNewUrlParser:true},function(err){
    if(err){
        console.log(err.name,err.message);
    }
    else{
        console.log("mongodb connected successfully");
    }
});
// mongoose.set('useCreateIndex',true);

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:['password']});

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render("home");
});
app.get("/login",(req,res)=>{
    res.render("login");
});
app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/secrets",function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }
    else{
        res.redirect("/login");
    }
});
app.get("/logout",(req,res,next)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});

app.post("/register",(req,res)=>{
    // bcrypt.hash(req.body.password,saltRounds,function(err,hash){
    //     const newUser=new User({
    //         email: req.body.username,
    //         password: hash
    //     });
    //     newUser.save((err)=>{
    //         if(err){
    //             console.log("there is a error");
    //             console.log(err);
    //         }
    //         else{
    //             res.render("secrets")
    //         }
    //     });
    // });

    User.register({username:req.body.username},req.body.password , function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }
        else{
            passport.authenticate('local')(req,res,function(){
                res.redirect("/secrets")
            });
        }
    });
});
app.post("/login",(req,res)=>{
    // const username=req.body.username;
    // const password=req.body.password;
    // User.findOne({email:username},(err,foundUser)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     else{
    //         if(foundUser){
    //             bcrypt.compare(password,foundUser.password,function(err,result){
    //                 if(result===true){
    //                     res.render("secrets");
    //                 }
    //             });
    //             // if(foundUser.password===password){
    //             //     res.render("secrets");
    //             // }
    //         }
    //     }
    // });

    const user= new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate("local");
            res.redirect("/secrets");
        }
    });

});





app.listen(3000,function(){
    console.log("server started on port 3000.")
});