import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Home from "./Landing/Home";
// import Player from "./Player/Player";
import "./App.css";
import VideoPlayer from "./VideoPlayer/VideoPlayer";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home}></Route>
        <Route path="/player/:id" component={VideoPlayer}></Route>
      </Switch>
    </Router>
  );
}
export default App;
