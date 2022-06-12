const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Student = require("./modules/student");
const methodOverride = require("method-override");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((e) => {
    console.log("Connection field.");
    console.log(e);
  });

app.get("/", (req, res, next) => {
  res.send("This is homepage.");
});

app.get("/students", async (req, res) => {
  // res.send("This is students page.");
  try {
    let data = await Student.find();
    res.render("students.ejs", { data });
  } catch {
    res.send("Error with finding data.");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  //   console.log(req.params);
  //   res.send("hello");
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("studentPage.ejs", { data });
    } else {
      res.send("Cannot find this student. Please enter a valid id.");
    }
  } catch (e) {
    console.log("Error!");
    console.log(e);
  }
});

app.post("/students/insert", (req, res) => {
  //   console.log(req.body);   // output: { id: '1', name: 'Karla', age: '22', merit: '2000', other: '10000' }
  //   res.send("Thanks for posting.");
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.render("accept.ejs");
    })
    .catch((e) => {
      console.log("Student not accepted.");
      console.log(e);
      res.render("reject.ejs");
    });
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Student.findOne({ id });
    if (data !== null) {
      res.render("edit.ejs", { data });
      // console.log(data);
    } else {
      res.send("Cannot find student");
    }
  } catch {
    res.send("Error");
  }
});

app.put("/students/edit/:id", async (req, res) => {
  // let { id } = req.params;
  let { id, name, age, merit, other } = req.body;
  // console.log(req.body);
  // res.send("Thanks for sending put request");
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render("reject.ejs");
  }
});

// delete 這邊有用 Postman 輔助
app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      res.send("Deleted successfully");
    })
    .catch((e) => {
      console.log(e);
      res.send("Delete failed.");
    });
});

app.get("/*", (req, res) => {
  res.status(404);
  res.send("Not allowed");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
