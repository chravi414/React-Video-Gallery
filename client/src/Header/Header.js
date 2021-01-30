import React from "react";
import "./Header.css";

function Header({ videoSrc }) {
  return (
    <section className="showcase">
      <header>
        <h2 className="logo">Watch Now</h2>
      </header>
      <video src={videoSrc} muted autoPlay></video>
      <div className="overlay"></div>
      <div className="text">
        <h2>Never Stop</h2>
        <h3>getting the Entertainment</h3>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Mollitia
          consectetur officia ipsam, incidunt qui placeat praesentium
          dignissimos repellat explicabo aperiam quia consequatur, quo sunt non
          quas expedita, ratione hic saepe?
        </p>
        <a href="/">Explore</a>
      </div>
    </section>
  );
}
export default Header;
