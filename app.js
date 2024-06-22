const bodyParser = require("body-parser");
const cluster = require("cluster");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");

const MongoStore = require("connect-mongo");

dotenv.config({ path: path.join(__dirname, ".env") });
const CLUSTER_COUNT = require("os").cpus().length;

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);

  for (let i = 0; i < CLUSTER_COUNT; i++) cluster.fork();

  cluster.on("exit", (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const app = express();
  const server = http.createServer(app);

  const PORT = process.env.PORT || 3000;
  const MONGODB_URI =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/test";

  mongoose.set("strictQuery", false);
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  //REMOVE IF SESSION IS NOT USED
  const sessionOptions = session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
    }),
  });

  app.use(cookieParser());
  app.use(sessionOptions);

  const authRoutes = require("./routes/auth");
  const placeholderRoutes = require("./routes/placeholder");

  app.use("/auth", authRoutes);
  app.use("/placeholder", placeholderRoutes);

  app.get("/", (req, res) => {
    res.status(200).json({ session: req.session });
  });

  server.listen(PORT, () => {
    console.log(
      `Server is on port ${PORT} as Worker ${cluster.worker.id} running @ process ${cluster.worker.process.pid}`
    );

    //UNQUOTE IT IF CRON IS USED
    // if (CLUSTER_COUNT == 1 || cluster.worker.id % CLUSTER_COUNT == 1)
    //   Job.start(() => {
    //     console.log(`Cron Jobs are started on Worker ${cluster.worker.id}`);
    //   });
  });
}
