import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import mainLogo from "../../assets/main-icon-white.png";

const SOCIAL_LINKS = [
  { icon: FaLinkedinIn, url: "https://www.linkedin.com/in/gauravyadav314/", title: "LinkedIn" },
  { icon: FaGithub, url: "https://github.com/gauravyadav314", title: "GitHub" },
  { icon: FaFacebookF, url: "#", title: "Facebook" },
  { icon: FaTwitter, url: "#", title: "Twitter" },
  { icon: FaInstagram, url: "#", title: "Instagram" },
  { icon: FaYoutube, url: "#", title: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center">
        {/* Logo */}
        <img src={mainLogo} alt="BookMyScreen Logo" className="h-10 mb-6 object-contain filter invert dark:invert-0 transition" />

        {/* Social Icons */}
        <div className="flex space-x-3 mb-6">
          {SOCIAL_LINKS.map(({ icon: Icon, url, title }, idx) => (
            <a
              key={idx}
              href={url}
              target={url !== "#" ? "_blank" : undefined}
              rel={url !== "#" ? "noopener noreferrer" : undefined}
              title={title}
              aria-label={title}
              className="p-2.5 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white dark:hover:text-white hover:border-rose-500 transition cursor-pointer shadow-sm flex items-center justify-center"
            >
              <Icon className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Copyright 2026 © BookMyScreen Entertainment Services Pvt. Ltd. All Rights Reserved.
        </p>
        <p className="text-center text-[11px] text-slate-500 dark:text-slate-500 max-w-3xl mt-2 leading-relaxed">
          The content, movie posters, and images used on this site are copyright protected and copyright vests with the respective owners. Intended strictly for demonstration & tutorial purposes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
