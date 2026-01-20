import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw, Trophy, Globe, Users } from 'lucide-react';
import { DailyLeaderboard } from '@/components/DailyLeaderboard';
import { useDeviceType } from '@/hooks/useDeviceType';
import { supabase } from '@/integrations/supabase/client';
import { getOrCreatePlayerId } from '@/lib/playerStorage';
import { toast } from 'sonner';
import type { LeaderboardEntry, Group } from '@/types/dailyTimeAttack';

type LeaderboardTab = 'global' | 'groups';

interface EnhancedLeaderboardScreenProps {
  dailyLeaderboard: LeaderboardEntry[];
  onBack: () => void;
}

export const EnhancedLeaderboardScreen: React.FC<EnhancedLeaderboardScreenProps> = ({
  dailyLeaderboard,
  onBack
}) => {
  const { safeAreaTop } = useDeviceType();
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');
  const [isLoading, setIsLoading] = useState(false);
  
  // Global all-time state
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentPlayerAllTime, setCurrentPlayerAllTime] = useState<LeaderboardEntry | null>(null);
  
  // Groups state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [groupName, setGroupName] = useState<string>('');

  // Load all-time leaderboard on mount
  useEffect(() => {
    fetchAllTimeLeaderboard();
    fetchMyGroups();
  }, []);

  const fetchAllTimeLeaderboard = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const url = new URL('https://nltdspmkogjsnnywqzke.supabase.co/functions/v1/get-all-time-leaderboard');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Error fetching all-time leaderboard:', data.error);
        toast.error('שגיאה בטעינת הדירוג');
        return;
      }
      
      setAllTimeLeaderboard(data.leaderboard || []);
      setCurrentPlayerAllTime(data.current_player_entry || null);
    } catch (err) {
      console.error('Error fetching all-time leaderboard:', err);
      toast.error('שגיאה בטעינת הדירוג');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyGroups = async () => {
    try {
      await getOrCreatePlayerId();
      
      const { data, error } = await supabase.functions.invoke('get-my-groups');
      
      if (error || data?.error) {
        console.error('Error fetching groups:', error || data?.error);
        return;
      }
      
      setGroups(data?.groups || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
    }
  };

  const fetchGroupLeaderboard = async (groupId: string) => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('יש להתחבר');
        return;
      }
      
      const url = new URL('https://nltdspmkogjsnnywqzke.supabase.co/functions/v1/get-group-leaderboard');
      url.searchParams.set('group_id', groupId);
      // No date = all-time
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Error fetching group leaderboard:', data.error);
        toast.error(data.error || 'שגיאה בטעינת דירוג הקבוצה');
        return;
      }
      
      setGroupLeaderboard(data.leaderboard || []);
      setGroupName(data.group_name || 'קבוצה');
    } catch (err) {
      console.error('Error fetching group leaderboard:', err);
      toast.error('שגיאה בטעינת דירוג הקבוצה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupSelect = (groupId: string) => {
    setSelectedGroupId(groupId);
    fetchGroupLeaderboard(groupId);
  };

  const handleRefresh = () => {
    if (activeTab === 'global') {
      fetchAllTimeLeaderboard();
    } else if (selectedGroupId) {
      fetchGroupLeaderboard(selectedGroupId);
    }
  };

  // Build display leaderboard based on tab and selection
  const getDisplayLeaderboard = (): LeaderboardEntry[] => {
    if (activeTab === 'global') {
      // Include current player if not in top 50
      if (currentPlayerAllTime && !allTimeLeaderboard.find(e => e.is_current_player)) {
        return [...allTimeLeaderboard, currentPlayerAllTime];
      }
      return allTimeLeaderboard;
    }
    return groupLeaderboard;
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-6 safe-area-bottom"
      style={{ paddingTop: `${Math.max(safeAreaTop + 16, 56)}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">דירוג</h1>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'global'
              ? 'bg-primary text-primary-foreground'
              : 'glass-card hover:bg-muted/50'
          }`}
        >
          <Globe className="w-5 h-5" />
          גלובלי
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${
            activeTab === 'groups'
              ? 'bg-primary text-primary-foreground'
              : 'glass-card hover:bg-muted/50'
          }`}
        >
          <Users className="w-5 h-5" />
          קבוצות
        </button>
      </div>

      {/* Groups Tab - Group Selection */}
      {activeTab === 'groups' && !selectedGroupId && (
        <div className="flex-1">
          {groups.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>אין לך קבוצות</p>
              <p className="text-sm">צור או הצטרף לקבוצה כדי לראות דירוג</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-muted-foreground text-center mb-4">בחר קבוצה לצפייה בדירוג:</p>
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group.id)}
                  className="w-full glass-card p-4 text-right hover:bg-muted/50 transition-colors rounded-lg"
                >
                  <span className="font-bold">{group.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Groups Tab - Selected Group Leaderboard */}
      {activeTab === 'groups' && selectedGroupId && (
        <>
          <button
            onClick={() => setSelectedGroupId(null)}
            className="mb-4 text-primary hover:underline text-sm"
          >
            ← חזור לרשימת הקבוצות
          </button>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">טוען דירוג...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <DailyLeaderboard 
                entries={groupLeaderboard} 
                title={`דירוג ${groupName}`}
                className="bg-transparent"
              />
            </div>
          )}
        </>
      )}

      {/* Global Tab - All-Time Leaderboard */}
      {activeTab === 'global' && (
        <>
          {isLoading && allTimeLeaderboard.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">טוען דירוג...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <DailyLeaderboard 
                entries={getDisplayLeaderboard()} 
                title="דירוג All-Time"
                className="bg-transparent"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
