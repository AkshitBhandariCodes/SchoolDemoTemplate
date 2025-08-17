"use client";
import React from "react";
import WrapButton from "./ui/wrap-button";
import BlurText from "./blocks/TextAnimations/BlurText/BlurText";
// import logo from "../app/favicon.ico";
import Silk from "./blocks/Backgrounds/Silk/Silk";
import GooeyNav from "./blocks/Components/GooeyNav/GooeyNav";
import { Button } from "./ui/button";
// import { Link } from "next/link"

const Landing = () => {
  const Navitems = [
    { label: "Home", href: "#" },
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
  ];

  return (
    <div className="relative h-[100svh] md:h-screen w-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Silk
          speed={5}
          scale={1}
          color="#6A35E0"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>

      {/* Foreground */}
      <div className="relative z-10 flex min-h-full flex-col">
        {/* Navbar */}
       <div className="Navbar flex items-center justify-between w-screen z-20 px-8 py-6 bg-gray-950">
  <div>
    <GooeyNav
      items={Navitems}
      particleCount={15}
      particleDistances={[90, 10]}
      particleR={100}
      initialActiveIndex={0}
      animationTime={600}
      timeVariance={300}
      colors={[1, 2, 3, 1, 2, 3, 1, 4]}
    />
  </div>
  <Button className="text-white font-bold" variant={"outline"} >
    {/* <Link href="">Login</Link> */}
    Admission
  </Button>
</div>


        {/* Hero */}
        <main className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center w-screen ">
          <div className="text-orange-400">
  <BlurText
    text="Army Public School"
    delay={150}
    animateBy="words"
    direction="top"
    className="text-5xl md:text-6xl text-orange-400 font-bold"
  />
  </div>
  
  <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-200 leading-relaxed">
    Empowering young minds with knowledge, discipline, and values. <br />
    At <span className="font-semibold text-orange-400">Army Public School</span>,  
    we nurture leaders of tomorrow with excellence in academics,  
    sports, and holistic development.
  </p>

  <div className="mt-8 flex gap-4">
    <WrapButton className="px-6 py-3" href="#about">
      Explore Now
    </WrapButton>
    <WrapButton className="px-6 py-3">
      Admission Open
    </WrapButton>
  </div>

  <p className="mt-4 text-sm text-gray-300 italic">
    “Truth is God · Knowledge is Power · Discipline is Life”
  </p>
</main>
      </div>
    </div>
  );
};

export default Landing;
