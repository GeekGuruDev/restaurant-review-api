require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");

const restaurantRoutes = require("./routes/restaurantRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const locationRoutes = require("./routes/locationRoutes");
const cuisineRoutes = require("./routes/cuisineRoutes");
const connectDB = require("./config/mongoose");
const errorHandler = require("./errors/errorHandler");
const { NotFoundError } = require("./errors/customeErrors");

const PORT = process.env.PORT || 3000;

const app = express();

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use("/api/restaurants", restaurantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/cuisines", cuisineRoutes);

app.all("*", (req, res, next) => {
  next(new NotFoundError(`Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
