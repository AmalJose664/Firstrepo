const express = require('express')
 const morgan = require('morgan')
 const mongoose = require('mongoose');
const Picture = require('./base');
 var fs = require('fs');
 var dotenv = require('dotenv')
 dotenv.config()
 const upload = require('./multer');
 mongoose.set('strictQuery',false);
var cloudinary = require('./cloudinary')


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
app.use(express.urlencoded({ extended: true }));

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
        const data =  await db.collection('users').find().toArray();
        
        console.log()
        res.render('about', { users: data });
    } catch (e) {
        res.status(500).json({error:e.message});
    }
    
});

app.get('/files', (req, res) => {
    res.render('files', {  });
});

app.post('/files', upload.single('image'), async(req, res) => {
    console.log("recieved request for file");
    
    console.log(req.file);
    
    
    let image = req.file
    let exten = image.originalname.split('.').pop().toLowerCase();
    
     
    if (image.size < 5300000 && (exten === "jpg" || exten === "png" || exten === "jpeg")){
        try {
            imageName = image.originalname
            const resultOfUpload = await cloudinary.uploader.upload_stream({resource_type:'image'},(err,result)=>{
                if(err){
                    console.log(err);
                    return res.status(500).json({
                        success: false,
                        message: err.message
                    })
                }
                const newImage = new Picture({
                    fName: imageName,
                    
                    secureUrl:result.secure_url,
                    url: result.url,
                    public_id:result.public_id,
                    displayName: result.display_name,
                    cloudinaryData:result,

                })  
                newImage.save().then((result)=>{
                    console.log("How to check if this is inserted or not",result);
                    
                });
                return res.send(`<code>Image uploaded Succesfully</code><br><h3>View them below</h3><br><a href="/images">View</a>`)
                
            })
            resultOfUpload.end(image.buffer);
        } catch (e) {
            res.json(e.message);
        }
    }else{
        return res.send("<h1 style='color:red;font-family: sans-serif;'>File upload  was not a Success because file size exceeded or file type was not supported :(</h1>")
    }
});

app.get('/images',async(req,res)=>{
    
    let images = await db.collection('images').find().toArray()
    
         
         res.render('images',{image:images})
   

})
app.get('/delete/:id',async (req,res)=>{
    
    console.log("id page\n Recived id ",req.params.id);
    id = decodeURIComponent(req.params.id);
    console.log(id);
    
    try {
        
        await cloudinary.uploader.destroy(req.params.id, { invalidate: true }, (err,result) => {
            if(err){
                console.log("This result if", err);
                res.status(500).json(err);
                return
            }
            if(result.result === "ok"){
                console.log("This result else \n delete success", result);
            }
            db.collection('images').deleteOne({ public_id: req.params.id }).then((r) => {
                console.log("resiult of delete ", r);

            })
            
            res.send("<h1 style='color:#fe77e1;font-family: sans-serif;'>File was deleted  :(</h1><a href='/images'>Goto Home </a>");  
            
        })
    } catch (error) {
        console.log("This result catch", error);
        res.json(error.m)
    }
})

app.post('/upload-by-link',(req,res)=>{
    let link = req.body.link;
    
    
    cloudinary.uploader.upload(link, (err, result) => {
        if (err) {
            console.log(err.message);
            res.send(`<h5 style="color:#005cdc;font-size:30px ;font-family:sans-serif">${err.message}</h5>`);
            return

        }
        console.log(result);
        const newImage = new Picture({
            fName: result.original_filename +"."+ result.original_extension,

            secureUrl: result.secure_url,
            url: result.url,
            public_id: result.public_id,
            displayName: result.display_name,
            cloudinaryData: result,

        })
        console.log(result.original_filename,);
        
        newImage.save().then((result) => {
            console.log("How to check if this is inserted or not", result);

        });
        res.send(`<code>Image uploaded Succesfully</code><br><h3>View them below</h3><br><a href="/images">View</a>`)

    })
})

app.use( (req, res) => {
    res.status(404).render('404');
});


connectToDatabase().then(()=>{
    
    app.listen(port, () => {
        console.log("Listening started on port  \n visit at \n'http://localhost:"+port+"'");
        
    })
}).catch(err =>{
    console.log('Failed to connect to the database. Server not started.',err);
    
})

