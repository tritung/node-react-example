var localtunnel = require("localtunnel");
localtunnel(5000, { subdomain: "tungtruong91" }, function(err, tunnel) {
  console.log("LT running");
});
