const express = require('express');
var app = express();
var http = require('http').Server(app);
const bodyParser = require('body-parser');
const cors = require("cors");
var MongoClient = require('mongodb').MongoClient;
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const UploadController = require('./controller/UploadController');
var nodemailer = require('nodemailer');
var url = "mongodb://localhost:27017";

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//add the router
app.get('/api/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
})

app.post('/api/register', function async(req, _res) {

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        let _password = req.body.password.toString();
        bcrypt.hash(_password, 10).then((hash) => {
            var user_data = { name: req.body.name,phone: req.body.phone,address: req.body.address, email: req.body.email, password: hash ,gender: req.body.gender,dob: req.body.dob};
            dbo.collection("Users").findOne({'email':req.body.email}).then(function(doc) {
                if (!doc) {
                    dbo.collection("Users").insertOne(user_data, function (err, res) {
                        if (err) {
                            _res.status(500).json({
                                error: err
                            });
                        }
                        else {
                            console.log("New User Inserted");
                            db.close();
                            _res.json({ message: "Inserted", data: user_data });
                            SendMail(req.body.email,"Registerd Successfully","Name:"+req.body.name+"\nEmail:"+req.body.email+"\nGender:"+req.body.gender,"\nDOB:"+req.body.dob,"\nAddress:"+req.body.address);
                        }
                    });
                }
                else {
                    _res.json({message: "Email Already Used", status:"Failed"});
                }
          });
        });
    });
})
app.post('/api/register-admin', function async(req, _res) {

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        let _password = req.body.password.toString();
        bcrypt.hash(_password, 10).then((hash) => {
            var user_data = { name: req.body.name,phone: req.body.phone,address: req.body.address, email: req.body.email, password: hash ,gender: req.body.gender,dob: req.body.dob};
            dbo.collection("Admin").findOne({'email':req.body.email}).then(function(doc) {
                if (!doc) {
                    dbo.collection("Admin").insertOne(user_data, function (err, res) {
                        if (err) {
                            _res.status(500).json({
                                error: err
                            });
                        }
                        else {
                            console.log("New User Inserted");
                            db.close();
                            _res.json({ message: "Inserted", data: user_data });
                        }
                    });
                }
                else {
                    _res.json({message: "Email Already Used", status:"Failed"});
                }
          });
        });
    });
})
app.post('/api/login-admin', function async(req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("Admin").findOne({'email':req.body.email}).then(function(doc) {
            if (!doc) {
                res.json({ message: "Invalid Email", status: "Failed" });
            }
            else {
                bcrypt.compare(req.body.password, doc.password)
                    .then(result => {
                        if (result == false) {
                            res.json({ message: "Invalid Password", status: "Failed" });
                        }
                        else {
                            res.json(doc);
                        }
                    })
                    .catch(err => {
                        res.json({ message: "Invalid Password", status: "Failed" });
                    });
            }
      });
    });
})
app.post('/api/add-zones', function async(req, _res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        var user_data = { longtitude: req.body.longitude, latitude: req.body.latitude, zone_id: req.body.zone,zone_type: req.body.zone_type};
        dbo.collection("ZoneData").insertOne(user_data, function (err, res) {
            if (err) {
                _res.status(500).json({
                    error: err
                });
            }
            else {
                console.log("New Zone Inserted");
                db.close();
                _res.json({ message: "Inserted", data: user_data });
            }
        });
    });
});
app.get('/api/get-zones', function async(req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("ZoneData").find().toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Zone Found" });
            }
            else {

                res.json({ message: "Success", data: result });
            }
            db.close();
        });
    });
})
app.get('/api/get-web-zones', function async(req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("ZoneData").find().toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Zone Found" });
            }
            else {

                res.json(result);
            }
            db.close();
        });
    });
})
app.post('/api/check-user', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        let _password = req.body.password.toString();
        bcrypt.hash(_password, 10).then((hash) => {
            dbo.collection("Users").findOne({'email':req.body.email}).then(function(doc) {
                if (!doc) {
                    res.json({message: "NotExists", status:"Success"});
                }
                else {
                    _res.json({message: "Exists", status:"Failed"});
                }
          });
        });
    });
});
function AddZoneData(longitude, latitude, zone) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").find({ latitude: latitude, longitude: longitude }).toArray(function (err, result) { });
        var user_data = { longtitude: longitude, latitude: latitude, zone_id: zone };
        dbo.collection("ZoneData").insertOne(user_data, function (err, res) {
            if (err) throw err;

            console.log("New User Inserted");
            db.close();
            
        });
    });
}
app.post('/api/file-case', function async(req, _res,next) {

    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        var user_data = { name: req.body.name, phone: req.body.phone, address: req.body.address, complaint: req.body.complaint, police_station: req.body.police_station,longtitude:req.body.longtitude, latitude: req.body.latitude, email: req.body.email, status: 'Created', case_id: req.body.case_id,case_date: req.body.case_date,caseType: req.body.case_type};
       
        console.log(user_data);
        dbo.collection("FiledCases").findOne({ 'case_id': req.body.case_id }).then(function (doc) {
            if (!doc) {
                dbo.collection("FiledCases").insertOne(user_data, function (err, res) {
                    if (err) {
                        _res.status(500).json({
                            error: err
                        });
                    }
                    else {
                        console.log("New Case Filed");
                        if(req.body.caseType=="Normal"){
                            UploadController.uploadImage(req, _res);
                        }
                        db.close();
                        SendMail(req.body.email,"New FIR","NEW FIR REGISTRED TO YOUR NEAREST POLICE STATION\nCASE ID:"+req.body.case_id+"\nCASE DATE:"+req.body.case_date+"\nStatus:Created"+"\nComplaint Note:"+req.body.complaint+"\nnName:"+req.body.name+"\nEmail:"+req.body.email+"\nGender:"+req.body.gender,"\nDOB:"+req.body.dob,"\nAddress:"+req.body.address,"\n");
                        _res.json({ message: "Case Filed", data: user_data });

                    }
                });
            }
            else {
                _res.json({ message: "Failed Case Filing", status: "Failed" });
            }
        });
    });
})
app.get('/api/get-all-cases', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").find().sort( { case_id: -1 } ).toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Case Found" });
            }
            else {

                res.json(result);
            }
            db.close();
        });
    });
})
app.post('/api/case-detail', function async (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").findOne({ 'case_id': req.body.case_id }).then(function (doc) {
            if (!doc) {
                res.json({ message: "Case Not Found", status: "Failed" });
            }
            else {
                res.json({ message: "Success", data: doc });
            }
        });
    });
})
app.post('/api/case-web-detail', function async (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").findOne({ 'case_id': req.body.case_id }).then(function (doc) {
            if (!doc) {
                res.json({ message: "Case Not Found", status: "Failed" });
            }
            else {
                res.json(doc);
            }
        });
    });
})

