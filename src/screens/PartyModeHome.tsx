import React from 'react';
import { ArrowRight, Users, Wifi, WifiOff, Smartphone, Lock } from 'lucide-react';
import { useButtonFeedback } from '@/hooks/useButtonFeedback';

interface PartyModeHomeProps {
  onOfflineParty: () => void;
  onOnlineParty: () => void;
  onBack: () => void;
}

export const PartyModeHome: React.FC<PartyModeHomeProps> = ({
  onOfflineParty,
  onOnlineParty,
  onBack,
}) => {
  const { withFeedback } = useButtonFeedback();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden safe-area-top safe-area-bottom">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-5 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-orange-500/8 rounded-full blur-2xl" />
      </div>

      {/* Back button */}
      <button
        onClick={withFeedback(onBack)}
        className="absolute top-6 right-6 safe-area-top p-3 rounded-full bg-muted/50 hover:bg-muted transition-colors"
      >
        <ArrowRight className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Main card */}
      <div className="glass-card-glow p-8 sm:p-12 flex flex-col items-center gap-8 max-w-md w-full relative">
        {/* Icon */}
        <div className="relative">
          <div 
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ 
              background: 'radial-gradient(circle, hsl(330 100% 60% / 0.5) 0%, transparent 70%)',
              transform: 'scale(1.5)'
            }}
          />
          <div 
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(145deg, hsl(330 100% 65%), hsl(280 100% 55%))',
              boxShadow: '0 8px 40px hsl(330 100% 60% / 0.5), inset 0 2px 0 hsl(330 100% 80% / 0.4)'
            }}
          >
            <Users className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-black mb-2 text-foreground">
            🎉 מצב מסיבה
          </h1>
          <p className="text-muted-foreground text-base">
            בחרו איך אתם רוצים לשחק
          </p>
        </div>

        {/* Mode selection buttons */}
        <div className="flex flex-col gap-4 w-full">
          {/* Offline Party */}
          <button
            onClick={withFeedback(onOfflineParty)}
            className="w-full p-5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white
                       hover:from-orange-400 hover:to-pink-400 hover:shadow-lg hover:shadow-orange-500/30
                       active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Smartphone className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <div className="font-bold text-lg flex items-center gap-2">
                  <WifiOff className="w-4 h-4" />
                  אופליין – מכשיר אחד
                </div>
                <div className="text-white/80 text-sm">
                  מנחה שולט בהשמעה ומחלק נקודות
                </div>
              </div>
            </div>
          </button>

          {/* Online Party (Coming Soon) */}
          <button
            disabled
            className="w-full p-5 rounded-xl bg-muted/50 text-muted-foreground
                       cursor-not-allowed opacity-60 border border-dashed border-muted-foreground/30"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <Wifi className="w-6 h-6" />
              </div>
              <div className="text-right flex-1">
                <div className="font-bold text-lg flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  אונליין – כל אחד בטלפון שלו
                </div>
                <div className="text-sm">
                  🔒 בקרוב...
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
