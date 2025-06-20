const { google } = require("googleapis");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});

oauth2Client.on("tokens", (tokens) => {
  console.log("New tokens:", tokens); 
});

const drive = google.drive({ version: "v3", auth: oauth2Client });

module.exports = drive;
