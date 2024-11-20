const express = require("express");
const AppConfig = require("./config/app-config");
const Routes = require("./routes");
const constant = require("./config/constant");
const logger = require("loglevel");
const bodyParser = require("body-parser");
const { DbHelper } = require("./helper/dbHelper");
const helmet = require("helmet");
const dbInstance = new DbHelper();

const app = express();

app.use(
  require("cors")({
    origin: constant.ALLOWED_ORIGINS,
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  })
);

app.use(helmet());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function appConfig() {
  new AppConfig(app).includeConfig();
}

/* Including app Routes starts */
function includeRoutes() {
  logger.warn("inside routes");
  new Routes(app).routesConfig();
}
/* Including app Routes ends */

function startTheServer() {
  appConfig();
  includeRoutes();
  dbInstance.connect();
  const port = constant.NODE_SERVER_PORT || 3005;

  app.listen(port, () => {
    logger.warn(`Listening on http://localhost:3005`);
  });
}

startTheServer();
