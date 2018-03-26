//SurveyForm show a form for a user to add input
import _ from "lodash";
import React, { Component } from "react";
import { reduxForm, Field } from "redux-form";
import SurveyField from "./SurveyField";
import { Link } from "react-router-dom";

const FIELDS = [
  { name: "title", label: "Survey Title" },
  { name: "subject", label: "Subject Line" },
  { name: "body", label: "Email Body" },
  { name: "emails", label: "Recipient List" }
];

class SurveyForm extends Component {
  renderField() {
    return _.map(FIELDS, ({ label, name }) => {
      return (
        <Field
          key={name}
          type="text"
          component={SurveyField}
          label={label}
          name={name}
        />
      );
    });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmit(values => console.log(values))}>
          {this.renderField()}
          <Link
            to="/surveys"
            className="red btn-flat left white-text waves-effect waves-light"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="teal btn-flat right white-text waves-effect waves-light"
          >
            <i className="material-icons right">done</i>
            Next
          </button>
        </form>
      </div>
    );
  }
}

export default reduxForm({
  form: "surveyForm"
})(SurveyForm);
