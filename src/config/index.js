require("dotenv").config();

const dev = {
  app: {
    serverPort: process.env.SERVER_PORT || 3000,
    jwtSecretKey: process.env.JWT_SECRET_KEY || "aliujebrh",
    jwtAuthorizationKey: process.env.JWT_AUTHORIZATION_KEY || "lirughew9r",
    smtpUsername: process.env.SMTP_USERNAME,
    smtpPassword: process.env.SMTP_PASSWORD,
    clientUrl: process.env.CLIENT_URL,
    sessionSecretKey: process.env.SESSION_SECRET_KEY,
  },
  db: {
    dbURL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/user-admin-db",
  },
};

module.exports = dev;
