import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Sermons', href: '#' },
    { name: 'Events', href: '#' },
    { name: 'Ministers', href: '#' },
    { name: 'Become a Member', href: '#' },
    { name: 'Give', href: '#' },
  ];

  return (
    <nav className="w-full bg-black/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold tracking-wider">HILLTOP</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 text-sm text-gray-200">
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-amber-400 transition-colors">
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-200 focus:outline-none p-2"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/95 border-t border-gray-800 py-4 px-6 flex flex-col space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-amber-400 text-base transition-colors py-1"
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
