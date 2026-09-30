import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'cyan', subtext }) => {
  const colorMap = {
    cyan: 'from-amber-50/80 to-orange-50/40 border-amber-200/80 text-amber-700',
    emerald: 'from-emerald-50/80 to-teal-50/40 border-emerald-200/80 text-emerald-700',
    rose: 'from-rose-50/80 to-red-50/40 border-rose-200/80 text-rose-700',
    amber: 'from-amber-50/80 to-yellow-50/40 border-amber-200/80 text-amber-700',
    purple: 'from-purple-50/80 to-indigo-50/40 border-purple-200/80 text-purple-700',
  };

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition relative overflow-hidden bg-gradient-to-br ${colorMap[color] || colorMap.cyan}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</p>
          <h3 className="text-2xl font-black text-stone-900 mt-1">{value}</h3>
          {subtext && <p className="text-xs text-stone-500 mt-1">{subtext}</p>}
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-xl bg-white/95 flex items-center justify-center border border-stone-200/90 shadow-xs shrink-0">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
