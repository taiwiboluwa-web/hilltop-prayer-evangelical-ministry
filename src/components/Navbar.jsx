import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header className={`site-header ${scrolled ? 'header-hidden' : ''}`}>
      {/* Logo */}
      <div className="flex items-center space-x-2.5 shrink-0">
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

      {/* Desktop Links & Tablet Capsule Inline Links */}
      <nav className="nav-links noscroll hidden md:flex items-center space-x-5 text-sm text-gray-200" style={{ fontFamily: 'Outfit' }}>
        {navLinks.map((link) => (
          <a key={link.name} href={link.href} className="hover:text-[#c9a84c] transition-colors text-xs uppercase tracking-wider font-medium no-underline">
            {link.name}
          </a>
        ))}
      </nav>

      {/* Desktop / Large Screen CTA Button */}
      <div className="shrink-0 hidden md:block">
        <a href="#give" className="btn btn-gold !py-2 !px-4 !text-[0.65rem]">
          Give
        </a>
      </div>

      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden flex items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-200 focus:outline-none p-1.5 bg-white/5 rounded-lg border border-white/10"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={20} className="text-[#c9a84c]" /> : <Menu size={20} className="text-[#c9a84c]" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu (Floating neatly below the capsule header) */}
      {isOpen && (
        <div className="md:hidden absolute top-[calc(100%+12px)] left-0 right-0 bg-[rgba(15,15,24,0.96)] backdrop-blur-2xl border border-[rgba(201,168,76,0.32)] rounded-[24px] py-4 px-5 flex flex-col space-y-2.5 shadow-2xl z-50">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-gray-200 hover:text-[#c9a84c] text-xs font-medium tracking-wider uppercase transition-colors py-2 border-b border-white/5 no-underline"
              style={{ fontFamily: 'Outfit' }}
            >
              {link.name}
            </a>
          ))}
          <div className="pt-2">
            <a href="#give" onClick={() => setIsOpen(false)} className="btn btn-gold w-full justify-center !py-2.5 !text-[0.65rem]">
              Give
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
