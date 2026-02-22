const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
require('dotenv').config({path:"../.env"});
const MONGO_URL=`mongodb+srv://vennapusaswetha:Swetha_Vennapusa@wanderlustproject.rxkzy4p.mongodb.net/?appName=WanderLustProject`

main()
.then(() =>{
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data =initData.data.map((obj) => ({...obj, owner: "683736e030d2441d6126c3c2"}));
    // console.log(initData.data)
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
};

initDB();