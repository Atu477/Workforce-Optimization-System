import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'cyan', subtext }) => {
  const colorMap = {
    cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    emerald: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
    rose: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
    amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
    purple: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`bg-slate-800/80 border rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur bg-gradient-to-br ${colorMap[color] || colorMap.cyan}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-extrabold text-white mt-1">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-slate-900/50 flex items-center justify-center border border-slate-700/50 shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
