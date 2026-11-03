import React, { useState, useEffect } from 'react';
import { Monitor, UserCheck, Server, ShieldCheck, Wifi } from 'lucide-react';
import { useERPStore } from '../../store/erpStore';

interface StatusBarProps {
  store: ReturnType<typeof useERPStore>;
}

export const StatusBar: React.FC<StatusBarProps> = ({ store }) => {
  const { state } = store;
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-7 bg-[#30AFFF] border-t border-[#209BEF] px-3 flex items-center justify-between text-[11px] text-white select-none font-mono z-20">
      {/* Left Info: User, Terminal */}
      <div className="flex items-center space-x-3 overflow-x-hidden">
        <div className="flex items-center space-x-1.5 text-white">
          <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-white/80">USER : </span>
          <span className="text-white font-bold">{state.storeInfo.currentUser.id}</span>
          <span className="text-white/95 font-medium">({state.storeInfo.currentUser.name} - {state.storeInfo.currentUser.role})</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-white/90 border-l border-white/20 pl-3">
          <Monitor className="w-3.5 h-3.5 text-sky-100" />
          <span>Computer Name : </span>
          <span className="text-white font-medium">{state.storeInfo.computerName}</span>
        </div>

        <div className="hidden lg:flex items-center space-x-1.5 text-white/90 border-l border-white/20 pl-3">
          <Server className="w-3.5 h-3.5 text-white" />
          <span>Facility / Node : </span>
          <span className="text-white font-medium">{state.storeInfo.outletName}</span>
        </div>
      </div>

      {/* Right Info: Live Engine status & clock */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1 text-emerald-300 font-medium">
          <Wifi className="w-3 h-3" />
          <span className="hidden sm:inline">Cloud Fabric Sync Active</span>
        </div>

        <div className="flex items-center space-x-1 text-white/80 border-l border-white/20 pl-3 hidden sm:flex">
          <ShieldCheck className="w-3 h-3 text-cyan-200" />
          <span>Powered by AuraTech Cloud Systems</span>
        </div>

        <div className="bg-[#1C88D4] px-2 py-0.5 rounded border border-white/30 text-white font-bold">
          {currentTime || '24/09/2026 12:15:00 PM'}
        </div>
      </div>
    </footer>
  );
};
