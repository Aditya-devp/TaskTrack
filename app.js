const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("underscore");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
});
const itemsSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemsSchema);

const defaultItems = [];

const listSchema =new mongoose.Schema( {
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  let today = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  let day = today.toLocaleDateString("en-US", options);
  Item.find({})
    .then(function (foundItems) {
      Item.insertMany(defaultItems)
        .then(function () {
          console.log("Successfully saved into our DB.");
        })
        .catch(function (err) {
          console.log(err);
        });

      res.render("list", { listTitle: day, newListItem: foundItems });
    })
    .catch(function (err) {
      console.log(err);
    });
});
app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
  const capcustomListName = customListName.charAt(0).toUpperCase() + customListName.slice(1);

  List.findOne({ name: capcustomListName })
    .then(foundList => {
      if (!foundList) {
        
        const list = new List({
          name: capcustomListName,
          items: defaultItems
        });
        return list.save();
      } else {
       
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
    })
    .then(() => {
      res.redirect("/" + capcustomListName);
    })
    .catch(err => {
     
      console.error(err);
    });
});



app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  console.log(listName);
  const item = new Item({
    name: itemName,
  });
  const currentDate = new Date();
  const okday = currentDate.toLocaleDateString("en-US", { weekday: "long"});
  console.log(okday);

  if (listName === okday+","){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({ name: listName })
  .then((foundList) => {
    foundList.items.push(item);
    return foundList.save();
  })
  .then(() => {
    res.redirect("/" + listName);
  })
  .catch((err) => {

    console.error(err);
  });

  }
 
});


app.post("/delete", function (req, res) {
  const checkid = req.body.checkbox;
  const listName = req.body.listName;
  let ntoday = new Date();
  let options = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  let aday = ntoday.toLocaleDateString("en-US", options);

  console.log(listName);
  console.log(aday);
  if (listName === aday){
  Item.findByIdAndRemove(checkid)
    .then(function () {
      console.log("Deletion successful");
    })
    .catch(function (err) {
      console.log(err);
    });
  res.redirect("/");
  }
  else{
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkid } } })
  .then(foundList => {
    res.redirect("/" + listName);
  })
  .catch(err => {
    console.error(err);

  });
  }
});
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
