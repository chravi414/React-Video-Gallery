import React, { Component } from "react";
import { Link } from "react-router-dom";
import Header from "../Header/Header";
import LandingVideo from "./../assets/landing_video.mp4";
import "./Home.css";

export default class Home extends Component {
  constructor() {
    super();
    this.state = {
      videos: [],
      initialShowCaseVideoSrc: LandingVideo,
    };
  }
  async componentDidMount() {
    try {
      const response = await fetch("http://localhost:4000/videos");
      const data = await response.json();
      console.log(data);
      this.setState({ videos: [...data] });
    } catch (error) {
      console.log(error);
    }
  }

  playVideoInShowCase = (id) => {
    this.setState({
      initialShowCaseVideoSrc: `http://localhost:4000/video/${id}`,
    });
  };

  setInitialVideo = () => {
    this.setState({
      initialShowCaseVideoSrc: LandingVideo,
    });
  };
  render() {
    return (
      <div className="container">
        <Header videoSrc={this.state.initialShowCaseVideoSrc} />
        <div className="movie-list row">
          {this.state.videos.map((video) => (
            <div
              className="col-md-4"
              key={video.id}
              onMouseOut={() => this.setInitialVideo()}
              onMouseOver={() => this.playVideoInShowCase(video.id)}
            >
              <Link to={`/player/${video.id}`}>
                <div className="card border-0">
                  <img
                    src={`http://localhost:4000${video.poster}`}
                    alt={video.name}
                  />
                  <div className="card-body">
                    <p>{video.name}</p>
                    <p>{video.duration}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
