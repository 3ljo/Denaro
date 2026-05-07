'use client'
import React,{useState} from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import MobileOffCanvas from "@t/app/components/common/mobile-offcanvas";
import { BtnBg } from "@t/app/components/svg";
import HeaderNavMenus from "./header-nav-menus";
import StickyWrapper from "./sticky-wrapper";
import TemplateLanguageSwitcher from "./template-language-switcher";

const Header = ({style_2=false}:{style_2?:boolean}) => {
  const [openMobileOffCanvas,setOpenMobileOffCanvas] = useState<boolean>(false);
  const t = useTranslations('marketing.nav');
  // handle open mobile offcanvas
  const handleOpenMobileOffCanvas = (audioPath: string) => {
    setOpenMobileOffCanvas(true)
    const audio = new Audio(audioPath);
    audio.play();
  };
  return (
    <header>
      <StickyWrapper>
        <div className="container custom-container">
          <div className="row">
            <div className="col-12">
              <div className="mobile-nav-toggler" onClick={() => handleOpenMobileOffCanvas('/audio/click.wav')} >
                <i className="fas fa-bars"></i>
              </div>
              <div className="tgmenu__wrap">
                <nav className="tgmenu__nav">
                  <div className="logo">
                    <Link href="/" style={{display:'inline-flex',alignItems:'center'}}>
                      <span style={{fontFamily:'var(--tg-heading-font-family)',fontWeight:800,letterSpacing:'0.18em',fontSize:'1.55rem',lineHeight:1}}>
                        <span style={{color:'#fbbf24'}}>D</span>
                        <span style={{color:'#fff'}}>ENARO</span>
                      </span>
                    </Link>
                  </div>
                  <div className="tgmenu__navbar-wrap tgmenu__main-menu d-none d-xl-flex">
                    {/* nav menus */}
                    <HeaderNavMenus/>
                    {/* nav menus */}
                  </div>
                  <div className="tgmenu__action d-none d-md-block">
                    <ul className="list-wrap" style={{display:'flex',alignItems:'center',gap:'14px'}}>
                      <li className="header-btn">
                        <Link href="/login" className={`${style_2?'tg-btn-3 tg-svg':'tg-border-btn'}`}>
                          <BtnBg/>
                          {t('signIn')}
                        </Link>
                      </li>
                      <li style={{listStyle:'none'}}>
                        <TemplateLanguageSwitcher />
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </StickyWrapper>

      {/*mobile off canvas start */}
      <MobileOffCanvas openMobileOffCanvas={openMobileOffCanvas} setOpenMobileOffCanvas={setOpenMobileOffCanvas} />
      {/*mobile off canvas end */}
    </header>
  );
};

export default Header;
