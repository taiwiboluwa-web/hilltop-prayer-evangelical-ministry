import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Sermons', href: '#sermons' },
    { name: 'Events', href: '#events' },
    { name: 'Ministers', href: '#ministers' },
    { name: 'Become a Member', href: '#become-member' },
    { name: 'Give', href: '#give' },
  ];

  return (
    <nav className="w-full max-w-[100vw] overflow-x-hidden bg-[#0a0a12]/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 border-b border-[rgba(201,168,76,0.15)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2.5">
          <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
            <polygon points="17,2 32,31 2,31" stroke="#c9a84c" strokeWidth="1.6" strokeLinejoin="round" fill="none"/>
            <line x1="17" y1="2" x2="17" y2="31" stroke="#c9a84c" strokeWidth="1" opacity="0.35"/>
            <circle cx="17" cy="18" r="2.5" fill="#c9a84c" opacity="0.7"/>
          </svg>
          <div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.82rem', letterSpacing: '0.15em', background: 'linear-gradient(135deg,#c9a84c,#e4c76b,#c9a84c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HILLTOP</div>
            <div style={{ fontFamily: 'Outfit', fontSize: '0.5rem', letterSpacing: '0.18em', color: 'rgba(201,168,76,0.5)', marginTop: '-2px' }}>MINISTRY</div>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-5 text-sm text-gray-200" style={{ fontFamily: 'Outfit' }}>
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="hover:text-[#c9a84c] transition-colors text-xs uppercase tracking-wider font-medium">
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-200 focus:outline-none p-2 bg-white/5 rounded-lg border border-white/10"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={22} className="text-[#c9a84c]" /> : <Menu size={22} className="text-[#c9a84c]" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full max-w-[100vw] bg-[#0c0c16]/98 border-t border-[rgba(201,168,76,0.2)] py-5 px-6 flex flex-col space-y-3 shadow-2xl backdrop-blur-xl">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-[#c9a84c] text-sm font-medium tracking-wider uppercase transition-colors py-2 border-b border-white/5"
              style={{ fontFamily: 'Outfit' }}
            >
              {link.name}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
[cite: 6]
