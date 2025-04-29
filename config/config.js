const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apiKey: process.env.API_KEY || 'your-secret-key', 
  port: process.env.PORT || 3000, 
  mongoUri: process.env.MONGO_URI , 
};