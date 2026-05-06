"use client";
import React, { useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import shape from '@t/assets/img/icons/shape.svg';
import SvgIconCom from '../common/svg-icon-anim';
import circel from '@t/assets/img/icons/circle.svg';
import fun_fact_shape from '@t/assets/img/others/fun_fact_shape.png';
const fun_fact = { src: '/pic/Gemini_Generated_Image_50psov50psov50ps.png' };
import VideoPopup from '../common/video-popup';
import CounterUp from "../common/counter-up";

const AboutAreaTwo = () => {
   const [isVideoOpen, setIsVideoOpen] = useState(false);
   const imgStyle = { height: 'auto', width: 'auto' };
   const t = useTranslations('marketing.home.about');
   return (
      <>
         <section id="about" className="about__area-two section-pt-160 section-pb-190">
            <div className="container">
               <div className="row justify-content-center align-items-center">
                  <div className="col-xl-6 col-lg-6 order-0 order-lg-2">
                     <div className="about__funFact-images">
                        <Image src={fun_fact_shape} alt="background" className="bg-shape" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={fun_fact.src} className="main-img" alt="Denaro AI" style={{ height: 'auto' }} />
                     </div>
                  </div>
                  <div className="col-xl-6 col-lg-6 col-md-10">
                     <div className="section__title text-start mb-30">
                        <h3 className="title">{t('title')} <br /> {t('titleLine2')}</h3>
                     </div>
                     <div className="about__content-two">
                        <p>{t('body')}</p>
                     </div>
                     <div className="about__content-bottom">
                        <div className="about__content-circle">
                           <Image src={circel} alt="img" style={imgStyle} />
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" version="1.1">
                              <path id="textPath" d="M 0,75 a 75,75 0 1,1 0,1 z"></path>
                              <text>
                                 <textPath href="#textPath">{t('circleText')}</textPath>
                              </text>
                           </svg>
                        </div>
                        <div className="about__funFact-wrap">
                           <div className="about__funFact-lists">
                              <div className="about__funFact-item">
                                 <h2 className="count">
                                    <CounterUp number={250} text="K" />
                                 </h2>
                                 <p>{t('statsCharts')}</p>
                              </div>
                              <div className="about__funFact-item">
                                 <h2 className="count">
                                    <CounterUp number={24} text="/7" />
                                 </h2>
                                 <p>{t('statsCoverage')}</p>
                              </div>
                              <div className="about__funFact-item">
                                 <h2 className="count">
                                    <CounterUp number={99} text="%" />
                                 </h2>
                                 <p>{t('statsUptime')}</p>
                              </div>
                           </div>
                           <div className="about__content-btns">
                              <Link href="/pricing" className="tg-btn-3 tg-svg">
                                 <SvgIconCom icon={shape} id="svg-6" />
                                 <span>{t('ctaPrimary')}</span>
                              </Link>
                              <a className="popup-video pointer"
                                 onClick={() => setIsVideoOpen(true)}><i className="fas fa-play">
                              </i><span className="text">{t('ctaSecondary')}</span></a>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </section>

         {/* video modal start */}
         <VideoPopup
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            videoId="ssrNcwxALS4"
         />
         {/* video modal end */}
      </>
   );
};

export default AboutAreaTwo;