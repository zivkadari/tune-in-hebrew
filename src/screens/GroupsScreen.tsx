import React, { useState, useEffect } from 'react';
import { Home, Plus, Users, ArrowLeft, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getPlayerId, getOrCreatePlayerId } from '@/lib/playerStorage';
import { toast } from 'sonner';
import { useDeviceType } from '@/hooks/useDeviceType';
import type { Group } from '@/types/dailyTimeAttack';

interface GroupsScreenProps {
  onBack: () => void;
  onGroupClick: (groupId: string) => void;
}

export const GroupsScreen: React.FC<GroupsScreenProps> = ({ onBack, onGroupClick }) => {
  const { safeAreaTop } = useDeviceType();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    setIsLoading(true);
    
    try {
      // Ensure player exists (this also handles anonymous auth)
      await getOrCreatePlayerId();
      
      // Use secure edge function to fetch groups (uses JWT auth)
      const { data, error } = await supabase.functions.invoke('get-my-groups');
      
      if (error) {
        console.error('Error fetching groups:', error);
        toast.error('שגיאה בטעינת הקבוצות');
      } else if (data?.error) {
        console.error('Error fetching groups:', data.error);
        toast.error('שגיאה בטעינת הקבוצות');
      } else {
        setGroups(data?.groups || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('שגיאה בטעינת הקבוצות');
    }
    
    setIsLoading(false);
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error('יש להזין שם קבוצה');
      return;
    }
    
    try {
      // Use secure edge function to create group (uses JWT auth)
      const { data, error } = await supabase.functions.invoke('create-group', {
        body: { name: newGroupName.trim() },
      });
      
      if (error) {
        console.error('Error creating group:', error);
        toast.error('שגיאה ביצירת קבוצה');
        return;
      }
      
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      
      if (data?.warning) {
        toast.warning('הקבוצה נוצרה אך לא הצלחת להצטרף אוטומטית');
      } else {
        toast.success('הקבוצה נוצרה! 🎉');
      }
      
      setNewGroupName('');
      setShowCreateForm(false);
      fetchMyGroups();
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error('שגיאה ביצירת קבוצה');
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) {
      toast.error('יש להזין קוד קבוצה');
      return;
    }
    
    try {
      // Use edge function to join group (uses JWT auth)
      const { data, error } = await supabase.functions.invoke('join-group', {
        body: { join_code: joinCode.trim() },
      });
      
      if (error) {
        console.error('Error joining group:', error);
        toast.error('שגיאה בהצטרפות');
        return;
      }
      
      if (data?.error) {
        if (data.error.includes('Already a member')) {
          toast.error('כבר בקבוצה הזו');
        } else if (data.error.includes('not found')) {
          toast.error('קוד קבוצה לא נמצא');
        } else {
          toast.error(data.error);
        }
        return;
      }
      
      toast.success(`הצטרפת לקבוצה "${data.group?.name}"! 🎉`);
      setJoinCode('');
      setShowJoinForm(false);
      fetchMyGroups();
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error('שגיאה בהצטרפות');
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div 
      className="min-h-screen flex flex-col p-6 safe-area-bottom"
      style={{ paddingTop: `${Math.max(safeAreaTop + 16, 56)}px` }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          הקבוצות שלי
        </h1>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => { setShowCreateForm(true); setShowJoinForm(false); }}
          className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
        >
          <Plus className="w-5 h-5" />
          צור קבוצה
        </button>
        <button
          onClick={() => { setShowJoinForm(true); setShowCreateForm(false); }}
          className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
        >
          <Users className="w-5 h-5" />
          הצטרף
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="glass-card p-4 mb-4">
          <h3 className="font-bold mb-3">יצירת קבוצה חדשה</h3>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="שם הקבוצה..."
            className="w-full px-4 py-2 rounded-lg bg-background border border-border mb-3"
          />
          <div className="flex gap-2">
            <button onClick={createGroup} className="btn-primary flex-1 py-2">צור</button>
            <button onClick={() => setShowCreateForm(false)} className="btn-secondary flex-1 py-2">ביטול</button>
          </div>
        </div>
      )}

      {/* Join Form */}
      {showJoinForm && (
        <div className="glass-card p-4 mb-4">
          <h3 className="font-bold mb-3">הצטרפות לקבוצה</h3>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="קוד הקבוצה (6 תווים)..."
            maxLength={6}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border mb-3 font-mono text-center text-lg"
          />
          <div className="flex gap-2">
            <button onClick={joinGroup} className="btn-primary flex-1 py-2">הצטרף</button>
            <button onClick={() => setShowJoinForm(false)} className="btn-secondary flex-1 py-2">ביטול</button>
          </div>
        </div>
      )}

      {/* Groups List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>עוד אין לך קבוצות</p>
          <p className="text-sm">צור קבוצה או הצטרף לאחת קיימת</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <button 
              key={group.id} 
              onClick={() => onGroupClick(group.id)}
              className="glass-card p-4 flex justify-between items-center w-full text-right hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-bold">{group.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>קוד:</span>
                  <code className="font-mono bg-muted px-2 py-0.5 rounded">{group.join_code}</code>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyCode(group.join_code); }} 
                    className="p-1 hover:text-foreground"
                  >
                    {copiedCode === group.join_code ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
