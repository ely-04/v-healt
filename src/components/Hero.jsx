import React from "react";
import "./Hero.css";
import plantasDiseno from '../assets/plantasdiseño.png';
import logo1 from '../assets/logo1.png';

const Hero = () => {
  return (
    <>
      <section className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-b from-[#f5f2ed] via-[#fff] to-[#e7e2d9] py-12 px-4 relative">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src={logo1} alt="Logo V-Healty" className="w-64 h-auto drop-shadow-xl mb-2" />
          <span className="text-lg text-[#c4a484] font-serif italic tracking-wide">información</span>
          <h2 className="text-4xl font-bold text-[#2d5a27] font-serif tracking-tight">SysMakers</h2>
        </div>
      </section>
  <div className="w-full flex justify-center mt-30" style={{ background: '#f5f2ed' }}>
        <img
          src={plantasDiseno}
          alt="Diseño de plantas decorativas"
          className="w-full max-h-[220px] object-cover rounded-xl shadow-lg"
        />
      </div>
            <div className="w-full h-20 bg-[#c59d6b]" style={{ zIndex: -1 }}></div>
    </>
  );
}

export default Hero;