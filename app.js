 const express = require('express')
 const morgan = require('morgan')
const mongoose = require('mongoose');
const Picture = require('./base');
var fs = require('fs');
var dotenv = require('dotenv')
dotenv.config()
const multer = require('multer');
mongoose.set('strictQuery',false);


let db;

async function connectToDatabase() {
    
    const uri = process.env.uri;
    try{
        await mongoose.connect(uri)
        db = mongoose.connection.db
        console.log("connected to database");
    }catch(e){
        console.log("============================",e.message,"=====================");
        
    }
    
}



const app = express()
app.use(morgan('dev'));

port = process.env.PORT || 4000 
 app.set("view engine","ejs")
app.use(express.static('public'));



 app.get('/',async (req,res)=>{
    

    let blog = [
        {title: 'Yoshi dins  ',snipet: "Lorem ispum the waste of hooroor in the valley dark 1"},
        { title: 'melu dins wggle ', snipet: "Lorem ispum the waste of hooroor in the valley dark 2" },
        { title: 'yavasakhi dins hhoroijins ', snipet: "Lorem ispum the waste of hooroor in the valley dark 3" },
    ]
    //blog=[]
   res.render('./partials/head',{name:"mario passed variable or data",blog})
 });



app.get('/about', async (req, res) => {
    try {
        const data =  await Picture.find().lean();
        
        console.log()
        res.render('about', { users: data });
    } catch (e) {
        res.status(500).json({error:e.message});
    }
    
});

app.get('/files', (req, res) => {
    res.render('files', {  });
});

const upload = multer({ dest: './fileStore' });
app.post('/files', upload.single('image'), (req, res) => {
    console.log("recieved request for file");
    
    console.log(req.file);
    
    let image = req.file
    let exten = image.originalname.split('.').pop().toLowerCase();
    
    
    if (image.size < 5300000 && (exten === "jpg" || exten === "png")){
        fs.rename(image.path, "./public/" + image.filename +'.' +exten, (err) => {
            if (err) {
                res.send("File was not a Sucess Check spaces");
                console.log(err);
                return

            }
            
            res.send("File was a Sucess");
            const newPicture = new Picture({
                fName: image.originalname,
                src: "./" + image.filename + '.' + exten
            })
            newPicture.save();
            

        })
    }else{
        fs.unlink("fileStore/"+image.filename,(err)=>{
            if(err){
                console.log(err);
                
            }
        })
        res.send("File was not a Sucess Becouse size exceeded or filetype was not supported ");
    }
    
    
});

app.get('/images',async(req,res)=>{
    
    let images = await db.collection('images').find().toArray()
    
         console.log(images);
         res.render('images',{image:images})
   

})


app.use( (req, res) => {
    res.status(404).render('404');
});


connectToDatabase().then(()=>{
    
    app.listen(port, () => {
        console.log("Listening started on port ", port)
        
    })
}).catch(err =>{
    console.log('Failed to connect to the database. Server not started.',err);
    
})

