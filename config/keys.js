if (process.env.NODE_ENV === "production") {
  //production enviroment
  module.exports = require("./prod");
} else {
  //dev enviroment
  module.exports = require("./dev");
}