app.post('/api/all-detail', function async (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").find({ 'email': req.body.email }).sort( { case_id: -1 } ).toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Case Found" });
            }
            else {

                res.json({ message: "Success", data: result });
            }
            db.close();
        });
    });
})
app.post('/api/update-case-detail', function async (req, _res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        var myquery = { case_id: req.body.case_id };
        var newvalues = { $set: { status: req.body.status } };
        dbo.collection("FiledCases").updateOne(myquery, newvalues, function(err, res) {
            if (err) throw err;
            console.log("1 document updated");
            db.close();
            SendMail(req.body.email,req.body.case_id+" LIVE STATUS","CURRENT STATUS OF YOUR CASE :"+req.body.case_id+"\n\nStatus:"+req.body.status);
            _res.send('document updated');
          });
    });
})
app.post('/api/all-details', function async (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("FiledCases").find({}).toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Case Found" });
            }
            else {

                res.json({ message: "Success", data: result });
            }
            db.close();
        });
    });
})
app.get('/api/users', function (req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("Users").find().toArray(function (err, result) {
            if (!result) {
                res.json({ message: "No Case Found" });
            }
            else {

                res.json(result);
            }
            db.close();
        });
    });
});
app.post('/api/login', function async(req, res) {
    MongoClient.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, db) {
        if (err) throw err;
    
        var dbo = db.db("Hackthone_Crime_Reporting");
        dbo.collection("Users").findOne({'email':req.body.email}).then(function(doc) {
            if (!doc) {
                res.json({ message: "Invalid Email", status: "Failed" });
            }
            else {
                bcrypt.compare(req.body.password, doc.password)
                    .then(result => {
                        console.log(result);
                        if (result == false) {
                            res.json({ message: "Invalid Password", status: "Failed" });
                        }
                        else {
                            res.json(doc);
                            SendMail(req.body.email,"Login Session alert","New Device Logged In");
                        }
                    })
                    .catch(err => {
                        res.json({ message: "Invalid Password", status: "Failed" });
                    });
            }
      });
    });
})

app.post('/api/otp/send', function (req, res) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'bhavin.divecha09@gmail.com',
          pass: 'eadoktafjjrupiwd'
        }
      });
      
      var mailOptions = {
        from: 'bhavin.divecha09@gmail.com',
        to: req.body.email,
        subject: req.body.otp+"is OTP",
        text: req.body.otp+"is OTP"
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            res.send("mail_failed");
        } else {
            console.log('Email sent: ' + info.response);
            res.send("mail_send");
        }
      });
})
function SendMail(email,subject,message){
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'bhavin.divecha09@gmail.com',
          pass: 'eadoktafjjrupiwd'
        }
      });
      
      var mailOptions = {
        from: 'bhavin.divecha09@gmail.com',
        to: email,
        subject: subject,
        text: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}
http.listen(process.env.PORT || 5500,function(){
    console.log('Server Started on ');
})