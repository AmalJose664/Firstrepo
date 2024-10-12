const mongoose = require('mongoose')

const pictureSchema  = new mongoose.Schema({
    fName:String,
    src:String
})


const users = mongoose.model('images',pictureSchema);
module.exports = users;