
const express = require("express");

const app = express();

// Import routes
const photographersRouter = require("./routes/photographers");
const camerasRouter = require("./routes/cameras");
const rentalsRouter = require("./routes/rentals");

// Middleware
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to LensLab Studio Camera Rental System");
});

// Photographer routes
app.use("/photographers", photographersRouter);

// Camera routes
app.use("/cameras", camerasRouter);

// Rental routes
app.use("/rentals", rentalsRouter);

// Export app
module.exports = app;
