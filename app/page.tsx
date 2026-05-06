import { Metadata } from "next";
import Wrapper from "@t/layout/wrapper";
import Header from "@t/layout/header/header";
import HeroBannerTwo from "@t/app/components/hero-banner/hero-banner-2";
import MatchResultArea from "@t/app/components/match-result/match-result-area";
import area_bg from '@t/assets/img/bg/area_bg02.jpg';
import AboutAreaTwo from "@t/app/components/about-area/about-area-2";
import StreamersArea from "@t/app/components/streamers/streamers-area";
import UpcomingMatches from "@t/app/components/upcoming-match/upcoming-matches";
import ProjectArea from "@t/app/components/projects/project-area";
import SocialArea from "@t/app/components/social/social-area";
import BrandArea from "@t/app/components/brand/brand-area";
import FooterTwo from "@t/layout/footer/footer-2";

export const metadata: Metadata = {
  title: "Denaro // Home",
};

export default function HomeTwo() {
  return (
    <Wrapper>
      {/* header start */}
      <Header style_2={true} />
      {/* header end */}

      {/* main area start */}
      <main className="main--area">

        {/* hero banner start */}
        <HeroBannerTwo />
        {/* hero banner end */}

        {/* match result start */}
        <MatchResultArea/>
        {/* match result end */}

        {/* area-background-start */}
        <div className="area-background" style={{backgroundImage:`url(${area_bg.src})`}}>

        {/* about-area */}
        <AboutAreaTwo/>
        {/* about-area-end */}

        {/* streamers area start */}
        <StreamersArea/>
        {/* streamers area end */}

        </div>
        {/* area-background-end */}

        {/* upcoming matches start */}
        <UpcomingMatches/>
        {/* upcoming matches end */}

        {/* project area start */}
        <ProjectArea/>
        {/* project area end */}

        {/* social area start */}
        <SocialArea/>
        {/* social area end */}

        {/* brand area start */}
        <BrandArea/>
        {/* brand area end */}


      </main>
      {/* main area end */}

      {/* footer start */}
      <FooterTwo/>
      {/* footer end */}
    </Wrapper>
  );
}
