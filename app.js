const path = require("path");
require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const dbConnection = require("./config/dbConnection");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const mountedRoutes = require("./routes");

const app = express();

console.log(`environment --->> ${process.env.NODE_ENV}`);

/// MiddleWares
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

// Routes
mountedRoutes(app)

app.all("*", (req, res, next) =>
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400))
);

// handle error for express
app.use(globalError);

/// Server Connection
const port = process.env.DB_PORT || 8000;
const server = app.listen(port, () =>
  console.log(`Server listening on port ${port}`)
);

/// DB Connection
dbConnection();

/// handle errors outside express

process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => process.exit(1));
});
