import { useEffect, useRef, useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Briefcase, ChevronDown, Wind } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DeployTag } from '@/components/DeployTag';
import nickAvatar from '@/assets/nick-avatar.jpg';
import logoFlightMode from '@/assets/logo-flight-mode.jpg';
import logoCasatiBrothers from '@/assets/logo-casati-brothers.svg';
import logoHarlem from '@/assets/logo-harlem.jpg';
import logoSnowit from '@/assets/logo-snowit.jpg';
import logoTribala from '@/assets/logo-tribala.jpg';
import logoFnm from '@/assets/logo-fnm.jpg';
import logoDgm from '@/assets/logo-dgm.jpg';
import logoBocconi from '@/assets/logo-bocconi.jpg';
import logoNtuTaiwan from '@/assets/logo-ntu-taiwan.jpg';

const STATS = [
  { value: '50+', label: 'Team scaled from 3, as founding COO' },
  { value: '2', label: "World Champion riders managed: Lorenzo & Leonardo Casati" },
  { value: '110/110', label: 'Bocconi MSc in Management' },
];

// Real numbers from Nicholas's own kitesurf sessions, same as published on his live about page.
const SESSION_LOG = {
  count: 377,
  maxDistance: '119m',
  maxSpeed: '79kmh',
  maxHeight: '18.6m',
  maxAirtime: '9.1s',
};

type TimelineItem = { title: string; org: string; city: string; orgUrl?: string; period: string; desc: string[]; logo?: string; logoScale?: number };

const EXPERIENCE: TimelineItem[] = [
  {
    title: 'Co-Founder & CEO', org: 'Flight Mode', city: 'Tarifa', period: 'Mar 2025 - Present · 1 yr 5 mos', logo: logoFlightMode,
    desc: [
      'Objective: innovate and revolutionise the kitesurf industry.',
      'Developing market growth initiatives for the global wind-powered sports ecosystem.',
    ],
  },
  {
    title: 'Manager', org: 'Casati Brothers', city: 'Tarifa', period: 'Mar 2025 - Present · 1 yr 5 mos', logo: logoCasatiBrothers, logoScale: 2.1,
    desc: [
      'Athlete representation, sponsorships, partnerships, and strategic growth.',
      'Currently managing two of the most talented riders in the world.',
    ],
  },
  {
    title: 'Italy and Spain Distributor', org: 'Harlem Kitesurfing', city: 'Tarifa', period: 'Mar 2025 - Present · 1 yr 5 mos', logo: logoHarlem,
    desc: [
      'Exclusive distribution partner for Harlem in Italy, Spain, and the Canary Islands.',
      'Retail and ambassador strategy, brand positioning.',
    ],
  },
  {
    title: 'Chief Operating Officer', org: 'Snowit (Founding Team)', city: 'Milan', orgUrl: 'https://snowit.ski/en', period: 'May 2019 - Feb 2025 · 5 yrs 10 mos', logo: logoSnowit,
    desc: [
      'Scaled Snowit to 400k+ users and the team from 3 to 50+ people.',
      'Led Product, Ops, and Customer Care teams.',
      'Managed P&L and implemented agile project management tools and routines.',
      'Led development of a GPS-based ski tracking app.',
    ],
  },
  {
    title: 'Co-Founder & Chief Operating Officer', org: 'Tribala', city: 'Milan', orgUrl: 'https://tribala.travel/en', period: 'May 2023 - Feb 2025 · 1 yr 10 mos', logo: logoTribala,
    desc: [
      'Co-founded Tribala, taking it from the initial idea to launch and market validation.',
      'Built the brand identity and product strategy for a sports group travel marketplace.',
      'Led operations, partnerships, and growth, creating group experiences across multiple sports and destinations.',
    ],
  },
  {
    title: 'Digital & Innovation Ambassador', org: 'FNM S.p.A.', city: 'Milan', orgUrl: 'https://www.fnmgroup.it/', period: 'Sep 2022 - Oct 2024 · 2 yrs 2 mos', logo: logoFnm,
    desc: ['Member of Digital & Innovation Ambassadors to promote innovation within the FNM group.'],
  },
  {
    title: 'Consultant', org: 'DGM Consulting Srl', city: 'Milan', orgUrl: 'https://dgmco.it/it/', period: 'Apr 2018 - Aug 2018 · 5 mos', logo: logoDgm,
    desc: ['Data analytics and strategic consulting in hospitality and industrial sectors.'],
  },
];

const EDUCATION: TimelineItem[] = [
  {
    title: 'MSc in Management', org: 'Bocconi University', city: 'Milan', period: 'Sep 2016 - Dec 2018', logo: logoBocconi,
    desc: [
      'Top grades (110/110).',
      'Final thesis on budgeting effectiveness and behavior.',
      'Bocconi is consistently ranked among the world\'s top business schools in Financial Times rankings.',
    ],
  },
  {
    title: 'Exchange Program', org: 'National Taiwan University of Taipei', city: 'Taiwan', period: 'Aug 2016 - Dec 2018', logo: logoNtuTaiwan,
    desc: ['Business & culture exchange.', 'GPA 4/4.'],
  },
  {
    title: 'BSc', org: 'Bocconi University', city: 'Milan', period: 'Sep 2013 - Jul 2016', logo: logoBocconi,
    desc: [],
  },
];

const LANGUAGES = [
  { flag: '🇮🇹', text: 'Italian: Native' },
  { flag: '🇬🇧', text: 'English: Professional working proficiency' },
  { flag: '🇪🇸', text: 'Spanish: Professional working proficiency' },
];

