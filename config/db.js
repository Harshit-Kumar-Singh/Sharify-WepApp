require('dotenv').config();
const mongoose = require('mongoose');
const URI = process.env.MONGO_CONNECTION_URL;
// console.log(URI);
async function connectDB()
{
   await mongoose.connect(URI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true 
    }, err => {
    if(err) throw err;
    else
        console.log('Connected to MongoDB!!!')
    });
    
}
module.exports = connectDB;