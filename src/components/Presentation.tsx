"use client";

import React, { useState, useEffect } from "react";

export function Presentation() {
  const [toggle, setToggle] = useState(true);
  const [slideDown, setSlideDown] = useState(false);
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setToggle((prev) => !prev);

      setSlideDown(true);
      setSlideUp(true);

      setTimeout(() => {
        setSlideDown(false);
        setSlideUp(false);
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <p className="text-5xl font-medium">
        A simple way to convert your
        <br />{" "}
        <span
          className={`inline-block ${slideDown ? "animate-slideDown" : ""}`}
        >
          {toggle ? "Spotify" : "YouTube"}
        </span>{" "}
        playlists to{" "}
        <span className={`inline-block ${slideUp ? "animate-slideUp" : ""}`}>
          {toggle ? "YouTube" : "Spotify"}
        </span>
      </p>
    </div>
  );
}