// Fires once when the wrapped element scrolls into view, so every
// section on this page animates in as you scroll to it, not just once
// on page load.
function useInViewOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setSeen(true); },
      { threshold: 0.15 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [seen]);
  return { ref, seen };
}

// Each entry: logo, title + city badge, org name, period, chevron. Click
// a row to expand it and reveal the description bullets, collapsed by
// default so the list reads as a scannable résumé, not a wall of text.
function Timeline({ items }: { items: TimelineItem[] }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div ref={ref} className="divide-y divide-border border-t border-border">
      {items.map((item, i) => {
        const key = item.title + item.org;
        const isOpen = openKey === key;
        return (
          <div
            key={key}
            style={{
              opacity: seen ? 1 : 0,
              transform: seen ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.5s ease ${i * 90}ms, transform 0.5s ease ${i * 90}ms`,
            }}
          >
            <button
              type="button"
              onClick={() => setOpenKey(isOpen ? null : key)}
              disabled={item.desc.length === 0}
              className="w-full flex items-center gap-4 py-5 text-left disabled:cursor-default"
            >
              {item.logo && (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-card">
                  <img
                    src={item.logo}
                    alt={`${item.org} logo`}
                    className="w-full h-full object-contain"
                    style={item.logoScale ? { transform: `scale(${item.logoScale})` } : undefined}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{item.title}</span>
                  <Badge variant="outline" className="border-primary/40 text-primary text-[9px] uppercase tracking-wide px-1.5 py-0">
                    {item.city}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.orgUrl ? (
                    <a
                      href={item.orgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-foreground underline decoration-dotted underline-offset-2 transition-colors"
                    >
                      {item.org}
                    </a>
                  ) : (
                    item.org
                  )}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">{item.period}</span>
                {item.desc.length > 0 && (
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
              </div>
            </button>
            <div className="text-xs text-muted-foreground -mt-3 mb-3 sm:hidden">{item.period}</div>
            {item.desc.length > 0 && (
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? 200 : 0, opacity: isOpen ? 1 : 0 }}
              >
                <ul className="text-sm text-muted-foreground pb-5 space-y-1 list-disc list-inside">
                  {item.desc.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Fade + slide reveal for a whole block (heading + content), used for
// the sections that aren't a Timeline (Languages, Contact).
function Reveal({ children }: { children: ReactNode }) {
  const { ref, seen } = useInViewOnce<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={{
        opacity: seen ? 1 : 0,
        transform: seen ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {children}
    </div>
  );
}

export default function AboutNick() {
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => setHeroIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 py-16 max-w-2xl relative">
        <Link
          to="/change-the-tide"
          aria-label="Back to the pitch"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div
          style={{
            opacity: heroIn ? 1 : 0,
            transform: heroIn ? 'translateY(0)' : 'translateY(14px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <div className="flex items-center gap-5 mb-6">
            <img
              src={nickAvatar}
              alt="Nicholas Baruffaldi"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/40 shadow-[0_0_36px_-6px_hsl(var(--primary)/0.6)]"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Nicholas Baruffaldi</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-primary/40 text-primary text-[11px]">Forbes Under 30</Badge>
                <Badge variant="outline" className="text-[11px] gap-1">
                  <MapPin className="w-3 h-3" /> Based in Tarifa
                </Badge>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            I'm a digital enthusiast and sport lover born and raised in the Italian Alps, with the dream of
            transforming the competitive sport arena into something bigger than performance. Today I'm CEO
            &amp; Co-founder of Flight Mode, official Harlem Kitesurfing distributor for Italy and Spain,
            and manager of pro athletes Lorenzo and Leonardo Casati, two of the most iconic talents in
            international kitesurfing. Previously C-level
            executive in scale-ups, I bring a hybrid mindset blending business, brand building and athlete
            development. Selected in Forbes Under 30, I believe in clarity, bold execution and authentic
            stories. As an avid believer in optimisation, I follow the motto: "done is better than perfect."
          </p>

          <div className="rounded-lg border border-border bg-card p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                <Wind className="w-3.5 h-3.5" /> Session Log
              </div>
              <span className="text-xs text-muted-foreground">{SESSION_LOG.count} logged</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">{SESSION_LOG.maxDistance}</div>
                <div className="text-[11px] text-muted-foreground">Max distance</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">{SESSION_LOG.maxSpeed}</div>
                <div className="text-[11px] text-muted-foreground">Max speed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">{SESSION_LOG.maxHeight}</div>
                <div className="text-[11px] text-muted-foreground">Max height</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary tabular-nums">{SESSION_LOG.maxAirtime}</div>
                <div className="text-[11px] text-muted-foreground">Max airtime</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-14">
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-lg border border-border bg-card p-4 text-center">
                <div className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{stat.value}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-tight">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-14">
          <div>
            <h2 className="font-bold mb-6 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" /> Experience
            </h2>
            <Timeline items={EXPERIENCE} />
          </div>

          <div>
            <h2 className="font-bold mb-6">Education</h2>
            <Timeline items={EDUCATION} />
          </div>

          <Reveal>
            <h2 className="font-bold mb-3">Languages</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {LANGUAGES.map((l) => <li key={l.text}>{l.flag} {l.text}</li>)}
            </ul>
          </Reveal>

          <Reveal>
            <h2 className="font-bold mb-3">Contact</h2>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:nicholas.baruffaldi@gmail.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" /> nicholas.baruffaldi@gmail.com
              </a>
              <a href="tel:+393483409712" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" /> +39 348 3409712
              </a>
            </div>
          </Reveal>
        </div>
      </div>
      <DeployTag />
    </div>
  );
}
