"use client";
import React from "react";
import { useTranslations } from "next-intl";

const match_bg = { src: "/pic/Gemini_Generated_Image_74nw9f74nw9f74nw.png" };

const UpcomingMatches = () => {
  const t = useTranslations("marketing.home.news");
  return (
    <section
      id="news"
      className="upcoming-match__area denaro-newsroom"
      style={{ backgroundImage: `url(${match_bg.src})` }}
      aria-labelledby="denaro-newsroom-title"
    >
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-8 col-md-11 col-12">
            <div className="denaro-newsroom__copy">
              <h2
                id="denaro-newsroom-title"
                className="denaro-newsroom__title"
              >
                {t("titlePart1")}<br />
                {t("titlePart2")}{" "}
                <span className="denaro-newsroom__title-accent">{t("titleAccent")}</span>{" "}
                {t("titlePart3")}
              </h2>

              <p className="denaro-newsroom__sub">{t("subtitle")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpcomingMatches;
