
     
     
     const express = require("express");
     const mongoose = require("mongoose");
     const app = express();
     const MONGO_URL = "mongodb://mongo:CwCdwbDHHYIYUSrLVpWpGVfOoJmsHXdb@mongodb.railway.internal:27017";
     const CLOUDINARY_CLOUD_NAME = "dmcdfoduy";
     const CLOUDINARY_API_KEY = "956434331232872";
     const CLOUDINARY_API_SECRET = "2n_b4GmDIoJvzJL0jMKycW9ikUQ";
     const SESSION_SECRET = "mysecret123";  // you can pick any string     
     const flash=require("connect-flash");
     const session=require("express-session");                                      
     const methodOverride = require("method-override");
     const path = require("path");
     const ejsMate = require("ejs-mate");
     const ExpressError = require("./utils/ExpressError.js")
     const NewSchema=require("./schema.js"); 
     
     const Listing = require("./models/listing.js");   // 👈 Add this line

     const { cookie } = require("express/lib/response.js");
     const passport=require("passport"); 
     const localStrategy=require("passport-local");
     const User=require("./models/user.js"); 
     const { data: sampleListings } = require("./init/data");
     const listingRouter=require("./routes/listing.js");
     const reviewRouter=require("./routes/review.js");
     const userRouter=require("./routes/user.js");
     
         app.set("view engine", "ejs");//"ejs"
         app.set("views", path.join(__dirname, "views")); 
         app.use(express.urlencoded({ extended: true })); 
         app.use(express.json()); // Parses JSON data
         app.use(methodOverride("_method"));
         app.engine("ejs", ejsMate);
         app.use(express.static(path.join(__dirname, "/public")))
         app.use(express.static(path.join(__dirname, '/images')));
     
let mongourl = process.env.MONGO_URL || "mongodb://mongo:CwCdwbDHHYIYUSrLVpWpGVfOoJmsHXdb@mongodb.railway.internal:27017";
console.log("MONGO_URL is:", mongourl);

console.log("MONGO_URL is:", process.env.MONGO_URL);

     
     // app.get("/", (req, res) => {
     //     res.send("working");
     // });  
     
     
     const sessionOptions={
         secret:"mysupersecretcode", 
         resave:false,
         saveUninitialized:true ,
         cookie:{
             expires:Date.now()+10*24*60*60*1000,
             maxAge:10*24*60*60*1000,
             httpOnly:true 
         }
     }; 
     
     
     app.use(session(sessionOptions)); 
     app.use(flash());
     
     app.use(passport.initialize()); 
     app.use(passport.session()); 
     passport.use(new localStrategy(User.authenticate())); 
     
     passport.serializeUser(User.serializeUser()); 
     passport.deserializeUser(User.deserializeUser()); 
     
     app.use((req,res,next)=>{
         res.locals.success=req.flash("success") || [];
         res.locals.error=req.flash("error") || []; 
         res.locals.currUser=req.user; 
         next();
     })
     
     main()
     .then(() => {
         console.log("mongo working");
     });
     
async function main(){
    try {
        await mongoose.connect(mongourl);
        console.log("MongoDB connected successfully");
    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
     
     app.get("/", (req, res) => {
  res.redirect("/listing");
});
     
     app.use("/listing",listingRouter)
     app.use("/listing/:id/review",reviewRouter);
     app.use("/",userRouter)
     
     
     
     app.all("*", (req, res, next) => {
         next((new ExpressError(404,"Page Not Found  "))); 
     })
     
     app.use((err, req, res, next) => {
         let { statusCode=404, message="NO MESSAGE"} = err;
         res.render("error",{message})
     })


async function seedIfEmpty() {
  const count = await Listing.countDocuments();
  console.log("Listings in DB:", count); // 👈 check Railway logs here
  if (count === 0) {
    await Listing.insertMany(sampleListings);
    console.log("✅ Sample listings inserted");
  }
}

// seedIfEmpty();
