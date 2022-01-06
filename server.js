const express = require("express");
const { compileFunction } = require("vm");
const multer = require("multer");
const path = require("path");
const app = express();
const dotenv= require('dotenv');
const File =  require('./model/file.js');
const myenv = dotenv.config();
const {v4:uuid4} =  require('uuid');
const connectDB = require('./config/db.js');
const { send } = require("process");



const port = process.env.PORT||5000;

connectDB();

app.use(express.json());
app.set('views',path.join(__dirname ,'/views'));
app.set('view engine','ejs');

app.use("/static", express.static(path.join(__dirname, "public")));

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqName);
  },
});

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("myFile");

//front page
app.post("/api/files", async (req, res) => {
  upload(req, res, async(err) => {
    if (!req.file) {
      
      res.send({ error: "Error Found" });
    }
    if (err) {
      res.send({ error: "error" });
    }
    console.log(req.file);
    const file = new File({
        filename:req.file.filename,
        uuid:uuid4(),
        path:req.file.path,
        size:req.file.size,
    });
    const response = await file.save();
    res.json({file:`${process.env.APP_BASE_URL}/files/:${response.uuid}`});
  });
});

//Download page route
app.get('/files/:uuid',async (req,res)=>{
    try{
        const id = req.params.uuid.substring(1);
        const file = await File.findOne({uuid:id});
   
        if(!file)
            res.render('download',{error:'Link is not available...'})
        else{
           
            const downloadL =  `${process.env.APP_BASE_URL}/files/download/${file.uuid}`;
            console.log(downloadL);
            res.render('download',{
                uuid:file.uuid,
                fileName:file.filename,
                fileSize:file.size,
                downloadLink:`${process.env.APP_BASE_URL}files/download/${file.uuid}`
            })
        }
    }
    catch(err){
        res.render('download',{error:'ERROR...'});
    }
    
})

//Download route
app.get('/files/download/:uuid',async(req,res)=>{

    const file = await File.findOne({uuid:req.params.uuid});
    
    if(!file)
        res.render('download',{error:'Link has been expired..'});
    else{     
        const filePath = `${__dirname}/${file.path}`;
        res.download(filePath);
    }
})


app.post('/api/files/send',async (req,res)=>{
  console.log(req.body);
  const {uuid,emailTo,emailFrom} = req.body;
  if(!uuid||!emailFrom||!emailTo){
    res.status(404).send({error:"Validation Error"});
  }
  else{
    const file = await File.findOne({uuid:uuid});
    if(file.sender){
      res.status(404).send({error:'Already Sent'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response =  await file.save();

    const sendMail = require('./services/emailService');
    sendMail({
      from:emailFrom,
      to:emailTo,
      subject:'Sharify file sharing ',
      text:`${emailFrom} shared a file with you`,
      html:require('./services/downloadFile')({
        emailFrom : emailFrom,
        downLoadLink:`${process.env.APP_BASE_URL}/files/:${file.uuid}`,
        size:parseInt(file.size/1000) + 'KB ',
        expires:'24 hours '
      })
    })

    return res.send({success:true});
  }
})
app.get("/", (req, res) => {
  res.redirect("/static/index.html");
});


app.get("/Error", (req, res) => {
    res.sendFile(__dirname + '/public/404.html')
});

app.get('*', (req, res, next)=>{
    res.redirect('/Error')
})

app.listen(port, () => console.log(`server started at port  - > ${port}`));
