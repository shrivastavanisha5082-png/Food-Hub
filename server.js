const express = require('express');
const path = require('path');

const app = express();


app.use(express.static(path.join(__dirname, 'public')));
const { MongoClient } = require("mongodb");
const fs = require("fs");
const http = require("http");

const client = new MongoClient("mongodb://localhost:27017");

client.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MongoDB");

  const db = client.db("foodhub");
  const users = db.collection("users");
  const orders = db.collection("orders");
  const reservations = db.collection("reservations");

  const server = http.createServer(function (req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    
    if (req.method === "GET") {
      let fileName = req.url.substring(1);
      if (fileName === "") {
        fileName = "login.html";
      }
      fileName = path.join(__dirname,"public",fileName);
      fs.readFile(fileName, function (err, data) {
        if (err) {
          res.end("File not found");
          return;
        }
        if (fileName.includes(".css")) {
          res.setHeader("Content-Type", "text/css");
        } else {
          res.setHeader("Content-Type", "text/html");
        }
        res.end(data);
      });
      return;
    }

    let body = "";
    req.on("data", function (chunk) {
      body = body + chunk;
    });

    req.on("end", function () {
      const data = JSON.parse(body);

      
      if (req.url === "/signup" || req.url === "/login") {
        if (data.email === "" || data.email.includes("@") === false) {
          console.log("Invalid email");
          res.end("Invalid email");
          return;
        }
      }

      if (req.url === "/signup") {
        users.insertOne(data, function (err, result) {
          if (err) throw err;
          console.log("User created successfully");
          res.end("ok");
        });
 
      } else if (req.url === "/order") {
        orders.insertOne(data, function (err, result) {
          if (err) throw err;
          console.log("Order added successfully");
          res.end("ok");
        });
      } else if (req.url === "/reservation") {
        reservations.insertOne(data, function (err, result) {
          if (err) throw err;
          console.log("Reservation inserted successfully");

          
          fs.appendFile("reservations.txt", JSON.stringify(data) + "\n", function (err) {
            if (err) throw err;
            console.log("Data saved in reservations.txt");
          });
          res.end("ok");
        });
      } else {
        console.log("Login: " + data.email);
        res.end("ok");
      }
    });
  });

  server.listen(3001, function () {
    console.log("Server running at http://localhost:3001");
  });
});