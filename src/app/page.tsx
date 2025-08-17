import About from "@/components/About";
import Landing from "@/components/Landing";
import Admission from "@/components/Admission"
import React from "react";

const page = () => {
  return (
    <div>
      <Landing/>
      <About/>
      <Admission/>
    </div>
  );
};

export default page;
