import CinematicExperience from "@/components/sections/CinematicExperience";
import VillaJourneyExperience from "@/components/sections/VillaJourneyExperience";
import OurStory from "@/components/sections/OurStory";
import WhatWeDo from "@/components/sections/WhatWeDo";
import SpaceShapedByPurpose from "@/components/sections/SpaceShapedByPurpose";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <CinematicExperience />
      <VillaJourneyExperience />
      <OurStory />
      <WhatWeDo />
      <SpaceShapedByPurpose />
      <Contact />
    </>
  );
}
