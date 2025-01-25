// require('dotenv').config({path : './env'})
// console.log(process.env)
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path:'./.env'
});

connectDB()
.then(()=>{
  app.on('error',(error)=>{
    console.log("EXPRESS CANT CONNECT TO DB :: index.js::   ",error);
    
  })
  app.listen(process.env.PORT || 8000 ,()=>{
    console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
    
  })
})
.catch((error)=>{
  console.log("MONGO DB CONNECTION FAILED :: index.js ::",error);
  
})











/*
import express from "express"
const app = express();
; (async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error) => {
      console.log("EXPRESS CANT CONNECT TO DB :: index.js ", error);
      throw error;
    })
    app.listen(process.env.PORT, () => {
      console.log("APP LISTENING ON PORT ", process.env.PORT);
    })

  } catch (error) {
    console.log("DATABASE CONNECTION ERROR :: index.js", error);
    throw error;
  }
})()
  */



