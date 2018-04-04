import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// eslint-disable-next-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import {LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
// eslint-disable-next-line
import injectTapEventPlugin from 'react-tap-event-plugin';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import AppBar from 'material-ui/AppBar';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import ReactSpeedometer from "react-d3-speedometer";
import {List, ListItem} from 'material-ui/List';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ActionOpacity from 'material-ui/svg-icons/action/opacity';
import ActionSchedule from 'material-ui/svg-icons/action/schedule';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';
import ContentSend from 'material-ui/svg-icons/content/send';
import Business from 'material-ui/svg-icons/communication/business';
import ClearAll from 'material-ui/svg-icons/communication/clear-all';
import Subheader from 'material-ui/Subheader';
import {Tabs, Tab} from 'material-ui/Tabs';

import _ from "underscore";
import { format } from "d3-format";
import moment from "moment";

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

import ChartContainer from "react-timeseries-charts";
import ChartRow from "react-timeseries-charts";
import Charts from "react-timeseries-charts";
import YAxis from "react-timeseries-charts";
import ScatterChart from "react-timeseries-charts";
import BarChart from "react-timeseries-charts";
import Resizable from "react-timeseries-charts";
import Legend from "react-timeseries-charts";
import styler from "react-timeseries-charts";

// We can just import Slider or Range to reduce bundle size
// import Slider from 'rc-slider/lib/Slider';
// import Range from 'rc-slider/lib/Range';

// Test data
import monthlyJSON from "./total_traffic_6mo.json";

import './index.css';

// realtime
const sec = 1000;
const minute = 60 * sec;
const hours = 60 * minute;
const rate = 80;


class ListNested extends React.Component {
  state = {
    open: false,
  };

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  };

  handleNestedListToggle = (item) => {
    this.setState({
      open: item.state.open,
    });
  };

  render() {
    return (
      <div>
        <List style={{fontSize: '100%',}}>
          <Subheader>{this.props.subheader}</Subheader>
          <ListItem
            primaryText={this.props.title}
            leftIcon={<Business />}
          />
          <ListItem
            style={{fontSize: '100%',}}
            primaryText="ラインA"
            leftIcon={<ClearAll />}
            initiallyOpen={true}
            primaryTogglesNestedList={true}
            nestedItems={[
              <ListItem
                key={1}
                primaryText="センサー1"
                leftIcon={<ActionGrade />}
              />,
              <ListItem
                key={2}
                primaryText="センサー2"
                leftIcon={<ActionOpacity />}
              />,
              <ListItem
                key={3}
                primaryText="センサー3"
                leftIcon={<ActionSchedule />}
              />,
            ]}
          />
          <ListItem
            primaryText="ラインB"
            leftIcon={<ClearAll />}
            initiallyOpen={false}
            primaryTogglesNestedList={true}
            nestedItems={[
              <ListItem
                key={1}
                primaryText="センサー1"
                leftIcon={<ActionGrade />}
              />,
              <ListItem
                key={2}
                primaryText="センサー2"
                leftIcon={<ActionOpacity />}
              />,
            ]}
          />
        </List>
      </div>
    );
  }
}

class Selections extends React.Component {
  handleChange1 = (event, index, value) => this.props.onSelectChange1({value});
  handleChange2 = (event, index, value) => this.props.onSelectChange2({value});
  handleChange3 = (event, index, value) => this.props.onSelectChange3({value});

  render() {
    return (
      <div className="selections">
        <ListNested
          subheader="Monitor Site Group A"
          title="工場A"
        />
        <ListNested
          subheader="Monitor Site Group B"
          title="工場B"
        />
      </div>
    );
  }
}

// タブエリア
class TabArea extends React.Component {
  render() {
    return (
      <div className="tab">
        <Tabs>
          <Tab label="ラインA" >
            <div>
            </div>
          </Tab>
          <Tab
            label="ダッシュボード"
            data-route="/"
          >
            <div>
            </div>
          </Tab>
        </Tabs>
      </div>
    );
  }
}

// グラフエリア

class realtime extends React.Component {
  static displayName = "AggregatorDemo";

  state = {
    time: new Date(2015, 0, 1),
    events: new Ring(200),
    percentile50Out: new Ring(100),
    percentile90Out: new Ring(100)
  };

