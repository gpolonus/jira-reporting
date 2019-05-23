
import React, { Component } from 'react';
import { jiraQuery } from '../services/JiraRequest';

export default (fields) => (Comp) =>
  class extends Component {

    state = {}

    componentDidMount() {
      jiraQuery()
        .board(13)
        .issues()
        .changelog(true)
        .execute()
        .then(response => {
          console.log(response);
        });
    }

    formatData() {

    }

    render() {
      if(this.state.data) {
        return <Comp {...this.props} boardIssueData={this.state.data} />;
      } else {
        return <span>Loading ... </span>;
      }
    }
  };

