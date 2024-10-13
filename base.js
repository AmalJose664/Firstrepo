const mongoose = require('mongoose')

const pictureSchema  = new mongoose.Schema({
    fName:String,
    uploadTimeName:String,
    url:String,
    secureUrl:String,
    public_id:String,
    displayName:String,
    cloudinaryData:Object
})


const users = mongoose.model('images',pictureSchema);
module.exports = users;