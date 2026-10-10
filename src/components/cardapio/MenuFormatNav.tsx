import React from 'react';
import { NavLink } from 'react-router-dom';

const LINKS = [
  { to: '/cardapio', label: 'Lista' },
  { to: '/cardapio-imagem', label: 'Fotos' },
  { to: '/cardapio-video', label: 'Vídeos' },
];

type Tone = 'on-orange' | 'on-light' | 'on-dark';

const tones: Record<Tone, { active: string; idle: string }> = {
  'on-orange': {
    active: 'bg-white text-orange-700',
    idle: 'bg-white/15 text-white hover:bg-white/25',
  },
  'on-light': {
    active: 'bg-[#3e3e3e] text-white',
    idle: 'bg-[#f2f2f2] text-[#3e3e3e] hover:bg-[#e8e8e8]',
  },
  'on-dark': {
    active: 'bg-white text-black',
    idle: 'bg-white/15 text-white hover:bg-white/25',
  },
};

export const MenuFormatNav: React.FC<{ tone?: Tone }> = ({ tone = 'on-light' }) => {
  const style = tones[tone];

  return (
    <nav className="flex gap-2" aria-label="Formato do cardápio">
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end
          className={({ isActive }) =>
            `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              isActive ? style.active : style.idle
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};
