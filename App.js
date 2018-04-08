import React, { Component } from 'react';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";
import logo from './logo.svg';
import { TimeSeries, TimeRange } from "pondjs";

const data = {
    name: "traffic",
    columns: ["time", "in", "out"],
    points: [
        [1400425947000, 52, 41],
        [1400425948000, 18, 45],
        [1400425949000, 26, 49],
        [1400425950000, 93, 81],
    ]
};
const series1 = new TimeSeries(data);

const data2 = {
    name: "traffic",
    columns: ["time", "in", "out"],
    points: [
        [1400425947000, 25, 20],
        [1400425948000, 9, 22],
        [1400425949000, 13, 26],
        [1400425950000, 46, 41],
    ]
};
const series2 = new TimeSeries(data2);

class App extends Component {
  render() {
    return (
      <div className="App">
        <ChartContainer timeRange={series1.timerange()} width={800}>
            <ChartRow height="200">
                <YAxis id="axis1" label="AUD" min={0.5} max={1.5} width="60" type="linear" format="$,.2f"/>
                <Charts>
                    <LineChart axis="axis1" series={series1}/>
                    <LineChart axis="axis2" series={series2}/>
                </Charts>
                <YAxis id="axis2" label="Euro" min={0.5} max={1.5} width="80" type="linear" format="$,.2f"/>
            </ChartRow>
        </ChartContainer>
      </div>
    );
  }
}

export default App;