  getNewEvent = t => {
    const base = Math.sin(t.getTime() / 10000000) * 350 + 500;
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
          fill: "steelblue",
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
    const timeWindow = 3 * hours;

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
        <ScatterChart axis="y" series={eventSeries} style={scatterStyle} />
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
      <div>
        <div className="row">
          <div className="col-md-4">
            <Legend
              type="swatch"
              style={style}
              categories={[
                {
                  key: "perc50",
                  label: "50th Percentile",
                  style: { fill: "#C5DCB7" }
                },
                {
                  key: "perc90",
                  label: "90th Percentile",
                  style: { fill: "#DFECD7" }
                }
              ]}
            />
          </div>
          <div className="col-md-8">
            <span style={dateStyle}>{latestTime}</span>
          </div>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-12">
            <Resizable>
              <ChartContainer timeRange={timeRange}>
                <ChartRow height="150">
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
        </div>
      </div>
    );
  }
}

/*
class SimpleAreaChart extends React.Component {
  render () {
    const currentSeries = this.props.series;

    return (
      <div className="graph">
        <p style={{textDecoration: "underline", fontSize: "1.0vw"}}>センサーデータ</p>
        <ResponsiveContainer width="100%" height="95%">
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" type="category" allowDuplicatedCategory={false} />
            <YAxis dataKey="value"/>
            <Tooltip/>
            <Legend />
            {currentSeries.map(s => (
              <Line dataKey="value" data={s.data} name={s.name} key={s.name} stroke={s.stroke} strokeWidth={2} dot={{ strokeWidth: 2, r: 1}} strokeDasharray={s.strokeDasharray}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
*/

// BarChart
const trafficPoints = [];
const interfacesJSON = require("./interface-traffic.json");
const interfaceKey = "ornl-cr5::to_ornl_ip-a::standard";
const days = interfacesJSON[interfaceKey].days;

let max = 0;
_.each(days, (value, day) => {
    const dayOfMonth = Number(day);
    const volIn = value.in;
    const volOut = value.out;

    // Max
    max = Math.max(max, value.in);
    max = Math.max(max, value.out);

    trafficPoints.push([`2014-10-${dayOfMonth}`, volIn, volOut]);
});

const octoberTrafficSeries = new TimeSeries({
    name: "October Traffic",
    utc: false,
    columns: ["index", "in", "out"],
    points: trafficPoints
});

max /= 100;

//
// October 2014 net daily traffic for multiple interfaces
//

const netTrafficPoints = [];
const interfaceKeys = [
    "lbl-mr2::xe-8_3_0.911::standard",
    "pnwg-cr5::111-10_1_4-814::sap",
    "denv-cr5::to_denv-frgp(as14041)::standard"
];
const octoberDays = interfacesJSON[interfaceKeys[0]].days;

let maxTotalTraffic = 0;
let minTotalTraffic = 0;
_.each(octoberDays, (ignoreValue, day) => {
    const dayOfMonth = Number(day);
    const netTrafficForDay = [`2014-10-${dayOfMonth}`];
    let maxDay = 0;
    let minDay = 0;
    _.each(interfaceKeys, interfaceKey => {
        let value = interfacesJSON[interfaceKey].days[dayOfMonth];
        let netTraffic = value.out - value.in;
        netTrafficForDay.push(netTraffic);
        if (netTraffic > 0) {
            maxDay += netTraffic;
        } else {
            minDay += netTraffic;
        }
    });
    maxTotalTraffic = Math.max(maxTotalTraffic, maxDay);
    minTotalTraffic = Math.min(minTotalTraffic, minDay);
    netTrafficPoints.push(netTrafficForDay);
});

const netTrafficColumnNames = ["index"];
_.each(interfaceKeys, interfaceKey => {
    netTrafficColumnNames.push(interfaceKey.split(":")[0]);
});

const octoberNetTrafficSeries = new TimeSeries({
    name: "October Net Traffic",
    utc: false,
    columns: netTrafficColumnNames,
    points: netTrafficPoints
});

// Correct for measurement error on October 10th
maxTotalTraffic /= 150;
minTotalTraffic /= 10;

//
// ESnet wide monthy traffic summary (part of 2014)
//

