import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { MenuFormatNav } from './MenuFormatNav';
import { usePublicMenu, withVideo } from './usePublicMenu';

export const VideoMenuPage: React.FC = () => {
  const { menu: fullMenu, loading, error } = usePublicMenu();
  const menu = useMemo(() => withVideo(fullMenu), [fullMenu]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const soundOn = useRef(false);
  const [muted, setMuted] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = menu;

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root || items.length === 0) return;

    const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-index]'));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const slide = entry.target as HTMLElement;
          const index = Number(slide.dataset.index || 0);
          const video = slide.querySelector('video');
          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            setActiveIndex(index);
            if (video) {
              video.muted = !soundOn.current;
              video.play().catch(() => undefined);
            }
          } else {
            video?.pause();
          }
        });
      },
      { root, threshold: [0.65] }
    );

    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [items]);

  const toggleSound = () => {
    const next = !soundOn.current;
    soundOn.current = next;
    setMuted(!next);
    scrollerRef.current?.querySelectorAll('video').forEach((video) => {
      video.muted = !next;
      if (next) video.play().catch(() => undefined);
    });
  };

  return (
    <div className="fixed inset-0 bg-black text-white">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-3 py-3">
        <Link
          to="/"
          className="pointer-events-auto rounded-full bg-black/30 p-2 backdrop-blur-sm"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="pointer-events-auto min-w-0 flex-1">
          <h1 className="truncate text-sm font-semibold">Cardápio</h1>
          {!loading && !error && items.length > 0 && (
            <p className="text-xs text-white/70">
              {activeIndex + 1} de {items.length}
            </p>
          )}
        </div>
      </header>
      <div className="absolute inset-x-0 top-14 z-20 px-3">
        <MenuFormatNav tone="on-dark" />
      </div>

      {loading && (
        <p className="flex h-full items-center justify-center text-sm text-white/70">
          Carregando vídeos...
        </p>
      )}
      {!loading && error && (
        <p className="flex h-full items-center justify-center px-6 text-center text-sm text-red-300">
          {error}
        </p>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="text-lg font-semibold">Nenhum vídeo no cardápio</p>
          <p className="max-w-sm text-sm text-white/70">
            Os itens com vídeo cadastrado aparecem aqui.
          </p>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div
          ref={scrollerRef}
          className="h-[100dvh] snap-y snap-mandatory overflow-y-scroll overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((item, index) => (
            <section
              key={item.id}
              data-index={index}
              className="relative h-[100dvh] w-full shrink-0 snap-start snap-always"
            >
              {item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  className="absolute inset-0 h-full w-full object-cover"
                  playsInline
                  loop
                  muted
                  preload={index === 0 ? 'auto' : 'metadata'}
                />
              ) : item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-neutral-950" />
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-5 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-28">
                <h2 className="max-w-[85%] text-left text-xl font-bold leading-tight">{item.name}</h2>
                {item.description && (
                  <p className="mt-2 max-w-[85%] text-left text-sm leading-snug text-white/90">
                    {item.description}
                  </p>
                )}
                {index === 0 && items.length > 1 && (
                  <p className="mt-3 text-left text-[11px] font-medium text-white/70">
                    Role para baixo para ver o próximo
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {!loading && !error && items.some((item) => item.videoUrl) && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-24 right-4 z-20 rounded-full bg-black/45 p-3 backdrop-blur-sm"
          aria-label={muted ? 'Ativar som' : 'Silenciar'}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
};
