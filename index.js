const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const Todo = require("./models/todo");

const app = express();
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

mongoose.connect("mongodb://127.0.0.1:27017/TodoDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.error(err));


// GET ALL TODOS (supports query filtering)
app.get("/todos", async (req, res) => {
  try {

    const filter = {};

    if (req.query.completed !== undefined) {
      filter.completed = req.query.completed === "true";
    }

    const todos = await Todo.find(filter);

    res.json(todos);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// GET TODO BY ID
app.get("/todos/:id", async (req, res) => {
  try {

    const todo = await Todo.findById(req.params.id);

    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(todo);

  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});


// CREATE TODO
app.post("/todos", async (req, res) => {
  try {

    if (!req.body.task || req.body.task.length < 3) {
      return res.status(400).json({
        error: "Task must be at least 3 characters"
      });
    }

    const todo = new Todo({
  task: req.body.task,
  completed: req.body.completed ?? false 
});

    const saved = await todo.save();

    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// UPDATE TODO
app.put("/todos/:id", async (req, res) => {
  try {

    const updated = await Todo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});


// DELETE TODO
app.delete("/todos/:id", async (req, res) => {
  try {

    const deleted = await Todo.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Todo not found" });
    }

    res.json({ message: "Todo deleted" });

  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});


// Global error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: "Server error!" });
});


// Server start
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});