const routerData = {};
_.each(monthlyJSON, router => {
    const routerName = router["Router"];
    if (routerName) {
        routerData[routerName] = {
            accepted: [],
            delivered: []
        };
        _.each(router, (traffic, key) => {
            if (key !== "Router") {
                const month = key.split(" ")[0];
                const type = key.split(" ")[1];
                if (type === "Accepted") {
                    routerData[routerName].accepted.push([month, traffic]);
                } else if (type === "Delivered") {
                    routerData[routerName].delivered.push([month, traffic]);
                }
            }
        });
    }
});

class volume extends React.Component {
  static displayName = "VolumeExample";

  state = {
    timerange: octoberTrafficSeries.range(),
    selection: null
  };

  handleTimeRangeChange = timerange => {
    this.setState({ timerange });
  };

  render() {
    /*

    Styling the hard way
    const style = {
      in: {
        normal: {fill: "#A5C8E1"},
        highlighted: {fill: "#BFDFF6"},
        selected: {fill: "#2DB3D1"},
        muted: {fill: "#A5C8E1", opacity: 0.4}
      }
    };
    const altStyle = {
      out: {
        normal: {fill: "#FFCC9E"},
        highlighted: {fill: "#fcc593"},
        selected: {fill: "#2DB3D1"},
        muted: {fill: "#FFCC9E", opacity: 0.4}
      }
    };

    const combinedStyle = {
      in: {
        normal: {fill: "#A5C8E1"},
        highlighted: {fill: "#BFDFF6"},
        selected: {fill: "#2DB3D1"},
        muted: {fill: "#A5C8E1", opacity: 0.4}
      },
      out: {
        normal: {fill: "#FFCC9E"},
        highlighted: {fill: "#fcc593"},
        selected: {fill: "#2DB3D1"},
        muted: {fill: "#FFCC9E", opacity: 0.4}
      }
    };
    */

    const style = styler([
      { key: "in", color: "#A5C8E1", selected: "#2CB1CF" },
      { key: "out", color: "#FFCC9E", selected: "#2CB1CF" },
      {
        key: netTrafficColumnNames[1],
        color: "#A5C8E1",
        selected: "#2CB1CF"
      },
      {
        key: netTrafficColumnNames[2],
        color: "#FFCC9E",
        selected: "#2CB1CF"
      },
      {
        key: netTrafficColumnNames[3],
        color: "#DEB887",
        selected: "#2CB1CF"
      }
    ]);

    const formatter = format(".2s");
    const selectedDate = this.state.selection
      ? this.state.selection.event.index().toNiceString()
      : "--";
    const selectedValue = this.state.selection
      ? `${formatter(+this.state.selection.event.value(this.state.selection.column))}b`
      : "--";

    const highlight = this.state.highlight;
    let infoValues = [];
    let infoNetValues = [];
    if (highlight) {
      const trafficText = `${formatter(highlight.event.get(highlight.column))}`;
      infoValues = [{ label: "Traffic", value: trafficText }];
      infoNetValues = [{ label: "Traffic " + highlight.column, value: trafficText }];
    }

    return (
      <div>
        <div className="row">
          <div className="col-md-12">
            <Resizable>
              <ChartContainer
                  timeRange={octoberTrafficSeries.range()}
                  format="day"
                  onBackgroundClick={() => this.setState({ selection: null })}
              >
                <ChartRow height="150">
                  <YAxis
                    id="traffic-volume"
                    label="Traffic (B)"
                    classed="traffic-in"
                    min={0}
                    max={max}
                    width="70"
                    type="linear"
                  />
                  <Charts>
                    <BarChart
                      axis="traffic-volume"
                      style={style}
                      size={10}
                      offset={5.5}
                      columns={["in"]}
                      series={octoberTrafficSeries}
                      highlighted={this.state.highlight}
                      info={infoValues}
                      infoTimeFormat="%m/%d/%y"
                      onHighlightChange={highlight =>
                          this.setState({ highlight })
                      }
                      selected={this.state.selection}
                      onSelectionChange={selection =>
                          this.setState({ selection })
                      }
                    />
                    <BarChart
                      axis="traffic-volume"
                      style={style}
                      size={10}
                      offset={-5.5}
                      columns={["out"]}
                      series={octoberTrafficSeries}
                      info={infoValues}
                      highlighted={this.state.highlight}
                      onHighlightChange={highlight =>
                          this.setState({ highlight })
                      }
                      selected={this.state.selection}
                      onSelectionChange={selection =>
                          this.setState({ selection })
                      }
                    />
                  </Charts>
                </ChartRow>
              </ChartContainer>
            </Resizable>
          </div>
        </div>
      </div>
    );
  }
}

