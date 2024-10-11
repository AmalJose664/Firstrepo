 const express = require('express')
 const morgan = require('morgan')
const { MongoClient } = require('mongodb');
var fs = require('fs');
var fileUpload = require('express-fileupload');
const multer = require('multer');


let data = null;
async function listDatabases(client) {
    data = await client.db("sample_mflix").collection("users").find().toArray();
    console.log("Databases:", await data.length);

    
    
};

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */
    const uri = "mongodb+srv://amal446446:aVPCLGOoWEslqZhs@testing.66hfq.mongodb.net/?retryWrites=true&w=majority&appName=Testing";


    const client = new MongoClient(uri);
    //console.log(client);
    
    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        await listDatabases(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

//main().catch(console.error);

const app = express()
app.use(morgan('dev'));

port = 4000
 app.set("view engine","ejs")
 

 app.listen(port,()=>{
    console.log("Listening started on port ",port)
 })

 app.get('/',(req,res)=>{
    

    let blog = [
        {title: 'Yoshi dins  ',snipet: "Lorem ispum the waste of hooroor in the valley dark 1"},
        { title: 'melu dins wggle ', snipet: "Lorem ispum the waste of hooroor in the valley dark 2" },
        { title: 'yavasakhi dins hhoroijins ', snipet: "Lorem ispum the waste of hooroor in the valley dark 3" },
    ]
    //blog=[]
   res.render('./partials/head',{name:"mario passed variable or data",blog})
 });



app.get('/about', (req, res) => {
    res.render('about',{data});
});

app.get('/files', (req, res) => {
    res.render('files', { data });
});

const upload = multer({ dest: './fileStore' });
app.post('/files', upload.single('image'), (req, res) => {
    console.log("recieved request for file");
    
    console.log(req.file);
    
    let image = req.file
    if (image.size < 5300000){
        fs.rename(image.path, "./fileStore/" + image.originalname, (err) => {
            if (err) {
                res.send("File was not a Sucess Check spaces");
                console.log(err);
                return

            }
            res.send("File was a Sucess")

        })
    }else{
        fs.unlink("fileStore/"+image.filename,(err)=>{
            if(err){
                console.log(err);
                
            }
        })
        res.send("File was not a Sucess Becouse size exceeded");
    }
    
    
});
app.use( (req, res) => {
    res.status(404).render('404');
});

