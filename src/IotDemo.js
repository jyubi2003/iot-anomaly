import React from 'react';
import RealtimeChart from './RealtimeChart';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// eslint-disable-next-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';
//import {LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
// eslint-disable-next-line
import injectTapEventPlugin from 'react-tap-event-plugin';
import AppBar from 'material-ui/AppBar';
import ReactSpeedometer from "react-d3-speedometer";
import {List, ListItem} from 'material-ui/List';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ActionOpacity from 'material-ui/svg-icons/action/opacity';
import ActionSchedule from 'material-ui/svg-icons/action/schedule';
import Business from 'material-ui/svg-icons/communication/business';
import ClearAll from 'material-ui/svg-icons/communication/clear-all';
import Subheader from 'material-ui/Subheader';
import {Tabs, Tab} from 'material-ui/Tabs';

// We can just import Slider or Range to reduce bundle size
// import Slider from 'rc-slider/lib/Slider';
// import Range from 'rc-slider/lib/Range';

import './index.css';

// realtime
const sec = 1000;
const minute = 60 * sec;

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
class GraphArea extends React.Component {
  render() {
    const history = this.props.history;
    const currentSeries = history[history.length - 1];

    // currentSeriesを渡してグラフエリアを描画する
    // Actionに現在の週とクリック時のハンドラを渡す
    return (
      <div className="graph-area">
        <div className="graph-low">
          <RealtimeChart />
          <RealtimeChart />
          <RealtimeChart />
        </div>
        <div className="graph-low">
          <RealtimeChart />
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
          <RealtimeChart />
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

export default IotDemo;
