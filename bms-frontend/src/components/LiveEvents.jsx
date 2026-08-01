import React from 'react';
import { events } from '../utils/constants';
import { FaTicketAlt, FaStar } from 'react-icons/fa';

const LiveEvents = () => {
  return (
    <section className="w-full py-10 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FaStar className="text-amber-400 text-lg" /> The Best Of Live Events
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Concerts, comedy shows, plays & sports activities happening near you</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {events.map((event, i) => (
            <div
              key={i}
              className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-md dark:shadow-lg border border-slate-200 dark:border-slate-800 hover:border-rose-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <img
                src={event.img}
                alt={event.title}
                className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <h4 className="text-xs font-black text-white group-hover:text-rose-400 transition-colors uppercase tracking-wider">
                  {event.title}
                </h4>
                <p className="text-[11px] font-semibold text-rose-400 mt-0.5">
                  {event.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveEvents;