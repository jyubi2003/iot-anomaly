import React, { Component } from 'react';
import Ring from "ringjs";

import {
  TimeSeries,
  TimeRange,
  TimeEvent,
  Pipeline as pipeline,
  Stream,
  EventOut,
  percentile
} from "pondjs";

import {
  Charts,
  ChartContainer,
  ChartRow,
  YAxis,
  LineChart,
  BarChart,
  ScatterChart,
  Resizable,
  Legend
} from "react-timeseries-charts";

import styler from "./styler.js";

const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;
const day = 24 * hours;
const rate = 80;

class WeeklyBarChart extends Component {
  static displayName = "WeeklyBarChart";

  state = {
    time: new Date(2015, 0, 1),
    events: new Ring(600),
    percentile50Out: new Ring(300),
    percentile90Out: new Ring(300)
  };

  getNewEvent = t => {
    const base = Math.sin(t.getTime() / 10000000) * 350 + 400;
    return new TimeEvent(t, parseInt(base + Math.random() * 1000, 10));
  };

  componentDidMount() {
    //
    // Setup our aggregation pipelines
    //

    this.stream = new Stream();

    pipeline()
      .from(this.stream)
      .windowBy("5m")
      .emitOn("discard")
      .aggregate({
          value: { value: percentile(90) }
      })
      .to(EventOut, event => {
          const events = this.state.percentile90Out;
        events.push(event);
        this.setState({ percentile90Out: events });
      });

    pipeline()
      .from(this.stream)
      .windowBy("5m")
      .emitOn("discard")
      .aggregate({
          value: { value: percentile(50) }
      })
      .to(EventOut, event => {
        const events = this.state.percentile50Out;
        events.push(event);
        this.setState({ percentile50Out: events });
      });

    //
    // Setup our interval to advance the time and generate raw events
    //

    const increment = minute;
    this.interval = setInterval(() => {
      const t = new Date(this.state.time.getTime() + increment);
      const event = this.getNewEvent(t);

      // Raw events
      const newEvents = this.state.events;
      newEvents.push(event);
      this.setState({ time: t, events: newEvents });

      // Let our aggregators process the event
      this.stream.addEvent(event);
    }, rate);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const latestTime = `${this.state.time}`;

    const fiveMinuteStyle = {
        value: {
            normal: { fill: "#619F3A", opacity: 0.2 },
            highlight: { fill: "619F3A", opacity: 0.5 },
            selected: { fill: "619F3A", opacity: 0.5 }
        }
    };

    const scatterStyle = {
        value: {
            normal: {
                opacity: 0.5
            }
        }
    };

    //
    // Create a TimeSeries for our raw, 5min and hourly events
    //

    const eventSeries = new TimeSeries({
      name: "raw",
      events: this.state.events.toArray()
    });

    const perc50Series = new TimeSeries({
        name: "five minute perc50",
        events: this.state.percentile50Out.toArray()
    });

    const perc90Series = new TimeSeries({
        name: "five minute perc90",
        events: this.state.percentile90Out.toArray()
    });

    // Timerange for the chart axis
    const initialBeginTime = new Date(2015, 0, 1);
    const timeWindow = 2 * hours;

    let beginTime;
    const endTime = new Date(this.state.time.getTime() + minute);
    if (endTime.getTime() - timeWindow < initialBeginTime.getTime()) {
      beginTime = initialBeginTime;
    } else {
      beginTime = new Date(endTime.getTime() - timeWindow);
    }
    const timeRange = new TimeRange(beginTime, endTime);

    // Charts (after a certain amount of time, just show hourly rollup)
    const charts = (
      <Charts>
        <BarChart
            axis="y"
            series={perc90Series}
            style={fiveMinuteStyle}
            columns={["value"]}
        />
        <BarChart
            axis="y"
            series={perc50Series}
            style={fiveMinuteStyle}
            columns={["value"]}
        />
        </Charts>
    );

    const dateStyle = {
        fontSize: 12,
        color: "#AAA",
        borderWidth: 1,
        borderColor: "#F4F4F4"
    };

    const style = styler([
        { key: "perc50", color: "#C5DCB7", width: 1, dashed: true },
        { key: "perc90", color: "#DFECD7", width: 2 }
    ]);

    return (
      <div className="graph">
        <Resizable>
          <ChartContainer timeRange={timeRange}>
            <ChartRow height="300">
              <YAxis
                id="y"
                label="Value"
                min={0}
                max={1500}
                width="70"
                type="linear"
              />
              {charts}
            </ChartRow>
          </ChartContainer>
        </Resizable>
      </div>
    );
  }
}

export default WeeklyBarChart;
