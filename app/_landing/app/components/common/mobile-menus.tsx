"use client";
import Link from "next/link";
import React, { useState } from "react";
import menu_data from "@t/data/menu-data";
import { useTranslations } from "next-intl";

const MobileMenus = () => {
  const [navTitle, setNavTitle] = useState<string>("");
  const t = useTranslations("marketing.home.nav");
  //openMobileMenu
  const openMobileMenu = (menu: string,audioPath:string) => {
    const audio = new Audio(audioPath);
    audio.play();
    if (navTitle === menu) {
      setNavTitle("");
    } else {
      setNavTitle(menu);
    }
  };
  return (
    <ul className="navigation">
      {menu_data.map((menu, i) => (
        <React.Fragment key={i}>
          {menu.sub_menu && (
            <li className="menu-item-has-children">
              <Link href={menu.link}>{t(menu.i18nKey)}</Link>
              <ul
                className="sub-menu"
                style={{
                  display: navTitle === menu.i18nKey ? "block" : "none",
                }}
              >
                {menu.sub_menu.map((sub, i) => (
                  <li key={i}>
                    <Link href={sub.link}>{t(sub.i18nKey)}</Link>
                  </li>
                ))}
              </ul>
              <div
                onClick={() => openMobileMenu(menu.i18nKey,'/audio/click.wav')}
                className={`dropdown-btn ${
                  navTitle === menu.i18nKey ? "open" : ""
                }`}
              >
                <span className="plus-line"></span>
              </div>
            </li>
          )}
          {!menu.sub_menu && (
            <li>
              <Link href={menu.link}>{t(menu.i18nKey)}</Link>
            </li>
          )}
        </React.Fragment>
      ))}
    </ul>
  );
};

export default MobileMenus;
