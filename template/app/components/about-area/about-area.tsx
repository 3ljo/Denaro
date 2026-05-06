'use client';

import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";

// images
import about_1 from "@t/assets/img/others/about_tab01.png";
import about_2 from "@t/assets/img/others/about_tab02.png";
import about_3 from "@t/assets/img/others/about_tab03.png";
import about_4 from "@t/assets/img/others/about_tab04.png";
import about_5 from "@t/assets/img/others/about_tab05.png";
import about_6 from "@t/assets/img/others/about_tab06.png";

import about_bg_1 from "@t/assets/img/others/about_img01.jpg";
import about_bg_2 from "@t/assets/img/others/about_img02.jpg";
import about_bg_3 from "@t/assets/img/others/about_img03.jpg";
import about_bg_4 from "@t/assets/img/others/about_img04.jpg";
import about_bg_5 from "@t/assets/img/others/about_img05.jpg";
import about_bg_6 from "@t/assets/img/others/about_img06.jpg";

import icon_1 from "@t/assets/img/icons/features_icon01.png";
import icon_2 from "@t/assets/img/icons/features_icon02.png";
import icon_3 from "@t/assets/img/icons/features_icon03.png";

import TextAnimation from "../common/text-animation";
import { BtnBgFour, BtnBgThree } from "../svg";

/* =========================
   Nav Button
========================= */
type NavBtnProps = {
  id: string;
  img: StaticImageData;
  activeTab: string;
  setActiveTab: (id: string) => void;
};

function NavBtn({ id, img, activeTab, setActiveTab }: NavBtnProps) {
  const handleClickSound = () => {
    const audio = new Audio("/audio/tab.mp3");
    audio.play();
  };

  return (
    <li className="nav-item">
      <button
        type="button"
        className={`nav-link ${activeTab === id ? "active" : ""}`}
        onClick={() => {
          handleClickSound();
          setActiveTab(id);
        }}
      >
        <span className="img-shape"></span>
        <Image src={img} alt="tab" />
      </button>
    </li>
  );
}

/* =========================
   Tab Content
========================= */
type TabItemProps = {
  id: string;
  img: StaticImageData;
  title: string;
  rate: string;
  activeTab: string;
};

function TabItem({ id, img, title, rate, activeTab }: TabItemProps) {
  return (
    <div
      className={`tab-pane fade ${activeTab === id ? "show active" : ""
        }`}
    >
      <div className="row justify-content-center">
        <div className="col-xl-5 col-lg-10">
          <div className="about__img">
            <Image src={img} alt={title} />
          </div>
        </div>

        <div className="col-xl-7 col-lg-10">
          <div className="about__flex-wrap">
            <div className="about__content-wrap">
              <div className="about__content">
                <h4 className="title">{title}</h4>
                <span className="rate">rate {rate}</span>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Duis elementum sollicitudin augue euismod.
                </p>
              </div>

              <div className="about__content-list">
                <ul className="list-wrap">
                  <li>
                    <Image src={icon_1} alt="icon" /> Chichi Dragon Ball
                  </li>
                  <li>
                    <Image src={icon_2} alt="icon" /> Space Babe Night
                  </li>
                  <li>
                    <Image src={icon_3} alt="icon" /> Dragon Ball
                  </li>
                </ul>
              </div>
            </div>

            <div className="about__btn-wrap">
              <ul className="list-wrap">
                <li>
                  <Link href="/shop-details">Dragon Ball</Link>
                </li>
                <li>
                  <Link href="/shop">NFT Market</Link>
                </li>
                <li>
                  <Link href="/contact">Support</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Main Component
========================= */
const AboutArea = () => {
  const [activeTab, setActiveTab] = useState("01");

  return (
    <section className="about__area section-pt-130 section-pb-130">
      <div className="container">

        {/* Section Title */}
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-7 col-md-10">
            <div className="section__title text-center mb-60">
              <TextAnimation title="know about us" />
              <h3 className="title">top rated streamers</h3>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="about__tab-wrap">

              <div className="about__buttons">
                <Link href="/shop" className="tg-btn-2">
                  buy hero <BtnBgThree />
                </Link>
                <Link href="/shop" className="tg-btn-2 -secondary">
                  buy nfts <BtnBgFour />
                </Link>
              </div>

              <ul className="nav nav-tabs">
                <NavBtn id="01" img={about_1} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavBtn id="02" img={about_2} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavBtn id="03" img={about_3} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavBtn id="04" img={about_4} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavBtn id="05" img={about_5} activeTab={activeTab} setActiveTab={setActiveTab} />
                <NavBtn id="06" img={about_6} activeTab={activeTab} setActiveTab={setActiveTab} />
              </ul>

            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content mt-50">
          <TabItem activeTab={activeTab} id="01" img={about_bg_1} title="human game" rate="50%" />
          <TabItem activeTab={activeTab} id="02" img={about_bg_2} title="Axie Infinity" rate="60%" />
          <TabItem activeTab={activeTab} id="03" img={about_bg_3} title="The Walking Dead" rate="75%" />
          <TabItem activeTab={activeTab} id="04" img={about_bg_4} title="The Dogami" rate="65%" />
          <TabItem activeTab={activeTab} id="05" img={about_bg_5} title="The Sandbox" rate="85%" />
          <TabItem activeTab={activeTab} id="06" img={about_bg_6} title="Pegaxy Horses" rate="90%" />
        </div>

      </div>
    </section>
  );
};

export default AboutArea;
