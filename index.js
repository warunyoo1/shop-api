const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("./config/config");
const routes = require('./routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อ MongoDB
connectDB();

app.get("/check", (req, res) => {
  console.log("Response  check");
  res.status(200).json({
    status: 200,
    success: true,
    data: "API v 1.0 is running",
  });
  return;
});

app.use('/api', routes);

// เริ่มเซิร์ฟเวอร์
app.listen(config.port, () =>
  console.log(`API running on port ${config.port}`)
);
