import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import IotDemo from './IotDemo';
import Detail from './Detail';
import Detail2 from './Detail2';

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
          <Route path="/detail2" component={Detail2} />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
