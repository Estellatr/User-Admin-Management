const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser")
const dev = require("./config");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/users");
const adminRouter = require("./routes/admin")

const app = express();

const PORT = dev.app.serverPort;

app.use(cookieParser());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/users", userRouter)

app.use("/api/admin", adminRouter);

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  await connectDB();
});