import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Terminal, Database, Activity, Cpu, Menu, X, ChevronDown } from 'lucide-react';

// --- GLOBAL STYLES & TOKENS ---
const GlobalStyles = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
    :root {
      --color-paper: #FFFFFF;
      --color-signal: #482d55;     /* Your Brand Purple */
      --color-offwhite: #F8F6FA;   /* Very subtle purple-tinted white */
      --color-void: #1A101E;       /* Deep dark purple-black for text/contrast */
    }

    body {
      background-color: var(--color-paper);
      color: var(--color-void);
      font-family: 'Space Grotesk', sans-serif;
      position: relative;
    }

    /* Cinematic Noise Overlay */
    body::before {
      content: "";
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
      opacity: 0.05;
      mix-blend-mode: multiply;
    }

    .font-drama { font-family: 'DM Serif Display', serif; }
    .font-mono { font-family: 'Space Mono', monospace; }

    /* Magnetic Button Micro-interaction */
    .magnetic-btn {
      position: relative;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }
    .magnetic-btn:hover {
      transform: scale(1.03) translateY(-1px);
    }
    .magnetic-btn::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background-color: var(--color-void);
      transform: translateX(-100%);
      transition: transform 0.5s ease-in-out;
      z-index: 0;
    }
    .magnetic-btn:hover::before {
      transform: translateX(0);
    }
    .magnetic-btn > * {
      position: relative;
      z-index: 10;
    }

    /* Scroll Reveal Utility Classes */
    .reveal-up {
      opacity: 0;
      transform: translateY(40px);
      transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .reveal-up.in-view {
      opacity: 1;
      transform: translateY(0);
    }

    /* === PORTFOLIO SECTION === */
    .portfolio-section {
      background: radial-gradient(ellipse 100% 70% at 50% 50%, #F0EBF5 0%, #FFFFFF 65%);
    }

    .portfolio-card {
      position: relative;
      overflow: hidden;
      border-radius: 1.75rem;
      aspect-ratio: 4 / 3;
      cursor: crosshair;
      border: 1px solid rgba(72, 45, 85, 0.15);
      transition: box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    .portfolio-card.card-dimmed { opacity: 0.4; }

    .portfolio-card.card-revealed {
      box-shadow: 0 30px 80px rgba(72, 45, 85, 0.4), 0 10px 30px rgba(0, 0, 0, 0.25);
      z-index: 10;
    }

    .portfolio-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 15;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.2);
      letter-spacing: 0.15em;
      pointer-events: none;
      user-select: none;
    }

    @property --pf-border-angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    @keyframes pf-border-spin {
      to { --pf-border-angle: 360deg; }
    }

    .card-border-el {
      position: absolute;
      inset: 0;
      border-radius: 1.75rem;
      padding: 1.5px;
      background: conic-gradient(from var(--pf-border-angle, 0deg), transparent 55%, #7b4fa0 75%, #482d55 85%, transparent 100%);
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: destination-out;
      mask-composite: exclude;
      pointer-events: none;
      z-index: 20;
      opacity: 0;
      transition: opacity 0.5s ease;
      animation: pf-border-spin 3s linear infinite;
    }

    .card-border-el.active { opacity: 1; }

    .spotlight-overlay {
      position: absolute;
      inset: 0;
      z-index: 2;
      background-color: #482d55;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E");
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .portfolio-card.card-revealed .spotlight-overlay {
      opacity: 0;
      transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .card-info-unrevealed {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 3;
      padding: 1.5rem;
      pointer-events: none;
      background: linear-gradient(to top, rgba(26, 16, 30, 0.75) 0%, transparent 100%);
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .card-info-revealed {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 4;
      display: flex;
      align-items: flex-end;
      padding: 1.25rem 1.5rem;
      background: linear-gradient(to top, rgba(26, 16, 30, 0.95) 0%, rgba(26, 16, 30, 0.6) 60%, transparent 100%);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .hover-hint {
      position: absolute;
      bottom: 5rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.5);
      white-space: nowrap;
      pointer-events: none;
    }

    .hover-hint-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.55);
      flex-shrink: 0;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.5); opacity: 1; }
    }

    .mobile-carousel {
      display: flex;
      overflow-x: scroll;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      -ms-overflow-style: none;
      gap: 1rem;
      padding: 0.5rem 1.5rem;
      padding-right: 10%;
    }

    .mobile-carousel::-webkit-scrollbar { display: none; }

    .mobile-card {
      flex: 0 0 82%;
      scroll-snap-align: start;
      position: relative;
      border-radius: 1.5rem;
      overflow: hidden;
      aspect-ratio: 4 / 3;
      border: 1px solid rgba(72, 45, 85, 0.2);
    }

    .curtain {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 50%;
      z-index: 2;
      background-color: #482d55;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.12'/%3E%3C/svg%3E");
      transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .curtain-left { left: 0; }
    .curtain-right { right: 0; }

    .mobile-card.slide-revealed .curtain-left { transform: translateX(-100%); }
    .mobile-card.slide-revealed .curtain-right { transform: translateX(100%); }

    .mobile-card-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 3;
      padding: 1.25rem;
      pointer-events: none;
      background: linear-gradient(to top, rgba(26, 16, 30, 0.75) 0%, transparent 100%);
      transition: opacity 0.3s ease;
    }

    .mobile-card-revealed-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 4;
      padding: 1.25rem;
      background: linear-gradient(to top, rgba(26, 16, 30, 0.92) 0%, transparent 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      transition: opacity 0.4s ease 0.4s;
    }

    .carousel-dot {
      height: 8px;
      width: 8px;
      border-radius: 50%;
      background: rgba(72, 45, 85, 0.25);
      border: none;
      cursor: pointer;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      padding: 0;
    }

    .carousel-dot.active {
      background: #482d55;
      width: 24px;
      border-radius: 4px;
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
  `}} />
);

// --- CUSTOM HOOK: Intersection Observer for Scroll Reveals ---
const useScrollReveal = (options = { threshold: 0.1 }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const domElements = document.querySelectorAll('.reveal-up');
    domElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);
};

// --- COMPONENT: Magnetic Button ---
const Button = ({ children, primary = false, className = "", href }) => {
  const Tag = href ? 'a' : 'button';
  const isExternal = href && !href.startsWith('#');
  return (
    <Tag href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined} className={`magnetic-btn group flex items-center gap-3 px-8 py-4 rounded-full font-bold tracking-tight ${primary ? 'bg-[#482d55] text-white' : 'bg-[#FFFFFF] text-[#1A101E] border border-[#1A101E]/10'} ${className} inline-flex cursor-pointer no-underline`}>
      <span className={`group-hover:text-white transition-colors duration-300`}>{children}</span>
      <ArrowRight size={18} className={`group-hover:text-white group-hover:translate-x-1 transition-all duration-300`} />
    </Tag>
  );
};

// --- COMPONENT: Cal.com Booking Embed ---
const CalBookingSection = () => {
  const calInitialized = useRef(false);

  useEffect(() => {
    if (calInitialized.current) return;
    calInitialized.current = true;

    // Load and initialize Cal.com embed
    (function (C, A, L) {
      let p = function (a, ar) { a.q.push(ar); };
      let d = C.document;
      C.Cal = C.Cal || function () {
        let cal = C.Cal;
        let ar = arguments;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          d.head.appendChild(d.createElement("script")).src = A;
          cal.loaded = true;
        }
        if (ar[0] === L) {
          const api = function () { p(api, arguments); };
          const namespace = ar[1];
          api.q = api.q || [];
          if (typeof namespace === "string") {
            cal.ns[namespace] = cal.ns[namespace] || api;
            p(cal.ns[namespace], ar);
            p(cal, ["initNamespace", namespace]);
          } else p(cal, ar);
          return;
        }
        p(cal, ar);
      };
    })(window, "https://app.cal.com/embed/embed.js", "init");

    window.Cal("init", { origin: "https://cal.com" });
    window.Cal("inline", {
      elementOrSelector: "#my-cal-inline",
      calLink: "theaifundi/intro",
      layout: "month_view"
    });
    window.Cal("ui", {
      theme: "light",
      styles: { branding: { brandColor: "#482d55" } },
      hideEventTypeDetails: false,
      layout: "month_view"
    });
  }, []);

  return (
    <section id="book-a-call" className="py-24 px-8 md:px-16 bg-[#FFFFFF] border-t border-[#1A101E]/5">
      <div className="max-w-3xl mx-auto text-center reveal-up mb-12">
        <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-[2px] bg-[#482d55]"></span>
          Let's Talk
          <span className="w-8 h-[2px] bg-[#482d55]"></span>
        </h4>
        <h2 className="font-bold text-4xl md:text-5xl tracking-tight text-[#1A101E] mb-6">Let's Talk About Your Business</h2>
        <p className="font-mono text-[#1A101E]/70 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Book a free 15-minute call. No pitch, no pressure — just an honest conversation about where AI can help.
        </p>
      </div>
      {/* Cal.com Inline Embed */}
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div
          id="my-cal-inline"
          style={{
            width: '100%',
            minHeight: '650px',
            overflow: 'auto',
            borderRadius: '1.5rem',
            border: '1px solid rgba(26, 16, 30, 0.08)',
            boxShadow: '0 4px 24px rgba(72, 45, 85, 0.06)',
            background: '#FAFAFA',
          }}
        ></div>
      </div>
    </section>
  );
};

// --- COMPONENT: Portfolio Section ---
const PORTFOLIO_PROJECTS = [
  { title: "Kiddo", desc: "AI-powered childcare documentation platform — voice to portfolio", href: "https://kiddo.now/", tag: "AI App", img: "/portfolio/kiddo.jpg", study: "/case-studies/kiddo.html" },
  { title: "Hakuna Matata Daycare", desc: "Bilingual daycare website — Mettmann, Germany", href: "https://hakunamatata.biz/", tag: "Childcare", img: "/portfolio/hakuna-matata.jpg", study: "/case-studies/hakuna-matata.html" },
  { title: "Across the King's River", desc: "African wisdom & spiritual transformation platform", href: "https://acrossthekingsriver.com/", tag: "Community", img: "/portfolio/kings-river.jpg" },
  { title: "Blooms & Botanicals", desc: "Black-owned floral design & plant styling", href: "https://bloomsbotanicals.com/", tag: "Floral Design", img: "/portfolio/blooms-botanicals.jpg" },
  { title: "Delta Personal Services", desc: "Professional recruitment & personal services", href: "https://deltapersonalservice.biz/", tag: "Recruitment", img: "/portfolio/delta-personal.jpg" },
  { title: "Precision Fabricated Components", desc: "Custom metal fabrication — DeLand, FL", href: "https://www.precisionfabricated.com/", tag: "Manufacturing", img: "/portfolio/precision-fabricated.jpg" },
  { title: "St. Annis Baptist Church", desc: "Faith, community, and worship services", href: "https://stannispbc.net/", tag: "Church", img: "/portfolio/st-annis.jpg" },
  { title: "Prisms & Platters", desc: "Food, travel & lifestyle reviews — Bay Area, CA", href: "https://prismsandplatters.com/", tag: "Food & Travel", img: "/portfolio/prisms-platters.jpg", study: "/case-studies/prisms-and-platters.html" },
];

const PortfolioSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [revealedCard, setRevealedCard] = useState(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [revealedSlides, setRevealedSlides] = useState(new Set());

  const cardRefs = useRef([]);
  const overlayRefs = useRef([]);
  const hoverTimers = useRef({});
  const sectionRef = useRef(null);
  const ctaRef = useRef(null);
  const carouselRef = useRef(null);
  const slideTimers = useRef({});
  const lastSlideRef = useRef(0);

  // Parallax — direct DOM updates to avoid re-renders
  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const progress = (window.innerHeight / 2 - rect.top) / (rect.height + window.innerHeight);
      const offset = (progress - 0.5) * 25;
      document.querySelectorAll('.pf-screenshot-img').forEach(img => {
        img.style.transform = `translateY(${offset}px)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // CTA reveal
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setCtaVisible(true);
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Mobile carousel scroll + auto-reveal
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    slideTimers.current.init = setTimeout(() => setRevealedSlides(new Set([0])), 1200);

    const onScroll = () => {
      const cardWidth = (carousel.children[0]?.offsetWidth || carousel.offsetWidth * 0.82) + 16;
      const newIndex = Math.min(Math.round(carousel.scrollLeft / cardWidth), PORTFOLIO_PROJECTS.length - 1);
      if (newIndex === lastSlideRef.current) return;
      lastSlideRef.current = newIndex;
      setActiveSlide(newIndex);
      setRevealedSlides(new Set());
      clearTimeout(slideTimers.current.active);
      slideTimers.current.active = setTimeout(() => setRevealedSlides(new Set([newIndex])), 500);
    };

    carousel.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      carousel.removeEventListener('scroll', onScroll);
      Object.values(slideTimers.current).forEach(t => clearTimeout(t));
    };
  }, []);

  const handleMouseMove = (e, index) => {
    const card = cardRefs.current[index];
    const overlay = overlayRefs.current[index];
    if (!card || !overlay) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (revealedCard !== index) {
      const mask = `radial-gradient(circle at ${x}px ${y}px, transparent 70px, rgba(72,45,85,0.97) 120px)`;
      overlay.style.maskImage = mask;
      overlay.style.webkitMaskImage = mask;
    }

    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const ry = ((x - cx) / cx) * 4;
    const rx = -((y - cy) / cy) * 3;
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)${revealedCard === index ? ' scale(1.03)' : ''}`;
  };

  const handleMouseEnter = (index) => {
    setHoveredCard(index);
    if (!hintDismissed) setHintDismissed(true);
    hoverTimers.current[index] = setTimeout(() => {
      setRevealedCard(index);
      const overlay = overlayRefs.current[index];
      if (overlay) { overlay.style.maskImage = ''; overlay.style.webkitMaskImage = ''; }
    }, 1500);
  };

  const handleMouseLeave = (index) => {
    setHoveredCard(null);
    if (revealedCard === index) setRevealedCard(null);
    clearTimeout(hoverTimers.current[index]);
    const card = cardRefs.current[index];
    if (card) {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16,1,0.3,1)';
      card.style.transform = '';
      setTimeout(() => { if (card) card.style.transition = ''; }, 500);
    }
    const overlay = overlayRefs.current[index];
    if (overlay) { overlay.style.maskImage = ''; overlay.style.webkitMaskImage = ''; }
  };

  return (
    <section id="portfolio" ref={sectionRef} className="portfolio-section py-24 md:py-32 px-8 md:px-16 border-t border-[#1A101E]/5">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="reveal-up mb-16">
          <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#482d55]"></span>
            Examples
          </h4>
          <h2 className="font-bold text-4xl md:text-6xl tracking-tight text-[#1A101E] mb-4">Built by The AI Fundi</h2>
          <p className="font-mono text-[#1A101E]/60 text-sm md:text-base">A few examples of websites, apps, and AI systems built for real clients.</p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-6">
          {PORTFOLIO_PROJECTS.map((project, index) => {
            const isHovered = hoveredCard === index;
            const isRevealed = revealedCard === index;
            const isDimmed = (hoveredCard !== null || revealedCard !== null) && !isHovered && !isRevealed;
            return (
              <div
                key={index}
                ref={el => cardRefs.current[index] = el}
                className={`portfolio-card${isRevealed ? ' card-revealed' : ''}${isDimmed ? ' card-dimmed' : ''}`}
                onMouseMove={e => handleMouseMove(e, index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                <div className="portfolio-badge">0{index + 1}</div>
                <div className={`card-border-el${isHovered || isRevealed ? ' active' : ''}`} />

                {/* Screenshot */}
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    src={project.img}
                    alt={project.title}
                    className="pf-screenshot-img w-full h-[115%] object-cover object-top"
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                </div>

                {/* Spotlight overlay */}
                <div ref={el => overlayRefs.current[index] = el} className="spotlight-overlay" />

                {/* Info: unrevealed */}
                <div
                  className="card-info-unrevealed"
                  style={{ opacity: isRevealed ? 0 : 1, pointerEvents: isRevealed ? 'none' : 'auto' }}
                >
                  <span className="font-mono text-[10px] font-bold text-[#E8D0F5] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest mb-3 block w-fit">{project.tag}</span>
                  <h3 className="font-bold text-xl tracking-tight text-white mb-2">{project.title}</h3>
                  <p className="font-mono text-xs text-white/60 leading-relaxed">{project.desc}</p>
                </div>

                {/* Info: revealed bottom bar */}
                <div
                  className="card-info-revealed"
                  style={{ opacity: isRevealed ? 1 : 0, transform: isRevealed ? 'translateY(0)' : 'translateY(12px)', pointerEvents: isRevealed ? 'auto' : 'none' }}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <span className="font-mono text-[10px] font-bold text-[#E8D0F5] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest mb-2 block w-fit">{project.tag}</span>
                    <h3 className="font-bold text-base tracking-tight text-white mb-1 truncate">{project.title}</h3>
                    <p className="font-mono text-xs text-white/60 truncate">{project.desc}</p>
                  </div>
                  <div className="shrink-0 flex flex-col gap-2 items-stretch">
                    {project.study && (
                      <a href={project.study} className="font-mono text-xs font-bold text-white border border-white/30 hover:border-white/60 px-4 py-2 rounded-full transition-colors no-underline text-center whitespace-nowrap">
                        Case Study
                      </a>
                    )}
                    <a href={project.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold text-white bg-[#482d55] hover:bg-[#5a3a6b] px-4 py-2 rounded-full transition-colors no-underline flex items-center justify-center gap-1 whitespace-nowrap">
                      View Site <ArrowRight size={12} />
                    </a>
                  </div>
                </div>

                {/* Hover hint on first card */}
                {index === 0 && !hintDismissed && (
                  <div className="hover-hint">
                    <span className="hover-hint-dot" />
                    Hover to reveal
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <div ref={carouselRef} className="mobile-carousel">
            {PORTFOLIO_PROJECTS.map((project, index) => {
              const isRevealed = revealedSlides.has(index);
              return (
                <div key={index} className={`mobile-card${isRevealed ? ' slide-revealed' : ''}`}>
                  <div className="portfolio-badge">0{index + 1}</div>
                  <img src={project.img} alt={project.title} className="absolute inset-0 w-full h-full object-cover object-top" loading="lazy" />
                  <div className="curtain curtain-left" />
                  <div className="curtain curtain-right" />
                  <div className="mobile-card-info" style={{ opacity: isRevealed ? 0 : 1, pointerEvents: isRevealed ? 'none' : 'auto' }}>
                    <span className="font-mono text-[10px] font-bold text-[#E8D0F5] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest mb-2 block w-fit">{project.tag}</span>
                    <h3 className="font-bold text-xl tracking-tight text-white mb-1">{project.title}</h3>
                    <p className="font-mono text-xs text-white/60">{project.desc}</p>
                  </div>
                  <div className="mobile-card-revealed-info" style={{ opacity: isRevealed ? 1 : 0, pointerEvents: isRevealed ? 'auto' : 'none' }}>
                    <span className="font-mono text-[10px] font-bold text-[#E8D0F5] bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest mb-2 block w-fit">{project.tag}</span>
                    <div className="flex items-end justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-base tracking-tight text-white mb-1 truncate">{project.title}</h3>
                        <p className="font-mono text-xs text-white/60 truncate">{project.desc}</p>
                      </div>
                      <div className="shrink-0 flex gap-2">
                        {project.study && (
                          <a href={project.study} className="font-mono text-xs font-bold text-white border border-white/30 px-3 py-1.5 rounded-full no-underline whitespace-nowrap">Story</a>
                        )}
                        <a href={project.href} target="_blank" rel="noopener noreferrer" className="font-mono text-xs font-bold text-white bg-[#482d55] px-3 py-1.5 rounded-full no-underline whitespace-nowrap">Visit →</a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center items-center gap-2 mt-5">
            {PORTFOLIO_PROJECTS.map((_, i) => (
              <button
                key={i}
                className={`carousel-dot${activeSlide === i ? ' active' : ''}`}
                onClick={() => {
                  if (!carouselRef.current) return;
                  const cardWidth = (carouselRef.current.children[0]?.offsetWidth || carouselRef.current.offsetWidth * 0.82) + 16;
                  carouselRef.current.scrollTo({ left: i * cardWidth, behavior: 'smooth' });
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="mt-16 text-center"
          style={{
            opacity: ctaVisible ? 1 : 0,
            transform: ctaVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <a href="#book-a-call" className="font-mono text-[#482d55] text-sm font-bold hover:text-[#1A101E] transition-colors underline-offset-4 hover:underline">
            Want something like this? Let's talk. →
          </a>
        </div>

      </div>
    </section>
  );
};

// --- COMPONENT: Email Capture / Lead Magnet ---
// Kit (ConvertKit) form ID — the number in the form's embed code or share URL.
// Until it's set, the form shows a fallback message instead of submitting.
const KIT_FORM_ID = "9726759";

const EmailCaptureSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!KIT_FORM_ID) { setStatus("error"); return; }
    setStatus("sending");
    try {
      const data = new FormData();
      data.append("email_address", email);
      const res = await fetch(`https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = await res.json();
      setStatus(json.status === "success" ? "success" : "error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="free-audit" className="py-24 md:py-32 px-8 md:px-16 bg-[#482d55] relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto text-center reveal-up">
        <h4 className="font-mono text-white/60 text-sm font-bold tracking-widest uppercase mb-4 flex items-center justify-center gap-3">
          <span className="w-8 h-[2px] bg-white/40"></span>
          Free Guide
          <span className="w-8 h-[2px] bg-white/40"></span>
        </h4>
        <h2 className="font-bold text-4xl md:text-6xl tracking-tight text-white mb-6">
          The 15-Minute <span className="font-drama italic font-normal">AI Audit.</span>
        </h2>
        <p className="font-mono text-white/80 text-sm md:text-base leading-relaxed max-w-2xl mx-auto mb-10">
          The exact checklist I use to walk through a client's business and find the hours AI can give back. Score five areas, get your number, know where to start. Free — sent straight to your inbox.
        </p>

        {status === "success" ? (
          <div className="max-w-xl mx-auto bg-white/10 border border-white/20 rounded-2xl px-8 py-6">
            <p className="font-bold text-white text-lg mb-1">Check your inbox 📬</p>
            <p className="font-mono text-white/70 text-sm">The 15-Minute AI Audit is on its way. (Nothing there? Check spam and mark it safe.)</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <label htmlFor="lead-email" className="sr-only">Email address</label>
            <input
              id="lead-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="flex-1 px-6 py-4 rounded-full font-mono text-sm bg-white text-[#1A101E] placeholder-[#1A101E]/40 focus:outline-none focus:ring-4 focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="magnetic-btn bg-[#1A101E] text-white font-bold px-8 py-4 rounded-full whitespace-nowrap disabled:opacity-60"
            >
              <span>{status === "sending" ? "Sending…" : "Send me the audit"}</span>
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="font-mono text-white/80 text-xs mt-4">
            Hmm, that didn't go through. You can also grab it on a <a href="#book-a-call" className="underline font-bold">free call</a> — I'll send it personally.
          </p>
        )}
        {status !== "success" && (
          <p className="font-mono text-white/50 text-xs mt-6">No spam, no daily emails. Just the guide and the occasional practical AI tip. Unsubscribe anytime.</p>
        )}
      </div>
    </section>
  );
};

// --- COMPONENT: Cookie Consent Banner ---
// Set your Google Analytics Measurement ID (e.g. "G-XXXXXXXXXX") to activate the
// banner. While empty, no cookies are set and no banner is shown. Analytics only
// loads after the visitor clicks Accept.
const GA_MEASUREMENT_ID = "";

const loadAnalytics = () => {
  if (!GA_MEASUREMENT_ID || window.dataLayer) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setVisible(true);
    else if (consent === 'accepted') loadAnalytics();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    loadAnalytics();
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[300] p-4 md:p-6">
      <div className="max-w-4xl mx-auto bg-[#1A101E] border border-white/10 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
        <p className="font-mono text-white/70 text-sm text-center sm:text-left leading-relaxed">
          This site uses analytics cookies to understand how visitors use it. See the <a href="/privacy.html" className="underline hover:text-white">privacy policy</a>.
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="font-mono text-sm text-white/50 hover:text-white transition-colors px-5 py-2 rounded-full border border-white/10 hover:border-white/30"
            style={{ minHeight: '44px' }}
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="font-mono text-sm font-bold text-white bg-[#482d55] hover:bg-[#5a3a6b] transition-colors px-6 py-2 rounded-full"
            style={{ minHeight: '44px' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: FAQ Section ---
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "What is The AI Fundi Lab?", a: "The AI Fundi Lab is a paid community on Skool where AI-curious professionals learn to use AI the practical way. Members get step-by-step builds, weekly live sessions, direct support, templates, and a community of people doing the same thing." },
    { q: "Who is The AI Fundi for?", a: "The AI Fundi Lab is for professionals, small business owners, nonprofit leaders, and anyone who is AI-curious and wants to learn how to use AI tools practically — without needing a technical background." },
    { q: "What services does The AI Fundi offer?", a: "The AI Fundi offers three done-for-you services: AI-Powered Websites (professional sites built with AI tools), AI Workflows & Automations (custom AI systems tailored to your business), and AI Audits (a review of your business to identify where AI can save time and money)." },
    { q: "Who is Chris Conley?", a: "Chris Conley is The AI Fundi — an AI consultant and builder with 18+ years of global corporate business experience spanning engineering, sales, strategy, and AI. He helps professionals and businesses use AI to multiply output, cut costs, and do more with less." },
    { q: "How do I book a call with The AI Fundi?", a: "You can book a free 15-minute intro call at cal.com/theaifundi/intro. No pitch, no pressure — just an honest conversation about where AI can help your business." }
  ];

  return (
    <section id="faq" className="py-24 px-8 md:px-16 bg-[#FFFFFF] border-t border-[#1A101E]/5">
      <div className="max-w-3xl mx-auto">
        <div className="reveal-up mb-12 text-center">
          <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center justify-center gap-3">
            <span className="w-8 h-[2px] bg-[#482d55]"></span>
            FAQ
            <span className="w-8 h-[2px] bg-[#482d55]"></span>
          </h4>
          <h2 className="font-bold text-4xl md:text-5xl tracking-tight text-[#1A101E] mb-6">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="reveal-up border border-[#1A101E]/10 rounded-2xl overflow-hidden bg-white" style={{ transitionDelay: `${Math.min(idx * 100, 400)}ms` }}>
              <button
                className="w-full text-left px-6 py-5 flex justify-between items-center bg-white hover:bg-[#F8F6FA] transition-colors focus:outline-none"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                aria-expanded={openIndex === idx}
              >
                <h3 className="font-bold text-[#1A101E] text-lg select-none">{faq.q}</h3>
                <ChevronDown className={`text-[#482d55] transition-transform duration-300 shrink-0 ml-4 ${openIndex === idx ? 'rotate-180' : ''}`} size={20} />
              </button>
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: openIndex === idx ? '500px' : '0' }}
              >
                <div className="px-6 pb-5 pt-1">
                  <p className="font-mono text-[#1A101E]/70 text-sm leading-relaxed whitespace-pre-line">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- MAIN APPLICATION ---
export default function App() {
  useScrollReveal();
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- INTERACTION: Telemetry Typewriter ---
  const [telemetry, setTelemetry] = useState("");
  const fullText = "> LIVE_SESSIONS_ACTIVE\n> COMMUNITY_SYNC... OK\n> AWAITING_INPUT_";

  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      setTelemetry(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(typing);
    }, 50);
    return () => clearInterval(typing);
  }, []);

  // --- INTERACTION: Shuffler Card ---
  const [shuffler, setShuffler] = useState(["Prompt Architecture", "Workflow Automations", "Swipe Files"]);
  useEffect(() => {
    const interval = setInterval(() => {
      setShuffler(prev => {
        const newArr = [...prev];
        newArr.unshift(newArr.pop());
        return newArr;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- INTERACTION: Nav Scroll Listener ---
  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- INTERACTION: Lock body scroll when mobile menu is open ---
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // --- INTERACTION: Hero Initial Load ---
  useEffect(() => {
    setTimeout(() => {
      document.querySelectorAll('.hero-reveal').forEach(el => el.classList.add('in-view'));
    }, 100);
  }, []);

  return (
    <div className="bg-[#FFFFFF] min-h-screen overflow-x-hidden selection:bg-[#482d55] selection:text-white pb-0">
      <GlobalStyles />

      {/* A. NAVBAR */}
      <nav className={`fixed top-6 z-50 px-5 py-3 rounded-full flex items-center justify-between transition-all duration-500 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto md:gap-8 md:px-8 ${navScrolled ? 'bg-[#FFFFFF]/90 backdrop-blur-xl border border-[#1A101E]/10 text-[#1A101E] shadow-lg' : 'bg-[#1A101E]/50 backdrop-blur-md text-[#FFFFFF] md:bg-transparent md:backdrop-blur-none'}`}>
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 no-underline shrink-0">
          <img
            src="/logo.svg"
            alt="The AI Fundi"
            className={`h-7 w-auto transition-all duration-500 ${navScrolled ? '' : 'brightness-0 invert'}`}
          />
          <span className="font-bold tracking-tighter text-sm md:text-base uppercase">The AI Fundi</span>
        </a>
        {/* Desktop links */}
        <div className="hidden md:flex gap-6 font-mono text-sm">
          <a href="#lab" className="hover:-translate-y-[1px] transition-transform">Lab</a>
          <a href="#host" className="hover:-translate-y-[1px] transition-transform">The Fundi</a>
          <a href="#services" className="hover:-translate-y-[1px] transition-transform">Services</a>
          <a href="#portfolio" className="hover:-translate-y-[1px] transition-transform">Portfolio</a>
          <a href="#book-a-call" className="hover:-translate-y-[1px] transition-transform">Book a Call</a>
        </div>
        {/* Desktop CTA */}
        <a href="https://www.skool.com/aifundi" target="_blank" rel="noopener noreferrer" className={`hidden md:inline-block px-5 py-2 rounded-full font-bold text-sm transition-transform hover:scale-105 no-underline cursor-pointer ${navScrolled ? 'bg-[#482d55] text-white' : 'bg-white text-[#482d55]'}`}>
          Join Lab
        </a>
        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center rounded-full transition-colors"
          style={{ minHeight: '44px', minWidth: '44px' }}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
        >
          <Menu size={22} />
        </button>
      </nav>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-0 z-[200] bg-[#1A101E] flex flex-col"
        >
          <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
            <a href="/" className="flex items-center gap-2 no-underline" onClick={() => setMobileMenuOpen(false)}>
              <img src="/logo.svg" alt="The AI Fundi" className="h-8 w-auto brightness-0 invert" />
              <span className="font-bold text-white tracking-tighter text-base uppercase">The AI Fundi</span>
            </a>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Close navigation menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col justify-center px-8 gap-1">
            {[
              { href: '#lab', label: 'The Lab' },
              { href: '#host', label: 'The Fundi' },
              { href: '#services', label: 'Services' },
              { href: '#portfolio', label: 'Portfolio' },
              { href: '#how-it-works', label: 'How It Works' },
              { href: '#book-a-call', label: 'Book a Call' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="font-bold text-3xl text-white/80 hover:text-white transition-colors py-5 no-underline border-b border-white/5"
                style={{ minHeight: '56px', display: 'flex', alignItems: 'center' }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="px-8 pb-12">
            <a
              href="https://www.skool.com/aifundi"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#482d55] text-white font-bold text-lg py-5 rounded-full no-underline hover:bg-[#5a3a6b] transition-colors"
              style={{ minHeight: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Join The Lab →
            </a>
          </div>
        </div>
      )}

      {/* B. HERO SECTION (Fixed Overlap + Purple Brand Identity) */}
      <section className="relative min-h-[100dvh] w-full flex flex-col justify-center items-start pt-32 pb-16 px-8 md:px-16 overflow-hidden bg-[#1A101E]">

        {/* Deep Brand Purple Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#482d55] mix-blend-multiply opacity-90 z-10"></div>
          <img
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop"
            alt="Texture"
            className="w-full h-full object-cover grayscale opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A101E] via-transparent to-transparent z-20"></div>
        </div>

        {/* Content Container with Top Margin bumper */}
        <div className="relative z-10 w-full max-w-5xl mt-16 md:mt-24">
          <h1 className="flex flex-col gap-2">
            <span className="reveal-up hero-reveal block font-bold text-5xl md:text-7xl text-[#FFFFFF]/90 tracking-tighter uppercase" style={{ transitionDelay: '0ms' }}>
              AI Skills Made
            </span>
            <span className="reveal-up hero-reveal block font-drama italic text-7xl md:text-[12rem] leading-none text-white -mt-4 md:-mt-12 tracking-tight" style={{ transitionDelay: '100ms' }}>
              Simple.
            </span>
          </h1>
          <p className="reveal-up hero-reveal font-mono text-[#FFFFFF]/80 mt-8 max-w-xl text-sm md:text-base leading-relaxed" style={{ transitionDelay: '200ms' }}>
            The AI Fundi Lab is where AI-curious professionals learn to use AI the practical way. Multiply output. Cut costs. Do more with less.
          </p>
          <div className="reveal-up hero-reveal mt-10" style={{ transitionDelay: '300ms' }}>
            <Button primary href="https://www.skool.com/aifundi">Join The Lab</Button>
          </div>
        </div>
      </section>

      {/* C. FEATURES (Artifacts) */}
      <section id="lab" className="py-32 px-8 md:px-16 max-w-7xl mx-auto">
        <h2 className="sr-only">The AI Fundi Lab Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Card 1: Diagnostic Shuffler */}
          <div className="reveal-up bg-[#F8F6FA] border border-[#1A101E]/5 p-8 rounded-[2rem] shadow-sm flex flex-col h-[400px]" style={{ transitionDelay: '0ms' }}>
            <div className="mb-auto">
              <Database className="text-[#482d55] mb-4" size={28} />
              <h3 className="font-bold text-2xl tracking-tight text-[#1A101E]">Step-by-Step Builds</h3>
              <p className="font-mono text-xs text-[#1A101E]/60 mt-3">Ready-to-use templates, walkthroughs, and real builds you can follow along with.</p>
            </div>
            <div className="relative h-32 mt-8 flex items-center justify-center">
              <div className="w-full bg-[#FFFFFF] border border-[#1A101E]/5 p-6 rounded-xl font-mono text-sm text-center shadow-md text-[#482d55] font-bold tracking-wide">
                Templates + Walkthroughs
              </div>
            </div>
          </div>

          {/* Card 2: Telemetry Typewriter */}
          <div className="reveal-up bg-[#F8F6FA] border border-[#1A101E]/5 p-8 rounded-[2rem] shadow-sm flex flex-col h-[400px]" style={{ transitionDelay: '150ms' }}>
            <div className="mb-auto">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="text-[#482d55]" size={28} />
                <div className="flex items-center gap-2 px-3 py-1 bg-[#1A101E]/5 rounded-full border border-[#1A101E]/10">
                  <span className="w-2 h-2 rounded-full bg-[#482d55] animate-pulse"></span>
                  <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#1A101E]">Live</span>
                </div>
              </div>
              <h3 className="font-bold text-2xl tracking-tight text-[#1A101E]">Direct Support</h3>
              <p className="font-mono text-xs text-[#1A101E]/60 mt-3">Weekly live sessions, Q&A, and community support.</p>
            </div>
            <div className="h-32 flex items-center justify-center">
              <div className="bg-[#FFFFFF] border border-[#482d55]/20 px-8 py-4 rounded-xl shadow-md flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#482d55] animate-pulse"></span>
                <span className="font-mono text-sm font-bold text-[#482d55] tracking-wide">Live Every Week</span>
              </div>
            </div>
          </div>

          {/* Card 3: Cursor Protocol Scheduler */}
          <div className="reveal-up bg-[#F8F6FA] border border-[#1A101E]/5 p-8 rounded-[2rem] shadow-sm flex flex-col h-[400px] overflow-hidden group" style={{ transitionDelay: '300ms' }}>
            <div className="mb-auto">
              <Cpu className="text-[#482d55] mb-4" size={28} />
              <h3 className="font-bold text-2xl tracking-tight text-[#1A101E]">Do More With Less</h3>
              <p className="font-mono text-xs text-[#1A101E]/60 mt-3">Enterprise-quality output on a small business budget. No coding required.</p>
            </div>
            {/* Minimal SVG Grid & Animated interaction */}
            <div className="relative h-32 mt-8 bg-[#FFFFFF] border border-[#1A101E]/5 rounded-xl p-4 shadow-inner">
              <div className="grid grid-cols-7 gap-1 h-full">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${i === 3 ? 'bg-[#482d55]/20 border border-[#482d55]/50 group-hover:bg-[#482d55] transition-colors duration-700 delay-300' : 'bg-[#1A101E]/5'} h-full`}></div>
                ))}
              </div>
              <svg className="absolute top-1/2 left-0 w-6 h-6 text-[#1A101E] group-hover:translate-x-32 group-hover:-translate-y-4 transition-transform duration-1000 cubic-bezier(0.25, 0.46, 0.45, 0.94)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>

        </div>
      </section>

      {/* NEW SECTION: MEET YOUR HOST / THE FUNDI */}
      <section id="host" className="py-24 px-8 md:px-16 bg-[#FFFFFF] relative z-10 border-t border-b border-[#1A101E]/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16 md:gap-24">

          {/* Host Image Block */}
          <div className="w-full md:w-5/12 relative reveal-up" style={{ transitionDelay: '0ms' }}>
            {/* Purple decorative offset block */}
            <div className="absolute inset-0 bg-[#482d55] translate-x-4 translate-y-4 rounded-[2rem] opacity-20"></div>

            <img
              src="/Hero_AI_Fundi.png"
              alt="Chris Conley - The AI Fundi"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop"; }}
              className="relative z-10 w-full rounded-[2rem] shadow-xl object-cover aspect-[4/5] bg-[#F8F6FA] border border-[#1A101E]/10"
            />
          </div>

          {/* Host Copy Block */}
          <div className="w-full md:w-7/12 reveal-up" style={{ transitionDelay: '150ms' }}>
            <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#482d55]"></span>
              Your Host
            </h4>
            <h2 className="font-bold text-5xl md:text-6xl tracking-tight mb-6 text-[#1A101E]">
              I'm Chris Conley. <br />
              <span className="font-drama italic text-[#482d55] font-normal">The AI Fundi.</span>
            </h2>
            <div className="space-y-6">
              <p className="font-mono text-[#1A101E]/80 text-base md:text-lg leading-relaxed">
                "Fundi" means <strong>master builder</strong> in Swahili.
              </p>
              <p className="font-mono text-[#1A101E]/70 text-sm md:text-base leading-relaxed">
                I bring 18+ years of global corporate business experience to small teams using AI. My goal is simple: Help you multiply output, cut costs, and do more with less. No hype, just real execution.
              </p>
            </div>
            <div className="mt-10">
              <Button href="https://www.skool.com/aifundi">Join The Lab</Button>
            </div>
          </div>

        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="py-24 md:py-32 px-8 md:px-16 bg-[#F8F6FA] border-t border-[#1A101E]/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal-up mb-16">
            <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#482d55]"></span>
              Services
            </h4>
            <h2 className="font-bold text-4xl md:text-6xl tracking-tight text-[#1A101E] mb-6">Let's Build It Together</h2>
            <p className="font-mono text-[#1A101E]/70 text-sm md:text-base leading-relaxed max-w-2xl">
              Don't have the time to figure it out yourself? I work directly with businesses to design, build, and launch AI-powered systems that actually work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[{
              step: "01", title: "Understand Your Business", desc: "Every engagement starts with listening. I learn how your team works, where time gets wasted, and what success looks like for you."
            }, {
              step: "02", title: "Build What Works", desc: "I create practical AI workflows tailored to your business — tested with your real data, explained in plain language, ready to use."
            }, {
              step: "03", title: "Hand Over the Keys", desc: "You get a working system your team can actually run. I stick around to make sure everything holds up and improve what needs improving."
            }].map((card, index) => (
              <div key={index} className="reveal-up bg-[#FFFFFF] border border-[#1A101E]/10 p-8 rounded-[2rem] shadow-sm flex flex-col" style={{ transitionDelay: `${index * 150}ms` }}>
                <span className="font-mono text-[#482d55] text-xl font-bold block mb-4">[{card.step}]</span>
                <h3 className="font-bold text-xl md:text-2xl tracking-tight text-[#1A101E] mb-4">{card.title}</h3>
                <p className="font-mono text-[#1A101E]/60 text-xs leading-relaxed mt-auto">{card.desc}</p>
              </div>
            ))}
          </div>

          <div className="reveal-up flex justify-start">
            <Button primary href="#book-a-call">Book a Free Call</Button>
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <PortfolioSection />

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-24 md:py-32 px-8 md:px-16 bg-[#F8F6FA] border-t border-[#1A101E]/5">
        <div className="max-w-6xl mx-auto">
          <div className="reveal-up mb-16">
            <h4 className="font-mono text-[#482d55] text-sm font-bold tracking-widest uppercase mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-[#482d55]"></span>
              Testimonials
            </h4>
            <h2 className="font-bold text-4xl md:text-6xl tracking-tight text-[#1A101E] mb-4">What People Are Saying</h2>
            <p className="font-mono text-[#1A101E]/60 text-sm md:text-base">Trusted by professionals who value results over hype.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[{
              quote: "I've run my daycare for years without a website. Chris created my first one and helped me present my concept, routines, and values so clearly that parents now come to me already understanding how I work—and that makes choosing us much easier for them.",
              name: "Business Owner",
              title: "Hakuna Matata Daycare"
            }, {
              quote: "As a new nursing recruitment agency, I needed a professional online presence to start building trust with hospitals and candidates. Chris guided me from a blank page to a clear, credible website that explains our services, highlights our values, and gives international nurses an easy way to get in touch.",
              name: "Co-Owner",
              title: "Delta Personal Services"
            }, {
              quote: "Chris explained every step so clearly that my fears about launching a site disappeared. I love how he translated my ideas into a beautiful, on-brand website I can easily update myself, and I'm excited to keep building on it with a newsletter and more.",
              name: "Owner",
              title: "Blooms & Botanicals LLC"
            }].map((item, index) => (
              <div key={index} className="reveal-up bg-[#FFFFFF] border border-[#1A101E]/10 p-8 rounded-[2rem] shadow-sm flex flex-col" style={{ transitionDelay: `${index * 150}ms` }}>
                <svg className="w-8 h-8 text-[#482d55] mb-6 shrink-0" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="font-mono text-[#1A101E]/70 text-sm leading-relaxed mb-8 flex-grow">{item.quote}</p>
                <hr className="border-[#1A101E]/10 mb-6" />
                <div>
                  <p className="font-bold text-[#1A101E] tracking-tight">{item.name}</p>
                  <p className="font-mono text-xs text-[#1A101E]/50 mt-1">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE GUIDE / EMAIL CAPTURE */}
      <EmailCaptureSection />

      {/* BOOK A CALL SECTION */}
      <CalBookingSection />

      {/* D. PHILOSOPHY */}
      <section className="relative w-full py-48 bg-[#1A101E] text-[#FFFFFF] overflow-hidden">
        <div className="absolute inset-0 opacity-10 mix-blend-luminosity">
          <img
            src="https://images.unsplash.com/photo-1518005020951-eccb494ad742?q=80&w=2000&auto=format&fit=crop"
            alt="Texture"
            className="w-full h-full object-cover grayscale"
          />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-8 md:px-16 text-center">
          <p className="reveal-up font-mono text-sm md:text-base text-[#FFFFFF]/60 uppercase tracking-widest mb-8">
            Most of the industry focuses on hype and theoretical AI.
          </p>
          <h2 className="reveal-up font-drama italic text-5xl md:text-8xl leading-tight" style={{ transitionDelay: '150ms' }}>
            We focus on <br />
            <span className="text-[#482d55] not-italic font-grotesk tracking-tighter uppercase font-bold text-6xl md:text-9xl block mt-4">Execution.</span>
          </h2>
        </div>
      </section>

      {/* E. PROTOCOL (CSS Sticky Stacking) */}
      <section id="how-it-works" className="relative bg-[#FFFFFF] pb-32 pt-24">
        <div className="max-w-4xl mx-auto px-8 md:px-16 mb-16 text-center reveal-up">
          <h2 className="font-bold text-4xl tracking-tight uppercase text-[#1A101E]">How It Works</h2>
        </div>

        {[{
          step: "01", title: "Find Your Opportunities", desc: "We identify where AI can immediately save you time, cut costs, and free up hours in your business."
        }, {
          step: "02", title: "Build It Step by Step", desc: "Follow clear, beginner-friendly blueprints to set up AI tools, prompts, and workflows \u2014 no coding needed."
        }, {
          step: "03", title: "Scale Your Output", desc: "Roll out what works across your team. Get enterprise-level results on a small business budget."
        }].map((card, index) => (
          <div key={index} className="sticky top-0 h-[100dvh] w-full flex items-center justify-center p-8 bg-[#FFFFFF]" style={{ zIndex: index }}>
            <div className="w-full max-w-4xl bg-[#F8F6FA] border border-[#1A101E]/10 p-12 md:p-20 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center gap-16 transition-all duration-500 hover:shadow-2xl">
              <div className="w-full md:w-1/2">
                <span className="font-mono text-[#482d55] text-xl font-bold block mb-4">[{card.step}]</span>
                <h3 className="font-bold text-4xl md:text-5xl mb-6 tracking-tight text-[#1A101E]">{card.title}</h3>
                <p className="font-mono text-[#1A101E]/70 leading-relaxed text-sm">{card.desc}</p>
              </div>
              <div className="w-full md:w-1/2 aspect-square bg-[#FFFFFF] rounded-[2rem] border border-[#1A101E]/10 flex items-center justify-center relative overflow-hidden shadow-sm">
                {/* Abstract geometric representations for each step */}
                {index === 0 && <div className="w-32 h-32 border border-[#1A101E]/20 rounded-full animate-[spin_10s_linear_infinite] flex items-center justify-center"><div className="w-16 h-16 border border-[#482d55] rounded-full"></div></div>}
                {index === 1 && <div className="w-full h-full relative"><div className="absolute top-0 left-0 w-full h-[1px] bg-[#482d55] shadow-[0_0_10px_#482d55] animate-[ping_3s_ease-in-out_infinite] translate-y-[150px]"></div></div>}
                {index === 2 && <div className="flex gap-2 items-end h-32"><div className="w-2 bg-[#1A101E]/10 h-full animate-pulse"></div><div className="w-2 bg-[#482d55] h-1/2 animate-pulse delay-75"></div><div className="w-2 bg-[#1A101E]/10 h-3/4 animate-pulse delay-150"></div></div>}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* F. MEMBERSHIP */}
      <section className="py-48 px-8 md:px-16 bg-[#F8F6FA] flex justify-center relative z-10 border-t border-[#1A101E]/5">
        <div className="reveal-up max-w-4xl w-full bg-[#1A101E] text-[#FFFFFF] rounded-[3rem] p-12 md:p-24 text-center border border-[#1A101E]/20 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#482d55]/40 blur-[100px] rounded-full pointer-events-none"></div>
          <Terminal className="mx-auto text-[#482d55] mb-8" size={48} />
          <h2 className="font-bold text-5xl md:text-7xl mb-6 tracking-tight text-white uppercase">Enter the Lab.</h2>
          <p className="font-mono text-[#FFFFFF]/70 mb-12 max-w-xl mx-auto text-sm">
            Not for hype. Not for developers. Built for professionals who need to do more with less right now.
          </p>
          <div className="flex justify-center">
            <Button primary href="https://www.skool.com/aifundi" className="text-lg px-12 py-6">Join The Lab</Button>
          </div>
        </div>
      </section>

      {/* NEW: FAQ SECTION */}
      <FAQSection />

      {/* H. COOKIE CONSENT */}
      <CookieConsent />

      {/* G. FOOTER */}
      <footer className="bg-[#1A101E] text-[#FFFFFF] pt-24 pb-12 px-8 md:px-16 rounded-t-[4rem] relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-[#FFFFFF]/10 pb-16">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-3xl mb-4 tracking-tighter text-white uppercase">The AI Fundi</h3>
            <p className="font-mono text-xs text-[#FFFFFF]/50 max-w-sm">
              Chris Conley. 18+ years global enterprise experience brought to small teams using AI. "Fundi" means master builder. Let's build.
            </p>
            <a href="mailto:hello@theaifundi.com" className="font-mono text-xs text-[#FFFFFF]/70 hover:text-white transition-colors mt-4 inline-block">hello@theaifundi.com</a>
          </div>
          <div>
            <h4 className="font-mono text-[#482d55] text-xs font-bold mb-6 tracking-widest uppercase">Navigation</h4>
            <ul className="space-y-4 text-sm text-[#FFFFFF]/70">
              <li><a href="#lab" className="hover:text-white transition-colors">The Lab</a></li>
              <li><a href="#host" className="hover:text-white transition-colors">The Fundi</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="#portfolio" className="hover:text-white transition-colors">Portfolio</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#free-audit" className="hover:text-white transition-colors">Free AI Audit</a></li>
              <li><a href="#book-a-call" className="hover:text-white transition-colors">Book a Call</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-[#482d55] text-xs font-bold mb-6 tracking-widest uppercase">Legal</h4>
            <ul className="space-y-4 text-sm text-[#FFFFFF]/70">
              <li><a href="/terms.html" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/privacy.html" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono text-[10px] text-[#FFFFFF]/40">© {new Date().getFullYear()} The AI Fundi Lab. All rights reserved.</p>
          <p className="font-mono text-[10px] text-[#FFFFFF]/40">Last updated: July 2026</p>
        </div>
      </footer>
    </div>
  );
}