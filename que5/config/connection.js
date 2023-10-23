const mongoose=require("mongoose")
if(mongoose.connect("mongodb://localhost:27017/ps2DB",{ useNewUrlParser:true, useUnifiedTopology:true}))
{
console.log("connected");
}
else
{
    console.log("Failed To Connect!");
}
