import VillaJourneyExperience from "@/components/sections/VillaJourneyExperience";
import Philosophy from "@/components/sections/Philosophy";
import DesignApproach from "@/components/sections/DesignApproach";
import DesignProcess from "@/components/sections/DesignProcess";
import WhatWeDo from "@/components/sections/WhatWeDo";
import SpaceJournal from "@/components/sections/SpaceJournal";
import HumanConnection from "@/components/sections/HumanConnection";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <VillaJourneyExperience />
      <Philosophy />
      <DesignApproach />
      <DesignProcess />
      <WhatWeDo />
      <SpaceJournal />
      <HumanConnection />
      <Contact />
    </>
  );
}
