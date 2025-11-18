import { Coins, Sparkles } from "lucide-react";

interface CoinButtonProps {
  coins: number;
  onClick: () => void;
  pulse?: boolean;
}

export default function CoinButton({ coins, onClick, pulse = false }: CoinButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`fixed top-20 right-4 z-50 group ${pulse ? 'animate-pulse' : ''}`}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      {/* Button */}
      <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3 rounded-2xl shadow-lg transform transition-all duration-300 group-hover:scale-105 group-active:scale-95">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-white animate-bounce" />
          <span className="font-bold text-white text-sm">{coins}</span>
          <Sparkles className="w-4 h-4 text-white opacity-80" />
        </div>
      </div>
      
      {/* Floating text */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
          Заработать скидку!
        </div>
      </div>
    </button>
  );
}