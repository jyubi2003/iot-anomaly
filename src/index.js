import React from 'react';
import ReactDOM from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// eslint-disable-next-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
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
// We can just import Slider or Range to reduce bundle size
// import Slider from 'rc-slider/lib/Slider';
// import Range from 'rc-slider/lib/Range';

import './index.css';

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

const data = [
      {name: 'LAS1', 工場A: 4, 工場B: 2, amt: 6},
      {name: 'LAS2', 工場A: 3, 工場B: 1, amt: 4},
      {name: 'LAS3', 工場A: 2, 工場B: 7, amt: 9},
      {name: 'LBS1', 工場A: 2, 工場B: 3, amt: 5},
      {name: 'LBS2', 工場A: 1, 工場B: 4, amt: 5},
];

class SimpleBarChart extends React.Component {
  render () {
    return (
      <div className="graph">
        <p style={{textDecoration: "underline", fontSize: "1.0vw"}}>一週間のエラー発生件数</p>
        <ResponsiveContainer width="100%" height="95%">
          <BarChart data={data}
            margin={{top: 5, right: 30, left: 20, bottom: 5}}>
            <XAxis dataKey="name"/>
            <YAxis/>
            <CartesianGrid strokeDasharray="3 3"/>
            <Tooltip/>
            <Legend />
            <Bar dataKey="工場A" fill="#8884d8" />
            <Bar dataKey="工場B" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
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
          <SimpleAreaChart
            series={currentSeries}
          />
          <SimpleAreaChart
            series={currentSeries}
          />
          <SimpleAreaChart
            series={currentSeries}
          />
        </div>
        <div className="graph-low">
          <SimpleAreaChart
            series={currentSeries}
          />
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
          <SimpleBarChart
            series={currentSeries}
          />
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
    {category: '8:02', value: 0.2},
    {category: '8:03', value: 0.3},
    {category: '8:04', value: 0.4},
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