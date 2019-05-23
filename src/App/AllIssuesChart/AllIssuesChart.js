
import React from 'react';
import withAllCardOnBoardData from '../../hoc/withAllCardOnBoardData';
import './AllIssuesChart.css';
import Chart from 'react-chartist';
import Chartist from 'chartist';


export class AllIssuesChart {

  state = {}

  render() {
    console.log(this.props.boardIssueData);

    return (
      <Chart type="Line" data={this.data} options={this.options} />
    );
  }
}

export default withAllCardOnBoardData([])(AllIssuesChart);