class GraphArea extends React.Component {
  render() {
    const history = this.props.history;
    const currentSeries = history[history.length - 1];

    // currentSeriesを渡してグラフエリアを描画する
    // Actionに現在の週とクリック時のハンドラを渡す
    return (
      <div className="graph-area">
        <div className="graph-low">
          <realtime />
          <realtime />
          <realtime />
        </div>
        <div className="graph-low">
          <realtime />
          <div className="meters">
            <div className="meter">
              <ReactSpeedometer
                //fluidWidth={true}
              />
            </div>
            <div className="meter">
              <ReactSpeedometer
                //fluidWidth={true}
              />
            </div>
          </div>
          <volume />
        </div>
      </div>
    );
  }
}

// 初期状態
// データ名のつけ方
// series_X_X_X
//        | | +-- 週（現在は５週まで）
//        | +---- スライダによる変化（現在は２件）
//        +------ 上部セレクタによる変化(現在は１件のみ)
const series_0_0_0 = [
  {name: 'senser-1', data: [
    {category: '8:00', value: 0.2},
    {category: '8:01', value: 0.1},
    {category: '8:02', value: 0.15},
    {category: '8:03', value: 0.3},
    {category: '8:04', value: 0.45},
    {category: '8:05', value: 0.5},
    {category: '8:06', value: 0.6},
    {category: '8:07', value: 0.7},
    {category: '8:08', value: 0.8},
    {category: '8:09', value: 0.9},
    {category: '8:10', value: 0.8},
    {category: '8:11', value: 0.7},
    {category: '8:12', value: 0.6},
    {category: '8:13', value: 0.5},
    {category: '8:14', value: 0.4},
    {category: '8:15', value: 0.3},
    {category: '8:16', value: 0.2},
    {category: '8:17', value: 0.1},
    {category: '8:18', value: 0.0},
    {category: '8:19', value: 0.1},
    {category: '8:20', value: 0.2},
    {category: '8:21', value: 0.1},
    {category: '8:22', value: 0.2},
    {category: '8:23', value: 0.3},
    {category: '8:24', value: 0.4},
    {category: '8:25', value: 0.5},
    {category: '8:26', value: 0.6},
    {category: '8:27', value: 0.7},
    {category: '8:28', value: 0.8},
    {category: '8:29', value: 0.9},
    {category: '8:30', value: 0.8},
    {category: '8:31', value: 0.7},
    {category: '8:32', value: 0.6},
    {category: '8:33', value: 0.5},
    {category: '8:34', value: 0.4},
    {category: '8:35', value: 0.3},
    {category: '8:36', value: 0.2},
    {category: '8:37', value: 0.1},
    {category: '8:38', value: 0.2},
    {category: '8:39', value: 0.1},
    {category: '8:40', value: 0.2},
    {category: '8:41', value: 0.1},
    {category: '8:42', value: 0.2},
    {category: '8:43', value: 0.3},
    {category: '8:44', value: 0.4},
    {category: '8:45', value: 0.5},
    {category: '8:46', value: 0.6},
    {category: '8:47', value: 0.7},
    {category: '8:48', value: 0.8},
    {category: '8:49', value: 0.9},
    {category: '8:50', value: 0.8},
    {category: '8:51', value: 0.7},
    {category: '8:52', value: 0.6},
    {category: '8:53', value: 0.5},
    {category: '8:54', value: 0.4},
    {category: '8:55', value: 0.3},
    {category: '8:56', value: 0.2},
    {category: '8:57', value: 0.1},
    {category: '8:58', value: 0.0},
    {category: '8:59', value: 0.1},
    {category: '9:00', value: 0.2},
    {category: '9:01', value: 0.1},
    {category: '9:02', value: 0.2},
    {category: '9:03', value: 0.3},
    {category: '9:04', value: 0.4},
    {category: '9:05', value: 0.5},
    {category: '9:06', value: 0.6},
    {category: '9:07', value: 0.7},
    {category: '9:08', value: 0.8},
    {category: '9:09', value: 0.9},
    {category: '9:10', value: 0.8},
    {category: '9:11', value: 0.7},
    {category: '9:12', value: 0.6},
    {category: '9:13', value: 0.5},
    {category: '9:14', value: 0.4},
    {category: '9:15', value: 0.3},
    {category: '9:16', value: 0.2},
    {category: '9:17', value: 0.1},
    {category: '9:18', value: 0.2},
    {category: '9:19', value: 0.1},
  ], stroke: '#E57373'},
];

