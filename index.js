const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');

const express = require("express");
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const path=require("path");
const mehtodOverride = require("method-override");

app.use(mehtodOverride("_method"));
app.use(express.urlencoded({extended :true}));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(express.static(path.join(__dirname,"public"))); 

const connection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    database :'canteen_database', //need to create in sql
    password :'SHREYAr@2004',
});

//creating the local host;
app.listen("8080",() => {
    console.log("server is listening to port 8080");
 });

//basic route
app.get("/user",(req,res)=>{
    console.log("it is working");
    res.render("login.ejs");
});

//Create route :inserting the data in table
app.post("/user/login",(req,res)=>{
    const{username , password} = req.body;

    const q = "INSERT INTO student SET ?";
    
    const data1 = {id:faker.string.uuid(), username , password}
    connection.query(q,data1,(err,result)=>{
        if(err){
            console.log("Error inserting data",err);
            res.status(500).send("Error");
        }
        else{
           res.redirect(`/user/home/${data1.id}`);
        }
    });
});

app.get("/user/home/:id",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM  student WHERE id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let student = result[0];
            res.render("home.ejs",{student});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    } 
});
//Edit route
app.get("/user/:id/edit",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM  student WHERE id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let student = result[0];
            res.render("menu.ejs",{student});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    } 
});

//update route
app.patch("/user/:id", (req, res) => {
    const { id } = req.params;
    const { items, total } = req.body;

    try {
        const itemsArray = JSON.parse(items); // Parse the items JSON string
        const itemsList = JSON.stringify(itemsArray);

        const q = `UPDATE student SET items=?, total_price=? WHERE id=?`;
        connection.query(q, [itemsList, total, id], (err, result) => {
            if (err) {
                console.error(err);
                return res.send("Error in database");
            }
            res.redirect(`/user/end/${id}`)
        });
    } catch (err) {
        console.error(err);
        res.send("Error parsing items");
    }
});

app.get("/user/end/:id",(req,res)=>{
    let {id} = req.params;
    let q = `SELECT * FROM  student WHERE id='${id}'`;
    try{
        connection.query(q, (err,result)=>{
            if(err) throw err;
            let student = result[0];
            res.render("endpage.ejs",{student});
        });
    }catch(err){
        console.log(err);
        res.send("some error in DB");
    } 
});

//index ROUTE :show the data
app.get("/user/data",(req,res)=>{
    let q = `select * from student`;
    try{
      connection.query(q,(err,result)=>{
          if(err) throw err;
          res.render("std.ejs",{result}); //user table data 
      });
     }catch(err){
      console.log(err);
      res.send("some error in data base");
  }
  });
  
  // Delete route
app.delete("/user/:id", (req, res) => {
    const { id } = req.params;
  
    const q = `DELETE FROM student WHERE id=?`;
    connection.query(q, id, (err, result) => {
      if (err) {
        console.error(err);
        return res.send("Error deleting user");
      }
      res.redirect("/user/data");
    });
  });
