import { Clock } from 'lucide-react';

const TimerBadge = ({ seconds }) => (
  <div className="absolute top-0 right-0 mt-[-18px] mr-[-10px]">
    <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-500/90 shadow-lg text-white text-sm font-semibold border-2 border-white/30 backdrop-blur-md">
      <Clock className="w-4 h-4 mr-1 opacity-80" />
      <span>{seconds}s</span>
    </div>
  </div>
);

export default TimerBadge;
