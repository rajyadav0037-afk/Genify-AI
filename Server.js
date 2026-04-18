require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

app.use(cors(...));
app.options("*", cors());

origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options("*", cors());

mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("DB Connected"));

const User = mongoose.model("User", {
  email: String,
  password: String,
  isAdmin: { type: Boolean, default: false },
  usageCount: { type: Number, default: 0 },
  subscription: {
    active: { type: Boolean, default: false },
    expiresAt: Date
  }
});

function auth(req,res,next){
  const token = req.headers.authorization?.split(" ")[1];
  if(!token) return res.status(401).json({msg:"No token"});
  try{
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  }catch{
    res.status(401).json({msg:"Invalid token"});
  }
}

app.post("/api/login", async (req,res)=>{
  const {email,password} = req.body;
  let user = await User.findOne({email});
  if(!user){
    user = await User.create({email,password});
  }

  if(email === "raj.yadav0037@gmail.com"){
    user.isAdmin = true;
    await user.save();
  }

  const token = jwt.sign({id:user._id}, process.env.JWT_SECRET);
  res.json({token});
});

app.post("/api/ai/:type", auth, async (req,res)=>{
  const user = await User.findById(req.user.id);

  if(!user.isAdmin){
    if(!user.subscription.active && user.usageCount >= 2){
      return res.status(403).json({msg:"Free limit reached"});
    }
  }

  user.usageCount++;
  await user.save();

  res.json({
    result: `AI ${req.params.type} result for: ${req.body.prompt}`
  });
});

app.get("/api/admin/stats", async (req,res)=>{
  const users = await User.countDocuments();
  const subs = await User.countDocuments({"subscription.active":true});

  res.json({users,subs});
});

app.listen(5000, ()=>console.log("Server running"));
