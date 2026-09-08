import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import nickAvatar from '@/assets/nick-avatar.jpg';

const BUILD_TIME = new Date(__BUILD_TIME__);
const BUILD_LABEL = `${BUILD_TIME.toLocaleDateString('it-IT')} ${BUILD_TIME.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;

// Small build-version footer note, only visible once you scroll to the
// bottom of a page, instead of a fixed badge floating over content.
export function DeployTag() {
  return (
    <div className="text-center select-none py-6">
      <Link
        to="/about-nick"
        className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <img src={nickAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
        Built and prototyped by Nicholas Baruffaldi
        <ArrowUpRight className="w-3.5 h-3.5" />
      </Link>
      <div className="text-[10px] text-muted-foreground/50 tabular-nums mt-2">deploy {BUILD_LABEL}</div>
    </div>
  );
}
