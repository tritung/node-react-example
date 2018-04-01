const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const surveyTemplate = require("../services/emailTemplate/surveyTemplate");
const Mailer = require("../services/Mailer");
const Survey = mongoose.model("surveys");

module.exports = app => {
  app.get("/api/surveys/thanks", (req, res) => {
    res.send("Thanks for voting!");
  });

  app.post("/api/surveys/webhook", (req, res) => {
    console.log(req.body);
    res.send({});
  });

  app.post("/api/surveys", requireLogin, requireCredits, async (req, res) => {
    const { title, subject, body, recipients } = req.body;
    const survey = new Survey({
      title,
      body,
      subject,
      recipients: recipients.split(",").map(email => ({ email: email.trim() })),
      dateSent: Date.now(),
      _user: req.user.id
    });

    //Greate place to send an email
    const mailer = new Mailer(survey, surveyTemplate(survey));
    try {
      const response = await mailer.send();
      await survey.save();
      req.user.credits -= 1;
      const user = await req.user.save();

      res.send(user);
    } catch (error) {
      res.status(422);
    }
  });
};
