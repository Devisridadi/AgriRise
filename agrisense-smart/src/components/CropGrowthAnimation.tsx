import React from 'react';

const CropGrowthAnimation = () => {
  return (
    <div className="relative w-full h-[500px] bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-50 rounded-3xl border border-white/40 overflow-hidden shadow-2xl group transition-all duration-500 hover:shadow-emerald-900/20">

      {/* --- SCENIC BACKGROUND --- */}

      {/* Sun */}
      <div className="absolute top-12 right-12">
        <div className="w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-60 animate-pulse-slow"></div>
        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full shadow-[0_0_60px_rgba(253,224,71,0.8)] animate-[spin_60s_linear_infinite]"></div>
      </div>

      {/* Moving Clouds */}
      <div className="absolute top-24 -left-32 w-48 h-16 bg-white/40 rounded-full blur-xl animate-[floatCloud_35s_linear_infinite] opacity-70"></div>
      <div className="absolute top-10 left-1/3 w-32 h-12 bg-white/30 rounded-full blur-lg animate-[floatCloud_25s_linear_infinite_reverse] opacity-50"></div>
      <div className="absolute top-32 right-1/4 w-40 h-14 bg-white/50 rounded-full blur-lg animate-[floatCloud_40s_linear_infinite_0.5s] opacity-60"></div>

      {/* Birds (Simple V shapes) */}
      <div className="absolute top-20 left-1/4 opacity-40 animate-[floatParticle_20s_linear_infinite]">
        <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="currentColor" className="text-slate-700">
          <path d="M0 0 Q 5 10 10 5" />
          <path d="M10 5 Q 15 10 20 0" />
        </svg>
      </div>

      {/* --- MAIN ANIMATION --- */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 z-10">
        {/* Plant Container - Scaled Up significantly */}
        <div className="relative w-48 h-80 flex items-end justify-center perspective-1000">

          {/* Soil/Pot Shadow */}
          <div className="absolute bottom-0 w-40 h-8 bg-black/20 rounded-[100%] blur-sm scale-x-150"></div>

          {/* Stem */}
          <div className="absolute bottom-4 w-5 bg-gradient-to-t from-emerald-900 to-emerald-500 rounded-full origin-bottom animate-[growStemBig_4s_ease-in-out_infinite_alternate] shadow-lg"></div>

          {/* Leaves - Bigger and More Detailed */}
          <div className="absolute bottom-32 left-8 w-20 h-20 rounded-tr-[100%] rounded-bl-[20%] bg-emerald-600 origin-bottom-right animate-[recoverLeftLeafBig_4s_ease-in-out_infinite_alternate] shadow-sm z-10 border-b-4 border-emerald-800/10"></div>

          <div className="absolute bottom-40 right-6 w-24 h-24 rounded-tl-[100%] rounded-br-[20%] bg-emerald-500 origin-bottom-left animate-[recoverRightLeafBig_4s_ease-in-out_infinite_alternate] shadow-sm z-20 border-b-4 border-emerald-800/10"></div>

          <div className="absolute bottom-56 left-10 w-16 h-16 rounded-tr-[100%] rounded-bl-[20%] bg-emerald-400 origin-bottom-right animate-[recoverTopLeafBig_4s_ease-in-out_infinite_alternate] shadow-sm z-15"></div>

          {/* Flower/Head - Wheat/Crop head style */}
          <div className="absolute bottom-64 w-16 h-20 bg-gradient-to-t from-yellow-300 to-yellow-100 rounded-[100%] origin-bottom animate-[bloomFlowerBig_4s_ease-in-out_infinite_alternate] z-30 shadow-[0_0_30px_rgba(253,224,71,0.6)] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,#d97706_2px,#d97706_4px)]"></div>
          </div>

          {/* Pollen/Life Particles */}
          <div className="absolute bottom-72 w-full h-20 flex justify-center">
            <div className="w-1 h-1 bg-yellow-200 rounded-full animate-[floatParticle_2s_infinite] opacity-0 absolute -left-4"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-[floatParticle_3s_infinite_0.5s] opacity-0 absolute right-0"></div>
          </div>
        </div>

        <div className="mt-6 bg-white/30 backdrop-blur-xl px-8 py-3 rounded-2xl border border-white/60 text-emerald-950 font-bold tracking-widest shadow-xl flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          GROWING HEALTHY
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Transformation Labels */}
        <div className="absolute bottom-4 w-full flex justify-between px-10 text-xs text-emerald-900/60 font-mono font-bold uppercase tracking-wider">
          <span>Withered</span>
          <span>Thriving</span>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-2 w-64 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 animate-[fillProgress_4s_ease-in-out_infinite_alternate]"></div>
        </div>
      </div>

      {/* CSS Styles */}
      <style>{`
        @keyframes floatCloud {
          0% { transform: translateX(-50px) scale(0.9); }
          50% { transform: translateX(100px) scale(1.1); }
          100% { transform: translateX(300px) scale(1); }
        }
        @keyframes growStemBig {
          0% { height: 80px; width: 3px; background-color: #78350f; transform: rotate(-5deg); filter: grayscale(1) brightness(0.6); }
          100% { height: 280px; width: 6px; background-color: #10b981; transform: rotate(0deg); filter: grayscale(0) brightness(1.1); }
        }
        @keyframes recoverLeftLeafBig {
          0% { transform: scale(0.2) rotate(80deg); background-color: #78350f; opacity: 0; }
          40% { opacity: 1; }
          100% { transform: scale(1) rotate(-35deg); background-color: #059669; opacity: 1; }
        }
         @keyframes recoverRightLeafBig {
          0% { transform: scale(0.1) rotate(-80deg); background-color: #78350f; opacity: 0; bottom: 80px; }
          40% { opacity: 1; }
          100% { transform: scale(1) rotate(35deg); background-color: #10b981; opacity: 1; bottom: 140px; }
        }
        @keyframes recoverTopLeafBig {
          0% { transform: scale(0) rotate(0deg); opacity: 0; bottom: 100px; }
          60% { opacity: 1; }
          100% { transform: scale(1) rotate(-15deg); opacity: 1; bottom: 200px; }
        }
        @keyframes bloomFlowerBig {
           0% { transform: scale(0); opacity: 0; bottom: 120px; }
           70% { transform: scale(0.5); opacity: 0.8; bottom: 250px; background-color: #a3e635; }
           100% { transform: scale(1); opacity: 1; bottom: 260px; background-color: #facc15; }
        }
      `}</style>
    </div>
  );
};

export default CropGrowthAnimation;
