import React, { useState } from "react";
import Slider from "react-slick";
import { banners } from "../../utils/constants";
import { FaPlay, FaTicketAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useLocation } from "../../context/LocationContext";

const BANNER_TRAILERS = [
  "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  "https://www.youtube.com/embed/shW9i6k8cB0?autoplay=1",
  "https://www.youtube.com/embed/8Qn_spdM5Zg?autoplay=1",
  "https://www.youtube.com/embed/6ZfuNTqbHE8?autoplay=1"
];

const BannerSlider = () => {
  const navigate = useNavigate();
  const { location } = useLocation();
  const [activeTrailer, setActiveTrailer] = useState(null);

  const settings = {
    centerMode: true,
    centerPadding: "100px",
    slidesToShow: 1,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 700,
    arrows: true,
    dots: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: { centerMode: true, centerPadding: "60px" },
      },
      {
        breakpoint: 1024,
        settings: { centerMode: true, centerPadding: "30px" },
      },
      {
        breakpoint: 640,
        settings: { centerMode: false, centerPadding: "0px", slidesToShow: 1 },
      },
    ],
  };

  return (
    <div className="w-full bg-slate-200 dark:bg-slate-950 py-4 sm:py-6 overflow-hidden border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-4">
        <Slider {...settings}>
          {banners.map((banner, i) => {
            const isObj = typeof banner === "object" && banner !== null;
            const desktopImg = isObj ? banner.desktop || banner.laptop || banner.mobile : banner;
            const trailerUrl = BANNER_TRAILERS[i % BANNER_TRAILERS.length];

            return (
              <div key={isObj ? banner.id || i : i} className="px-1 sm:px-2 outline-none">
                <div 
                  onClick={() => navigate("/movies")}
                  className="relative group rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl border border-slate-200 dark:border-slate-800/80 cursor-pointer"
                >
                  <picture className="w-full block">
                    <img
                      src={desktopImg}
                      alt={`Featured Movie Banner ${i + 1}`}
                      className="w-full aspect-[2.2/1] sm:aspect-[2.8/1] md:aspect-[3.2/1] max-h-[420px] object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </picture>
                </div>
              </div>
            );
          })}
        </Slider>
      </div>

      {/* Trailer Dialog Modal */}
      {activeTrailer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTrailer(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 dark:bg-slate-800/80 p-2 rounded-full z-10 transition cursor-pointer"
            >
              <FaTimes />
            </button>
            <div className="aspect-video w-full">
              <iframe
                src={activeTrailer}
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
