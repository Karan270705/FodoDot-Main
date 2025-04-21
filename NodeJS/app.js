const express = require('express');
const app= express();
const mongoose = require('mongoose');
app.use(express.json());
const port =5000;
const cors = require('cors');
app.use(cors());
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "haha123ahwbdahwdahwdahwd34095398503498539458][[][]sejfsejknfsenf";
const mongoURL = "mongodb+srv://karan:Karan2707@cluster0.zjgcc6x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.set('view engine', 'ejs'); 
var nodemailer = require('nodemailer');
app.use(express.urlencoded({extended: false}));

mongoose.connect(mongoURL, {
    useNewUrlParser:true,
})
.then(()=>{ 
    console.log("Connected to Mongoose");
})
.catch((e)=>console.log(e));

require("./userDetails");

const User = mongoose.model("UserInfo");

app.post("/register",async(req, res)=>{
    const {uname, email, password}= req.body;
    const encryptedPassword = await bcrypt.hash(password,10);
    try {
        const oldUser = await User.findOne({email});
        if(oldUser){
           return res.json({error : "User Exists"});
        }
        await User.create({
            uname,
            email,
            password:encryptedPassword,
        });
        res.send({status:"Ok"})
    } catch (error) {
        res.send({Status:"error"})
    }
});


app.post("/login-user", async(req, res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.json({error : "User not found!"});
     }
     if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({}, JWT_SECRET);
        if(res.status(201)){
            return res.json({status:"ok", data:token});
        }else{
            return res.json({error:"Error"});

        }
     }
     res.json({status:"Error", error:"Invalid Password"})
});

app.post("/userData", async(req, res)=>{
    const {token} = req.body;
    try {
        const user = jwt.verify(token,JWT_SECRET);
        console.log(user);
        const useremail = user.email;
        User.findOne({email: useremail}).then((data)=>{
            res.send({status:"ok",data:data});
        }).catch((error)=>{
            res.send({status:"error", data:data})
        })
    } catch (error) {
        
    }
});


app.post("/forgot-password", async(req, res)=>{

    const {email} = req.body;
    try {
        const oldUser = await User.findOne({email});
        if(!oldUser){
            return res.json({status:"User Not Exist"});
        }
        const secret  = JWT_SECRET + oldUser.password;
        const token = jwt.sign({email: oldUser.email, id: oldUser.id},secret,{expiresIn:'5m',});
        const link = `http://localhost:5000/reset-password/${oldUser.id}/${token}`;
       
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'getfododot@gmail.com',
              pass: 'blzu fotw ifoz gxuc'
            }
          });
          
          var mailOptions = {
            from: 'fododot@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: link,
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
        console.log(link);
    } catch (error) {
        
    }

});


app.get("/reset-password/:id/:token", async(req,res)=>{
   const{id,token}=req.params;
   console.log(req.params);  
   
   const oldUser = await User.findOne({_id:id});
   if(!oldUser){
    return res.json({status:"User Not Exist!"});
   }
   const secret =  JWT_SECRET + oldUser.password;
   try {
    const   verify = jwt.verify(token,secret);
    res.render("index", {email:verify.email, status:"Not Verified"})
   } catch (error) {
    res.send("Not Verified")
   }

   
});

app.post("/reset-password/:id/:token", async(req,res)=>{
    const{id,token}=req.params;
    const {password} = req.body;
    
    const oldUser = await User.findOne({_id:id});
    if(!oldUser){
     return res.json({status:"User Not Exist!"});
    }
    const secret =  JWT_SECRET + oldUser.password;
    try {
     const verify = jwt.verify(token,secret);
     const encryptedPassword = await bcrypt.hash(password, 10);
     await User.updateOne(
        {
            _id:id,
        },
        {
            $set:{
                password: encryptedPassword,
            }
        }
     );
     res.json({status: "Password Updated"});
     res.render("index", {email : verify.email, status: "Verified"});
    } catch (error) {
     res.json({status: "Something Went Wrong"});
    }
 
    
 });


 // Example route to add a favorite recipe


// Example route to retrieve favorites for a user
app.get("/favorites", async (req, res) => {
    const { userEmail } = req.params;

    // Retrieve favorite recipes associated with the user's email address
    // Example MongoDB/Mongoose code
    try {
        const favorites = await FavoriteRecipe.find({ userEmail });
        res.status(200).json(favorites);
    } catch (error) {
        console.error("Error retrieving favorites:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});



app.listen(port, ()=>{
    console.log("Server Started");
});
