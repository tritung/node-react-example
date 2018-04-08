const _ = require("lodash");
const { Path } = require("path-parser");
const { URL } = require("url");
const mongoose = require("mongoose");
const requireLogin = require("../middlewares/requireLogin");
const requireCredits = require("../middlewares/requireCredits");
const surveyTemplate = require("../services/emailTemplate/surveyTemplate");
const Mailer = require("../services/Mailer");
const Survey = mongoose.model("surveys");

module.exports = app => {
  app.get("/api/surveys/:surveyId/:choice", (req, res) => {
    res.send("Thanks for voting!");
  });

  app.post("/api/surveys/webhook", (req, res) => {
    console.log(req.body);
    const p = new Path("/api/surveys/:surveyId/:choice");
    _.chain(req.body)
      .map(({ email, url }) => {
        const match = p.test(new URL(url).pathname);
        if (match) {
          return {
            email,
            surveyId: match.surveyId,
            choice: match.choice
          };
        }
      })
      .compact()
      .uniqBy("email", "surveyId")
      .each(({ email, surveyId, choice }) => {
        Survey.updateOne(
          {
            _id: surveyId,
            recipients: {
              $elemMatch: { email: email, responded: false }
            }
          },
          {
            $inc: { [choice]: 1 },
            $set: { "recipients.$.responded": true },
            lastResponded: new Date()
          }
        ).exec();
      })
      .value();

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

  app.get("/api/surveys", requireLogin, async (req, res) => {
    const surveys = await Survey.find({
      _user: req.user.id
    }).select({ recipients: false });
    res.send(surveys);
  });

  app.get("/api/surveys/:surveyId", requireLogin, async (req, res) => {
    console.log(req.params);
    const survey = await Survey.findById({
      _id: req.params.surveyId
    });
    res.send(survey);
  });
};
