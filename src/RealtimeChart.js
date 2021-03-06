import React, { Component } from 'react';
import Ring from "ringjs";
import Modal from 'react-modal';

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
const rate = 80;

class RealtimeChart extends Component {
  static displayName = "AggregatorDemo";

  constructor(props) {
    super(props);

    this.state = {
      time: new Date(2015, 0, 1),
      events: new Ring(600),
      percentile50Out: new Ring(300),
      percentile90Out: new Ring(300),
      modalIsOpen: false,
      graphBGColor: '#fff'
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
    // references are now sync'd and can be accessed.
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({modalIsOpen: false});
    this.setState({graphBGColor: '#f00'});
  }

  doError() {
    this.setState({graphBGColor: '#f77'});
  }

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
                opacity: 0.5,
                background: this.state.graphBGColor
            }
        }
    };

    // Style for Modal
    const customStyles = {
      content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)'
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
            <LineChart axis="y" series={eventSeries} style={scatterStyle} />
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
        <button onClick={this.openModal}>Do Open</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          <h1 ref={subtitle => this.subtitle = subtitle}>Abnormal prediction</h1>
          <hr />
          <form>
            <div id="nav">
              <table>
                  <tr>
                    <td><img className="dlg-img" src="./wave1.png" /></td>
                    <td className="dlg-desc">正常</td>
                  </tr>
                  <tr>
                    <td><img className="dlg-img" src="./wave2.png" /></td>
                    <td className="dlg-desc"><a href="Detail">異常A(90%)</a></td>
                  </tr>
                  <tr>
                    <td><img className="dlg-img" src="./wave3.png" /></td>
                    <td className="dlg-desc"><a href="Detail2">異常B(70%)</a></td>
                  </tr>
              </table>
            </div>
            <button onClick={this.closeModal}>close</button>
          </form>
        </Modal>
        <Resizable>
          <ChartContainer
            timeRange={timeRange}
            enablePanZoom={true}
            onTimeRangeChanged={this.openModal}
          >
            <ChartRow height="300">
              <YAxis
                id="y"
                label="Sensor Detected Value "
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

export default RealtimeChart;
