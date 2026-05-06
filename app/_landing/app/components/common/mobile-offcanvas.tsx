"use client";
import React from "react";
import Link from "next/link";
import social_data from "@t/data/social-data";
import MobileMenus from "./mobile-menus";
import TemplateLanguageSwitcher from "@t/layout/header/template-language-switcher";

// prop type
type IProps = {
  openMobileOffCanvas:boolean;
  setOpenMobileOffCanvas: React.Dispatch<React.SetStateAction<boolean>>
}

const MobileOffCanvas = ({openMobileOffCanvas,setOpenMobileOffCanvas}:IProps) => {
  // handle close
  const handleCloseOffCanvas = (audioPath: string) => {
    setOpenMobileOffCanvas(false)
    const audio = new Audio(audioPath);
    audio.play();
  };
  return (
    <div className={openMobileOffCanvas?'mobile-menu-visible':''}>
      <div className="tgmobile__menu">
        <nav className="tgmobile__menu-box">
          <div className="close-btn" onClick={() => handleCloseOffCanvas('/audio/remove.wav')}>
            <i className="flaticon-swords-in-cross-arrangement"></i>
          </div>
          <div className="nav-logo">
            <Link href="/" style={{display:'inline-flex',alignItems:'center'}}>
              <span style={{fontFamily:'var(--tg-heading-font-family)',fontWeight:800,letterSpacing:'0.18em',fontSize:'1.45rem',lineHeight:1}}>
                <span style={{color:'#fbbf24'}}>D</span>
                <span style={{color:'#fff'}}>ENARO</span>
              </span>
            </Link>
          </div>
          <div className="denaro-mobile-actions">
            <TemplateLanguageSwitcher />
            <Link href="/login" className="denaro-mobile-signin">
              <i className="flaticon-edit"></i>
              <span>Sign in</span>
            </Link>
            <Link href="/register" className="denaro-mobile-signup">
              <span>Get started</span>
            </Link>
          </div>
          <div className="tgmobile__menu-outer">
            <MobileMenus/>
          </div>
          <div className="social-links">
            <ul className="list-wrap">
              {social_data.map((s, i) => (
                <li key={i}>
                  <Link href={s.link} target="_blank">
                    <i className={s.icon}></i>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <div className="tgmobile__menu-backdrop" onClick={() => setOpenMobileOffCanvas(false)} />
    </div>
  );
};

export default MobileOffCanvas;
