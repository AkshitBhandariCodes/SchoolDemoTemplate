"use client";
import React from "react";
import ShareButton from "./ui/share-button";
import { FaTwitter, FaFacebook, FaLinkedin, FaLink } from "react-icons/fa";
import SpotlightCard from "./blocks/Components/SpotlightCard/SpotlightCard";

const About = () => {
  const shareLinks = [
    {
      icon: FaTwitter,
      onClick: () => window.open("https://twitter.com/share"),
      label: "Share on Twitter",
    },
    {
      icon: FaFacebook,
      onClick: () => window.open("https://facebook.com/share"),
      label: "Share on Facebook",
    },
    {
      icon: FaLinkedin,
      onClick: () => window.open("https://linkedin.com/share"),
      label: "Share on LinkedIn",
    },
    {
      icon: FaLink,
      onClick: () => navigator.clipboard.writeText(window.location.href),
      label: "Copy link",
    },
  ];

  return (
    <div className="flex flex-col items-center h-auto w-screen bg-black">
      {/* Heading */}
      <h1 className="text-center text-white text-6xl font-extrabold pt-10">
        About
      </h1>

      {/* Cards Section */}
      <div className="flex gap-6 justify-center mt-10">
  {/* Courses */}
  <SpotlightCard
    className="w-1/5 h-60 flex flex-col items-start justify-center p-6 text-white"
    spotlightColor="rgba(106, 53, 224, 1)"
  >
    <div className="text-2xl font-bold mb-2">📘 Courses</div>
    <p className="text-sm opacity-80">
      Offering 40+ academic and extracurricular courses tailored for holistic development.
    </p>
  </SpotlightCard>

  {/* Students */}
  <SpotlightCard
    className="w-1/5 h-60 flex flex-col items-start justify-center p-6 text-white"
    spotlightColor="rgba(106, 53, 224, 1)"
  >
    <div className="text-2xl font-bold mb-2">👩‍🎓 Students</div>
    <p className="text-sm opacity-80">
      Home to over 1,200 students from diverse backgrounds fostering inclusive learning.
    </p>
  </SpotlightCard>

  {/* Teachers */}
  <SpotlightCard
    className="w-1/5 h-60 flex flex-col items-start justify-center p-6 text-white"
    spotlightColor="rgba(106, 53, 224, 1)"
  >
    <div className="text-2xl font-bold mb-2">👨‍🏫 Teachers</div>
    <p className="text-sm opacity-80">
      Guided by 80+ expert teachers committed to academic excellence and mentoring.
    </p>
  </SpotlightCard>

  {/* Achievements */}
  <SpotlightCard
    className="w-1/5 h-60 flex flex-col items-start justify-center p-6 text-white"
    spotlightColor="rgba(106, 53, 224, 1)"
  >
    <div className="text-2xl font-bold mb-2">🏆 Achievements</div>
    <p className="text-sm opacity-80">
      Recognized for excellence in academics, sports & cultural events at state & national level.
    </p>
  </SpotlightCard>
</div>

      {/* Share Button */}
      <div className="mb-10 mt-10">
        <ShareButton links={shareLinks}>
          <FaLink size={15} />
          Share
        </ShareButton>
      </div>
    </div>
  );
};

export default About;
