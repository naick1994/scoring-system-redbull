import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import nickAvatar from '@/assets/nick-avatar.jpg';

const CURRENT_ROLES = [
  {
    role: 'Co-Founder & CEO', org: 'Flight Mode', period: 'Feb 2025 - Present',
    desc: 'Building the tools to innovate and revolutionise the kitesurf industry.',
  },
  {
    role: 'Athlete Manager', org: 'Lorenzo & Leonardo Casati', period: 'Feb 2025 - Present',
    desc: "Representation, sponsorships, and strategic growth for two of the world's most talented riders. Leonardo's real jump data is what powers this pitch's live demo.",
  },
  {
    role: 'Founder & CEO', org: 'Ridesk.app', period: 'Sep 2025 - Present',
    desc: 'A SaaS platform simplifying the watersport school industry: bookings, instructors, payments, and daily operations in one system.',
  },
  {
    role: 'Italy & Spain Distributor', org: 'Harlem Kitesurfing', period: 'Feb 2025 - Present',
    desc: 'Exclusive distribution partner for Harlem across Italy, Spain, and the Canary Islands.',
  },
];

const TRACK_RECORD = [
  {
    title: 'Chief Operating Officer, Founding Team', org: 'Sportit S.r.l. (Snowit, Tribala, Discovera)', period: 'Mar 2018 - Feb 2025',
    desc: 'Scaled the team from 3 to 50+ people. Led Product, Ops, and Customer Care; managed P&L and introduced agile project management.',
  },
  {
    title: 'MSc in Management', org: 'Bocconi University', period: 'Sep 2016 - Dec 2018',
    desc: 'Graduated 110/110. Final thesis on budgeting effectiveness and behavior.',
  },
  {
    title: 'Digital & Innovation Ambassador', org: 'FNM S.p.A.', period: 'Sep 2022 - Feb 2025',
    desc: 'Selected to promote innovation across the FNM group.',
  },
];

export default function AboutNick() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Link
          to="/change-the-tide"
          aria-label="Back to the pitch"
          className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-4">Who built this</div>
        <div className="flex items-center gap-5 mb-6">
          <img
            src={nickAvatar}
            alt="Nicholas Baruffaldi"
            className="w-20 h-20 rounded-full object-cover border border-border"
          />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Nicholas Baruffaldi</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="border-primary/40 text-primary text-[11px]">Forbes Under 30</Badge>
              <Badge variant="outline" className="text-[11px]">Bocconi MSc, 110/110</Badge>
            </div>
          </div>
        </div>
        <p className="text-lg text-muted-foreground mb-12">
          Born and raised in the Italian Alps, with the dream of transforming the competitive sport arena
          into something bigger than performance. A hybrid mindset blending business, brand building, and
          athlete development, with the motto: "done is better than perfect."
        </p>

        <div className="space-y-12">
          <div>
            <h2 className="font-bold mb-2">What I did here</h2>
            <p className="text-sm text-muted-foreground">
              Took Renato Casati's original four-area reductionist scoring concept and turned it into a
              working judging tool: the scoring engine, the parameter guide, the live demo, and the case
              for why Big Air should make this change.
            </p>
          </div>

          <div>
            <h2 className="font-bold mb-4">Right now</h2>
            <div className="space-y-3">
              {CURRENT_ROLES.map((item) => (
                <Card key={item.role} className="p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-1">
                    <span className="font-bold text-sm">{item.role} · {item.org}</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{item.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-4">Track record</h2>
            <div className="space-y-3">
              {TRACK_RECORD.map((item) => (
                <Card key={item.title} className="p-5 shadow-[var(--shadow-card)]">
                  <div className="flex items-baseline justify-between flex-wrap gap-x-3 gap-y-1 mb-1">
                    <span className="font-bold text-sm">{item.title}</span>
                    <span className="text-xs font-mono text-muted-foreground shrink-0">{item.period}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">{item.org}</div>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
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
