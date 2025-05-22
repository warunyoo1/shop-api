const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  apiKey: process.env.API_KEY || 'your-secret-key', 
  port: process.env.PORT || 3000, 
  mongoUri: process.env.MONGO_URI , 
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  }
};