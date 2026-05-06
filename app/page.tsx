import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Wrapper from "@t/layout/wrapper";
import Header from "@t/layout/header/header";
import HeroBannerTwo from "@t/app/components/hero-banner/hero-banner-2";
import MatchResultArea from "@t/app/components/match-result/match-result-area";
const area_bg = { src: '/pic/Gemini_Generated_Image_jlp2fyjlp2fyjlp2.png' };
import AboutAreaTwo from "@t/app/components/about-area/about-area-2";
import MarketsArea from "@t/app/components/streamers/streamers-area";
import UpcomingMatches from "@t/app/components/upcoming-match/upcoming-matches";
import SocialArea from "@t/app/components/social/social-area";
import BrandArea from "@t/app/components/brand/brand-area";
import FooterTwo from "@t/layout/footer/footer-2";
import HomePricing from "./_components/home-pricing";


export const metadata: Metadata = {
  title: "Denaro // Home",
};

export default async function HomeTwo() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

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

        {/* markets area start */}
        <MarketsArea/>
        {/* markets area end */}

        </div>
        {/* area-background-end */}

        {/* upcoming matches start */}
        <UpcomingMatches/>
        {/* upcoming matches end */}

        {/* pricing teaser */}
        <HomePricing isAuthed={isAuthed} />
        {/* pricing teaser end */}

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
