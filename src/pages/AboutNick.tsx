import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import nickAvatar from '@/assets/nick-avatar.jpg';

const STATS = [
  { value: '50+', label: 'Team scaled from 3, as founding COO' },
  { value: '2', label: "World-class riders managed: Lorenzo & Leonardo Casati" },
  { value: '110/110', label: 'Bocconi MSc in Management' },
];

const DOT_COLORS = ['bg-cyan-500', 'bg-pink-500', 'bg-amber-500', 'bg-lime-500'];

const CURRENT_ROLES = [
  {
    role: 'Co-Founder & CEO', org: 'Flight Mode', period: 'Mar 2025 - Present · 1 yr 5 mos',
    desc: 'Building the tools to innovate and revolutionise the kitesurf industry.',
  },
  {
    role: 'Manager', org: 'Lorenzo & Leonardo Casati', period: 'Mar 2025 - Present · 1 yr 5 mos',
    desc: "Representation, sponsorships, and strategic growth for two of the world's most talented riders. Leonardo's real jump data is what powers this pitch's live demo.",
  },
  {
    role: 'Co-Founder & CEO', org: 'Ridesk', period: 'Oct 2025 - Present · 10 mos',
    desc: 'A SaaS platform simplifying the watersport school industry: bookings, instructors, payments, and daily operations in one system.',
  },
  {
    role: 'Italy and Spain Distributor', org: 'Harlem Kitesurfing', period: 'Mar 2025 - Present · 1 yr 5 mos',
    desc: 'Exclusive distribution partner for Harlem across Italy, Spain, and the Canary Islands.',
  },
];

const TRACK_RECORD = [
  {
    title: 'Chief Operating Officer', org: 'Snowit', period: 'May 2019 - Feb 2025 · 5 yrs 10 mos',
    desc: 'Founding COO. Scaled the team from 3 to 50+ people; led Product, Ops, and Customer Care; managed P&L and introduced agile project management.',
  },
  {
    title: 'Chief Operating Officer', org: 'Tribala', period: 'May 2023 - Feb 2025 · 1 yr 10 mos',
    desc: 'Founding COO across the wider group of brands.',
  },
  {
    title: 'Digital & Innovation Ambassador', org: 'FNM S.p.A.', period: 'Sep 2022 - Oct 2024 · 2 yrs 2 mos',
    desc: 'Selected to promote innovation across the FNM group.',
  },
  {
    title: 'Consultant', org: 'DGM Consulting Srl', period: 'Apr 2018 - Aug 2018 · 5 mos',
    desc: 'Data analytics and strategic consulting in the hospitality and industrial sectors.',
  },
];

const EDUCATION = [
  {
    title: 'MSc in Management', org: 'Bocconi University', period: 'Sep 2016 - Dec 2018',
    desc: 'Graduated 110/110. Final thesis on budgeting effectiveness and behavior.',
  },
  {
    title: 'Exchange Program', org: 'National Taiwan University of Taipei', period: 'Aug 2016 - Dec 2018',
    desc: 'Business & culture exchange. GPA 4/4.',
  },
  {
    title: 'BSc', org: 'Bocconi University', period: 'Sep 2013 - Jul 2016',
    desc: 'Undergraduate studies at Bocconi University.',
  },
];

const LANGUAGES = [
  { flag: '🇮🇹', text: 'Italian: Native' },
  { flag: '🇬🇧', text: 'English: Professional working proficiency' },
  { flag: '🇪🇸', text: 'Spanish: Professional working proficiency' },
];

// A simple left-rail timeline: a vertical line with a colored dot per
// entry, entries fading/sliding in on mount instead of on scroll (this
// is a short standalone page, most of it is visible without scrolling).
function Timeline({ items }: { items: { title: string; org: string; period: string; desc: string }[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(id); }, []);

  return (
    <div className="relative pl-8">
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
      <div className="space-y-8">
        {items.map((item, i) => (
          <div
            key={item.title}
            className="relative"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateX(0)' : 'translateX(-12px)',
              transition: `opacity 0.5s ease ${i * 90}ms, transform 0.5s ease ${i * 90}ms`,
            }}
          >
            <div className={`absolute -left-8 top-1.5 w-2.5 h-2.5 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`} />
            <div className="flex items-baseline justify-between flex-wrap gap-x-3 mb-0.5">
              <span className="font-bold text-sm">{item.title}</span>
              <span className="text-xs font-mono text-muted-foreground shrink-0">{item.period}</span>
            </div>
            {item.org && <div className="text-xs text-muted-foreground mb-1.5">{item.org}</div>}
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AboutNick() {
  const [heroIn, setHeroIn] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setHeroIn(true)); return () => cancelAnimationFrame(id); }, []);

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
          <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Who built this</div>
          <div className="flex items-center gap-5 mb-6">
            <img
              src={nickAvatar}
              alt="Nicholas Baruffaldi"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.5)]"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Nicholas Baruffaldi</h1>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-primary/40 text-primary text-[11px]">Forbes Under 30</Badge>
              </div>
            </div>
          </div>
          <p className="text-lg text-muted-foreground mb-10">
            Born and raised in the Italian Alps, with the dream of transforming the competitive sport arena
            into something bigger than performance. A hybrid mindset blending business, brand building, and
            athlete development, with the motto: "done is better than perfect."
          </p>

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
            <h2 className="font-bold mb-6">Right now</h2>
            <Timeline items={CURRENT_ROLES.map(r => ({ title: `${r.role} · ${r.org}`, org: '', period: r.period, desc: r.desc }))} />
          </div>

          <div>
            <h2 className="font-bold mb-6">Track record</h2>
            <Timeline items={TRACK_RECORD} />
          </div>

          <div>
            <h2 className="font-bold mb-6">Education</h2>
            <Timeline items={EDUCATION} />
          </div>

          <div>
            <h2 className="font-bold mb-3">Languages</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {LANGUAGES.map((l) => <li key={l.text}>{l.flag} {l.text}</li>)}
            </ul>
          </div>

          <div>
            <h2 className="font-bold mb-3">Contact</h2>
            <div className="flex flex-col gap-2 text-sm">
              <a href="mailto:nicholas.baruffaldi@gmail.com" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" /> nicholas.baruffaldi@gmail.com
              </a>
              <a href="tel:+393483409712" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Phone className="w-4 h-4" /> +39 348 3409712
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
