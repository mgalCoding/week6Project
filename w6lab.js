let express = require('express');
let app = express();
let mongodb = require('mongodb');

let morgan = require('morgan');
app.use(morgan('common'));
//Configure MongoDB
let MongoDBClient = mongodb.MongoClient;
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));
app.engine("html", require('ejs').renderFile);
app.set("viewengine")//rendering
//reference to the database (i.e. collection)
let db = null;//global access (ref to db) - should be accessible to several methods

// Connection URL
let url = "mongodb://localhost:27017";

app.use(bodyParser.urlencoded({extended:false}));

app.use(express.static('images'));
app.use(express.static('css')); 



let viewsPath=__dirname+'/views/';//bring current path then attach views

//Connect to mongoDB server
MongoDBClient.connect(url, {useNewUrlParser:true, useUnifiedTopology: true}, function(err,client){
    if (err) {
        console.log("Err  ", err);
    } else {
        console.log("Connected successfully to server");
        db = client.db("fit2095db");
    }
});

//GET request: send the page to the client
app.get('/',function(req,res){
    res.sendFile(__dirname + "/views/home.html");
});

//POST request: receive the details from the client and insert new document (i.e. object) to the collection (i.e. table)
app.post('/addtask', function (req,res){
    console.log(req.body);
    let taskID = getNewRandomId();
    db.collection('tasks').insertOne({taskId: taskID, taskName:req.body.taskName, assignTo:req.body.assignTo, taskDueDate: req.body.taskDueDate, 
        taskStatus: req.body.taskStatus, taskDescription: req.body.taskDescription});
    res.redirect('/listtasks');
});

app.get('/addtask', function (req,res){
    res.sendFile(viewsPath+"addtask.html");
});

//List all tasks
//GET request: send the page to the client. 
//Get the list of documents form the collections and send it to the rendering engine
app.get('/listtasks', function(req,res){
    let query ={};//empty since there's no criteria
    db.collection('tasks').find(query).toArray(function (err, data) {
        res.render(viewsPath+"listtasks.html", { taskDb: data });
    });
});

//POST request: receive the details from the client and insert new document (i.e. object) to the collection (i.e. table)
app.post('/deletebyid', function (req,res){
    console.log(req.body);
    console.log(req.body.taskId);
    let id = parseInt(req.body.taskId);
    let filter = { taskId: id };
    db.collection('tasks').deleteOne(filter);
    res.redirect('/listtasks');
});

app.get('/deletebyid', function (req,res){
    res.sendFile(viewsPath+"deletebyid.html");
});

app.get('/deletecompletedtasks', function (req,res){
    res.sendFile(viewsPath+"deletecompletedtasks.html");
});
app.post('/deletecompletedtasks', function (req,res){
    let filter = { taskStatus: 'Complete' };
    db.collection('tasks').deleteMany(filter);
    res.redirect('/listtasks');
});

//POST request: receive the details from the client and insert new document (i.e. object) to the collection (i.e. table)
app.post('/updatebyid', function (req,res){
    console.log(req.body.taskId)
    console.log(req.body.newTaskStatus)
    let id = parseInt(req.body.taskId);
    let filter = { taskId: id };
    let theUpdate = { $set: { taskStatus: req.body.newTaskStatus } };
    db.collection('tasks').updateOne(filter, theUpdate);
    res.redirect('/listtasks');
});

app.get('/updatebyid', function (req,res){
    res.sendFile(viewsPath+"updatebyid.html");
});

function getNewRandomId(){
    let id;
    id = Math.round(Math.random()*1000);
    id = parseInt(id);
    return id
}

app.listen(8080);
