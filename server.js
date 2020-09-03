const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

mongoose.connect(
  process.env.MONGO_CLIENT,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  },
  () => console.log("DB connected 🦥")
);

// DB Pagination Function
const paginatedResults = (model) => {
  return async (req, res, next) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await model.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    try {
      results.result = await model
        .find({})
        .limit(limit)
        .skip(startIndex)
        .exec();

      res.paginatedResults = results;

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};

app.get("/posts", paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults);
});

app.get("/users", paginatedResults(User), (req, res) => {
  res.json(res.paginatedResults);
});

app.listen(3000, () => console.log("App running on PORT:3000 "));
