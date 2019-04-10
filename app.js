// VARIABLES //

var express = require("express");
var MongoClient = require("mongodb").MongoClient,
assert = require("assert");
var bodyParser = require("body-parser");
var fs = require("fs");
var app = express();
var URL = "mongodb://localhost:27017/";
var URLencodeParser = bodyParser.urlencoded({ extended: false });
var ObjectID = require("mongodb").ObjectID;

// DATABASE CONNECTION //

MongoClient.connect(URL, function(err, db) {
  assert.equal(null, err);
  console.log("Connected. Listening through: http://localhost:3000");
  var database = db.db("onlinestore");
  database
    .collection("products")
    .find({})
    .toArray(function(err, element) {
      db.close();
    });
});

// PRODUCT LIST //

app.get("/", function(req, res) {
  MongoClient.connect(URL, function(err, db) {
    assert.equal(null, err);
    var database = db.db("onlinestore");
    database
      .collection("products")
      .find({})
      .toArray(function(err, element) {
        var products_list = "";
        var table =
          '	<table>\
				<tr>\
					<th>ID</th>\
					<th>Name</th>\
					<th>Price</th>\
					<th>Category</th>\
				</tr>';
        element.forEach(function(object) {
          var id = "<tr><td>" + object._id + "</td>";
          var name = "<td>" + object.product_name + "</td>";
          var price = "<td>" + object.price + "</td>";
          var category = "<td>" + object.category + "</td>";
          product_id = object._id;
          var button_edit =
            "<td><a href=http://localhost:3000/modify/" +
            product_id +
            ">Edit</a></td>";
          var button_delete =
            "<td><a href=http://localhost:3000/delete/" +
            product_id +
            ">Delete</a></td></tr>";
          var table =
            id + name + price + category + button_edit + button_delete;
          products_list = products_list + table;
        });
        var button_add =
          '</table><br><br><br><a href="http://localhost:3000/add">Add Product</a>';
        var table = table + products_list + button_add;
        fs.readFile("index.html", "utf8", (err, data) => {
          if (err) {
            console.log(err);
            return err;
          } else {
            res.send(data + table);
          }
        });
        db.close();
      });
  });
});

// NEW PRODUCT FORM //

app.get("/add", function(req, res) {
  var form =
    '<form method="POST">\
	<label for="name">Product Name</label>\
	<input type="text" name="name">\
	<br>\
	<label for="price">Price</label>\
	<input type="text" name="price">\
	<br>\
	<label for="category">Category</label>\
	<input type="text" name="category">\
	<br>\
	<input type="submit" value="Add">\
	</form>';
  fs.readFile("index.html", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return err;
    } else {
      res.send(data + form);
    }
  });
});

// NEW PRODUCT ADDITION //

app.post("/add", URLencodeParser, function(req, res) {
  var name = req.body.name;
  var price = req.body.price;
  var category = req.body.category;

  MongoClient.connect(URL, function(err, db) {
    if (err) throw err;
    var database = db.db("onlinestore");
    var product = {
      product_name: name,
      price: price,
      category: category
    };
    database.collection("products").insertOne(product, function(err, res) {
      if (err) throw err;
      console.log("Product added successfully.");
      db.close();
    });
    res.redirect("/");
  });
});

// DELETE PRODUCT //

app.get("/delete/:id", function(req, res) {
  var product_id = req.params.id;

  MongoClient.connect(URL, function(err, db) {
    if (err) throw err;
    var database = db.db("onlinestore");
    var consulta = { _id: product_id };
    database.collection("products").deleteOne({ _id: new ObjectID(product_id) });
    res.redirect("/");
  });
});

// MODIFY PRODUCT FORM //

app.get("/modify/:id", function(req, res) {
  var product_id = req.params.id;
  MongoClient.connect(URL, function(err, db) {
    if (err) throw err;
    var database = db.db("onlinestore");
    database
      .collection("products")
      .findOne({ _id: new ObjectID(product_id) }, function(err, element) {
        var modify =
          '<form method="POST" action="http://localhost:3000/modify/' +
          [product_id] +
          '">\
					<label for="name">Product Name</label>\
					<input type="text" name="name" value="' +
          element["product_name"] +
          '">\
					<br>\
					<label for="price">Price</label>\
					<input type="text" name="price" value="' +
          element["price"] +
          '">\
					<br>\
					<label for="category">Category</label>\
					<input type="text" name="category" value="' +
          element["category"] +
          '">\
					<br>\
					<input type="submit">\
					</form>';

        fs.readFile("index.html", "utf8", (err, data) => {
          if (err) {
            console.log(err);
            return err;
          } else {
            res.send(data + modify);
          }
        });
      });
  });
});

// PRODUCT MODIFICATION //

app.post("/modify/:id", URLencodeParser, function(req, res) {
  var product_id = req.params.id;

  var name = req.body.name;
  var price = req.body.price;
  var category = req.body.category;

  MongoClient.connect(URL, function(err, db) {
    if (err) throw err;
    var database = db.db("onlinestore");
    var jsquery = { _id: new ObjectID(product_id) };
    var newvalues = {
      $set: { product_name: name, price: price, category: category }
    };
    database
      .collection("products")
      .updateOne(jsquery, newvalues, function(err, result) {
        res.redirect("/");
      });
  });
});

// SERVER //

app.use(function(req, res) {
  res.sendStatus(404);
});

var server = app.listen(3000, function() {
  console.log("SERVER STATUS: ONLINE");
});
