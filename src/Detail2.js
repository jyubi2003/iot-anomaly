import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
// eslint-disable-next-line
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import AppBar from 'material-ui/AppBar';

// 商品説明ページ　左
class Abstruct extends React.Component {
  render() {
    return (
      <div className="abstruct">
      異常Bの検索結果10件中1 - 10件目(0.07秒）<br></br>
      検索ワード：【異常B】
      <hr></hr>
      </div>
    );
  }
}

// 商品説明ページ　右
class Specification extends React.Component {
  render() {
    return (
      <div className="specification">
      <p>遺伝的アルゴリズムを用いた製品設計システムおよび製品設計方法</p>
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

export default Detail;
