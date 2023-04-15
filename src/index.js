const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser")
const dev = require("./config");
const connectDB = require("./config/db");
const userRouter = require("./routes/users");

const app = express();

const PORT = dev.app.serverPort;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/users", userRouter)

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await connectDB();
});