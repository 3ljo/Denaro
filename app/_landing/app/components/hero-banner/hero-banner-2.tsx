"use client";
import React from "react";
// Denaro banner — file lives in /public/pic and is referenced by URL path.
const banner_bg = { src: '/pic/banner_bg.png' };

const HeroBannerTwo = () => {
  return (
    <section className="banner__area banner__padding">
      <div className="banner__bg tg-jarallax" style={{ backgroundImage: `url(${banner_bg.src})` }}></div>
    </section>
  );
};

export default HeroBannerTwo;
