import React, { useState, useRef, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";
import "./VideoPlayer.css";

function VideoPlayer({ match }) {
  const [videoData, setVideoData] = useState({});
  const [progressBarValue, setProgressBarValue] = useState(0);
  const [seekBarValue, setSeekBarValue] = useState(0);
  const [progressBarMaxValue, setProgressBarMaxValue] = useState(0);
  const [seekBarMaxValue, setSeekBarMaxValue] = useState(0);
  const [toolTipText, setToolTipText] = useState("");
  const [volumeValue, setvolumeValue] = useState(0.5);
  const [volumeIcon, setVolumeIcon] = useState(<use href="#volume-low"></use>);
  const videoElementRef = useRef();
  const [showCustomControls, setShowCustomControls] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [playToolTipValue, setPlayToolTipValue] = useState("Play (k)");
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [fullScreen, setFullScreen] = useState(false);
  const [videoId, setVideoId] = useState(1);
  const [showBack, setShowBack] = useState(false);

  const history = useHistory();

  useEffect(() => {
    setVideoId(match.params["id"]);
    fetchVideo();

    const videoWorks = !!document.createElement("video").canPlayType;

    if (videoWorks) {
      videoElementRef.current.controls = false;
      setShowCustomControls(true);
      console.log("Success");
      console.log(videoElementRef.current);
    }
    videoElementRef.current.onloadedmetadata = () => {
      initializeVideo();
    };

    document.addEventListener("keyup", (event) => {
      handleKeyBoardShortcuts(event.key);
    });

    videoElementRef.current.addEventListener("timeupdate", updateTimeElapsed);

    return () => {};
  }, []);

  const handleKeyBoardShortcuts = (key) => {
    switch (key) {
      case "k":
        togglePlay();
        animatePlayback();
        if (videoElementRef.current.paused) {
          showControls();
        } else {
          setTimeout(() => {
            hideControls();
          }, 2000);
        }
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullScreen();
        break;
      default:
        console.log(key);
    }
  };

  const fetchVideo = async () => {
    try {
      const res = await fetch(`http://localhost:4000/video/${videoId}/data`);
      const data = await res.json();
      setVideoData(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const togglePlay = () => {
    if (videoElementRef.current.paused || videoElementRef.current.ended) {
      videoElementRef.current.play();
      setShowPlayButton(false);
      setPlayToolTipValue("Pause (k)");
    } else {
      videoElementRef.current.pause();
      setShowPlayButton(true);
      setPlayToolTipValue("Play (k)");
    }
  };

  const animatePlayback = () => {
    const playbackAnimation = document.getElementById("playback-animation");
    playbackAnimation.animate(
      [
        {
          opacity: 1,
          transform: "scale(1)",
        },
        {
          opacity: 0,
          transform: "scale(1.3)",
        },
      ],
      {
        duration: 500,
      }
    );
  };

  const playVideoOnClick = () => {
    togglePlay();
    animatePlayback();
  };
  const initializeVideo = () => {
    const videoDuration = Math.round(videoElementRef.current.duration);
    setProgressBarMaxValue(videoDuration);
    setSeekBarMaxValue(videoDuration);
    const time = formatTime(videoDuration);
    setDuration(`${time.minutes}:${time.seconds}`);
  };

  const updateTimeElapsed = () => {
    if (videoElementRef.current) {
      const time = formatTime(Math.round(videoElementRef.current.currentTime));
      setCurrentTime(`${time.minutes}:${time.seconds}`);
      if (videoElementRef.current.ended) {
        setShowPlayButton(true);
        setPlayToolTipValue("Play (k)");
      }
      updateProgress();
    }
  };

  const updateProgress = () => {
    setSeekBarValue(Math.floor(videoElementRef.current.currentTime));
    setProgressBarValue(Math.floor(videoElementRef.current.currentTime));
  };

  const formatTime = (timeInSeconds) => {
    const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
    return {
      minutes: result.substr(3, 2),
      seconds: result.substr(6, 2),
    };
  };

  const updateSeekToolTip = (e) => {
    const skipTo = Math.round(
      (e.clientX / e.target.clientWidth) *
        parseInt(e.target.getAttribute("max"), 10)
    );
    const t = formatTime(skipTo);
    setToolTipText(`${t.minutes}:${t.seconds}`);
  };

  const skipAhead = (event) => {
    videoElementRef.current.currentTime = event.target.value;
    setProgressBarValue(event.target.value);
    setSeekBarValue(event.target.value);
  };

  const changeVolume = (event) => {
    if (videoElementRef.current.muted) {
      videoElementRef.current.muted = false;
    }
    console.log(event.target.value);
    videoElementRef.current.volume = event.target.value;
    setvolumeValue(event.target.value);
  };

  const toggleMute = () => {
    videoElementRef.current.muted = !videoElementRef.current.muted;
    updateVolumeIcon();
    if (videoElementRef.current.muted) {
      setvolumeValue(0);
      videoElementRef.current.volume = 0;
      setVolumeIcon(<use href="#volume-mute"></use>);
    } else {
      setvolumeValue(0.5);
      videoElementRef.current.volume = 0.5;
      setVolumeIcon(<use href="#volume-low"></use>);
    }
  };

  const updateVolumeIcon = useCallback(() => {
    console.log(volumeValue);
    if (volumeValue == 0 || videoElementRef.current.muted) {
      setVolumeIcon(<use href="#volume-mute"></use>);
    } else if (volumeValue > 0 && volumeValue <= 0.5) {
      setVolumeIcon(<use href="#volume-low"></use>);
    } else {
      setVolumeIcon(<use href="#volume-high"></use>);
    }
  }, [volumeValue]);

  useEffect(() => {
    updateVolumeIcon();
  }, [volumeValue, updateVolumeIcon]);

  const toggleFullScreen = () => {
    const videoContainer = document.getElementById("video-container");
    if (document.fullscreenElement) {
      document.exitFullscreen();
      setFullScreen(false);
    } else if (document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
      setFullScreen(false);
    } else if (videoContainer.webkitRequestFullscreen) {
      videoContainer.webkitRequestFullscreen();
      setFullScreen(true);
    } else {
      videoContainer.requestFullscreen();
      setFullScreen(true);
    }
  };

  const showControls = () => {
    setShowCustomControls(true);
    // setShowBack(true);
  };

  const hideControls = () => {
    setShowCustomControls(false);
    // setShowBack(false);
  };

  const toggleBackArrow = () => {
    setShowBack(true);
    // setTimeout(() => {
    //   setShowBack(false);
    // }, 5000);
  };

  const navigateToHome = () => {
    videoElementRef.current.pause();
    videoElementRef.current.removeEventListener(
      "timeupdate",
      updateTimeElapsed
    );
    history.push("/");
  };

  return (
    <>
      <div
        className="main-container"
        onMouseMove={() => {
          toggleBackArrow();
        }}
      >
        {showBack ? (
          <div className="sticky-header">
            <div className="title">{videoData.name}</div>
            <div
              className="back-arrow"
              onClick={() => {
                navigateToHome();
              }}
            >
              {" "}
              <span className="symbol">{"<"}</span>
              {"Back"}
            </div>
          </div>
        ) : null}

        <div className="video-container" id="video-container">
          <div className="playback-animation" id="playback-animation">
            <svg className="playback-icons">
              <use className="hidden" href="#play-icon"></use>
              <use href="#pause"></use>
            </svg>
          </div>

          <video
            controls
            className="video"
            id="video"
            preload="metadata"
            onClick={playVideoOnClick}
            ref={videoElementRef}
            onMouseEnter={showControls}
            onMouseLeave={hideControls}
          >
            <source
              src={`http://localhost:4000/video/${videoId}`}
              type="video/mp4"
            ></source>
          </video>
          {!showCustomControls ? null : (
            <div
              className="video-controls"
              id="video-controls"
              onMouseEnter={showControls}
              onMouseLeave={hideControls}
            >
              <div className="video-progress">
                <progress
                  id="progress-bar"
                  value={progressBarValue}
                  min="0"
                  max={progressBarMaxValue}
                ></progress>
                <input
                  className="seek"
                  id="seek"
                  value={seekBarValue}
                  min="0"
                  type="range"
                  max={seekBarMaxValue}
                  step="1"
                  onMouseMove={(e) => {
                    updateSeekToolTip(e);
                  }}
                  onChange={(event) => skipAhead(event)}
                />
                <div className="seek-tooltip" id="seek-tooltip">
                  {toolTipText}
                </div>
              </div>

              <div className="bottom-controls">
                <div className="left-controls">
                  <button
                    data-title={playToolTipValue}
                    id="play"
                    onClick={togglePlay}
                  >
                    <svg className="playback-icons">
                      {showPlayButton ? (
                        <use href="#play-icon"></use>
                      ) : (
                        <use href="#pause"></use>
                      )}
                    </svg>
                  </button>

                  <div className="volume-controls">
                    <button
                      data-title="Mute (m)"
                      className="volume-button"
                      id="volume-button"
                      onClick={toggleMute}
                    >
                      <svg>{volumeIcon}</svg>
                    </button>

                    <input
                      className="volume"
                      id="volume"
                      value={volumeValue}
                      data-mute="0.5"
                      type="range"
                      max="1"
                      min="0"
                      step="0.01"
                      onChange={(event) => changeVolume(event)}
                    />
                  </div>

                  <div className="time">
                    <time id="time-elapsed">{currentTime}</time>
                    <span> / </span>
                    <time id="duration">{duration}</time>
                  </div>
                </div>

                <div className="right-controls">
                  <button
                    data-title="Full screen (f)"
                    className="fullscreen-button"
                    id="fullscreen-button"
                    onClick={toggleFullScreen}
                  >
                    <svg>
                      {!fullScreen ? (
                        <use href="#fullscreen"></use>
                      ) : (
                        <use href="#fullscreen-exit"></use>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <svg style={{ display: "none" }}>
        <defs>
          <symbol id="pause" viewBox="0 0 24 24">
            <path d="M14.016 5.016h3.984v13.969h-3.984v-13.969zM6 18.984v-13.969h3.984v13.969h-3.984z"></path>
          </symbol>

          <symbol id="play-icon" viewBox="0 0 24 24">
            <path d="M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z"></path>
          </symbol>

          <symbol id="volume-high" viewBox="0 0 24 24">
            <path d="M14.016 3.234q3.047 0.656 5.016 3.117t1.969 5.648-1.969 5.648-5.016 3.117v-2.063q2.203-0.656 3.586-2.484t1.383-4.219-1.383-4.219-3.586-2.484v-2.063zM16.5 12q0 2.813-2.484 4.031v-8.063q1.031 0.516 1.758 1.688t0.727 2.344zM3 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6z"></path>
          </symbol>

          <symbol id="volume-low" viewBox="0 0 24 24">
            <path d="M5.016 9h3.984l5.016-5.016v16.031l-5.016-5.016h-3.984v-6zM18.516 12q0 2.766-2.531 4.031v-8.063q1.031 0.516 1.781 1.711t0.75 2.32z"></path>
          </symbol>

          <symbol id="volume-mute" viewBox="0 0 24 24">
            <path d="M12 3.984v4.219l-2.109-2.109zM4.266 3l16.734 16.734-1.266 1.266-2.063-2.063q-1.547 1.313-3.656 1.828v-2.063q1.172-0.328 2.25-1.172l-4.266-4.266v6.75l-5.016-5.016h-3.984v-6h4.734l-4.734-4.734zM18.984 12q0-2.391-1.383-4.219t-3.586-2.484v-2.063q3.047 0.656 5.016 3.117t1.969 5.648q0 2.203-1.031 4.172l-1.5-1.547q0.516-1.266 0.516-2.625zM16.5 12q0 0.422-0.047 0.609l-2.438-2.438v-2.203q1.031 0.516 1.758 1.688t0.727 2.344z"></path>
          </symbol>

          <symbol id="fullscreen" viewBox="0 0 24 24">
            <path d="M14.016 5.016h4.969v4.969h-1.969v-3h-3v-1.969zM17.016 17.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 9.984v-4.969h4.969v1.969h-3v3h-1.969zM6.984 14.016v3h3v1.969h-4.969v-4.969h1.969z"></path>
          </symbol>

          <symbol id="fullscreen-exit" viewBox="0 0 24 24">
            <path d="M15.984 8.016h3v1.969h-4.969v-4.969h1.969v3zM14.016 18.984v-4.969h4.969v1.969h-3v3h-1.969zM8.016 8.016v-3h1.969v4.969h-4.969v-1.969h3zM5.016 15.984v-1.969h4.969v4.969h-1.969v-3h-3z"></path>
          </symbol>

          <symbol id="pip" viewBox="0 0 24 24">
            <path d="M21 19.031v-14.063h-18v14.063h18zM23.016 18.984q0 0.797-0.609 1.406t-1.406 0.609h-18q-0.797 0-1.406-0.609t-0.609-1.406v-14.016q0-0.797 0.609-1.383t1.406-0.586h18q0.797 0 1.406 0.586t0.609 1.383v14.016zM18.984 11.016v6h-7.969v-6h7.969z"></path>
          </symbol>
        </defs>
      </svg>
    </>
  );
}

export default VideoPlayer;
