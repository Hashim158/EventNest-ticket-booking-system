// src/components/Footer.jsx
import React from 'react';
import { FiCheck } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white text-gray-700">
            <hr className="border-gray-200 mb-8" />
      {/* Top grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        
        {/* Guarantee block */}
        <div>
          <div className="flex items-center mb-4">
            {/* replace with your logo */}
            <span className="ml-2 font-bold uppercase">Guarantee</span>
          </div>
          <ul className="space-y-2 text-sm">
            {[
              'World class security checks',
              'Transparent pricing',
              '100% order guarantee',
              'Customer service from start to finish'
            ].map((line) => (
              <li key={line} className="flex items-start">
                <FiCheck className="mt-1 text-green-500 mr-2" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Our Company */}
        <div>
          <h3 className="font-semibold mb-4">Our Company</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/about" className="hover:underline">About Us</a></li>
            <li><a href="/affiliate" className="hover:underline">Affiliate Program</a></li>
            <li><a href="/careers" className="hover:underline">Careers</a></li>
            <li><a href="/organizers" className="hover:underline">Event Organizers</a></li>
          </ul>
        </div>

        {/* Have Questions? */}
        <div>
          <h3 className="font-semibold mb-4">Have Questions?</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:underline">Help Center / Contact Us</a></li>
            <li><a href="/lowest-price" className="hover:underline">Lowest Price Guarantee</a></li>
          </ul>
        </div>

        {/* Live events all over the world */}
        <div>
          <h3 className="font-semibold mb-4">Live events all over the world</h3>
          <div className="space-y-4 text-sm">
            <select className="w-full border border-gray-300 rounded p-2">
              <option>🇺🇸 United States</option>
              <option>🇵🇰 Pakistan</option>
              <option>🇬🇧 United Kingdom</option>
              {/* add more */}
            </select>

            <select className="w-full border-t-0 border-l border-r border-b border-gray-300 rounded p-2">
              <option>English (US)</option>
              <option>اردو</option>
              <option>हिन्दी</option>
              {/* add more */}
            </select>

            <select className="w-full border border-gray-300 rounded p-2">
              <option>US$ United States Dollar</option>
              <option>PKR Pakistani Rupee</option>
              <option>GBP British Pound</option>
              {/* add more */}
            </select>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between text-xs text-gray-500">
        <span>
          © YourCompany Inc {new Date().getFullYear()}{' '}
          <a href="/company-details" className="hover:underline">Company Details</a>
        </span>
        <div className="space-x-4 mt-2 md:mt-0">
          <a href="/terms" className="hover:underline">Terms and Conditions</a>
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/cookies" className="hover:underline">Cookies Policy</a>
          <a href="/mobile-privacy" className="hover:underline">Mobile Privacy Policy</a>
          <a href="/privacy-choices" className="hover:underline">Your Privacy Choices</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