// 予測実行１（スライダの平均値が０．５以下）
const series_0_1_0 = [
  {name: '予測値', data: [
    {category: '第0週', value: 0},
    {category: '第1週', value: 10},
    {category: '第2週', value: 25},
    {category: '第3週', value: 50},
    {category: '第4週', value: 60},
    {category: '第5週', value: 84},
    {category: '第6週', value: 92},
    {category: '第7週', value: 93},
    {category: '第8週', value: 89},
    {category: '第9週', value: 80},
    {category: '第10週', value: 70},
    {category: '第11週', value: 59},
    {category: '第12週', value: 48},
    {category: '第13週', value: 39},
    {category: '第14週', value: 30},
    {category: '第15週', value: 21},
    {category: '第16週', value: 12},
    {category: '第17週', value: 9}
  ], stroke: '#E57373'},
];

// 予測実行１＋１週目実績
const series_0_1_1 = [
  {name: '予測値', data: [
    {category: '第0週', value: 0},
    {category: '第1週', value: 10},
    {category: '第2週', value: 25},
    {category: '第3週', value: 50},
    {category: '第4週', value: 60},
    {category: '第5週', value: 84},
    {category: '第6週', value: 92},
    {category: '第7週', value: 93},
    {category: '第8週', value: 89},
    {category: '第9週', value: 80},
    {category: '第10週', value: 70},
    {category: '第11週', value: 59},
    {category: '第12週', value: 48},
    {category: '第13週', value: 39},
    {category: '第14週', value: 30},
    {category: '第15週', value: 21},
    {category: '第16週', value: 12},
    {category: '第17週', value: 9}
  ], stroke: '#E57373'},
  {name: '実績', data: [
    {category: '第0週', value: 0},
    {category: '第1週', value: 25}
  ], stroke: '#8884d8'},
];

const styles2 = {
  strokeWidth: 1.0,
  color: 'red',
  font: 'bold large/150% "メイリオ"',
}

class IotDemo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        series_0_0_0
      ],
      selection1:  1,
      selection2:  1,

    }
  }

  handleSelectChange1(i){
  }

  handleSelectChange2(i){
  }

  /*
   * 描画ルーチン
   */
  render() {
    return (
      <MuiThemeProvider>
        <div className="iot-demo">
          <AppBar
            title="IoT 異常検知"
          />
          <div className="contents">
            <Selections
              selection1={this.state.selection1}
              selection2={this.state.selection2}
              onSelectChange1={(i) => this.handleSelectChange1(i)}
              onSelectChange2={(i) => this.handleSelectChange2(i)}
            />
            <div className="dashboard">
              <TabArea
              />
              <GraphArea
                history={this.state.history}
                week={this.state.week}
                inputData={this.state.inputData}
              />
            </div>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

// 商品説明ページ　左
class Abstruct extends React.Component {
  render() {
    return (
      <div className="abstruct">
        Abstruct Area.
      </div>
    );
  }
}

// 商品説明ページ　右
class Specification extends React.Component {
  render() {
    return (
      <div className="specification">
        Specification Area.
      </div>
    );
  }
}

// 商品説明ページ　全体
class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    return (
      <MuiThemeProvider>
        <div className="apparel-demo">
          <AppBar />
          <Abstruct />
          <Specification />
        </div>
      </MuiThemeProvider>
    );
  }
}

// アプリケーション全体
// Apparel-demo：予測グラフページ
// Detail:商品説明ページ
class App extends React.Component {
  render() {
    return(
      <BrowserRouter>
        <div>
          <Route exact path="/" component={IotDemo} />
          <Route path="/detail" component={Detail} />
        </div>
      </BrowserRouter>
    );
  }
}

// ========================================

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
