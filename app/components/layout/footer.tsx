import React from "react";
import { Goose } from "../icons/goose";

const Footer = () => {
  return (
    <footer className="w-full fixed bottom-0 border-t border-[#003333]/20 bg-[#003333] py-2 text-sm sm:text-base">
      <div className="container mx-auto">
        <div className="flex justify-center items-center">
          <div className="flex items-center space-x-2 text-white/90">
            <a
              href="https://block.github.io/goose/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 hover:text-white hover:underline transition-colors"
            >
              Made with <Goose className="mx-1 h-4 w-4" /> codename goose
            </a>
            <span className="text-white/50">|</span>
            <a
              href="https://github.com/block/bitcoin-treasury/blob/main/DISCLAIMER.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white hover:underline transition-colors"
            >
              Disclaimer
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
