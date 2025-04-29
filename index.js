const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const config = require("./config/config");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อ MongoDB
connectDB();

app.get("/", (req, res) => {
  res.send(`
      <h1>Welcome to the API!</h1>
      <p>Version: 1.0.0</p>
      <p>Endpoints:</p>
      <ul>
        <li>GET /api/products - Get all products</li>
        <li>POST /api/products - Create a new product</li>
      </ul>
      <p>Documentation: <a href="http://wnimqo.easypanel.host:3000/docs">here</a></p>
    `);
});

// เริ่มเซิร์ฟเวอร์
app.listen(config.port, () =>
  console.log(`API running on port ${config.port}`)
);
