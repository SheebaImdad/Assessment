const trimRequest = require("trim-request");
const constant = require("../config/constant");

class Routes {
  constructor(app) {
    this.app = app;
  }

  /* creating app Routes starts */
  appRoutes() {
    this.app.use(
      constant.ENDPOINTS.BASE_URL,
      trimRequest.all,
      require("./user.routes")
    );
    this.app.use(
      constant.ENDPOINTS.BASE_URL,
      trimRequest.all,
      require("./questions.routes")
    );
    this.app.use(
      constant.ENDPOINTS.BASE_URL,
      trimRequest.all,
      require("./category.routes")
    );
  }

  routesConfig() {
    this.appRoutes();
  }
}

module.exports = Routes;
