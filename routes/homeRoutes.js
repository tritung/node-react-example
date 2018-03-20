module.exports = app => {
  app.get("/home", (req, res) => {
    res.send({ hi: "Nice to meet you!" });
  });
};
