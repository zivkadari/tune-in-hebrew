import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, Check, Crown, Trash2, Users, RefreshCw, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDeviceType } from '@/hooks/useDeviceType';
import { leaveGroup } from '@/lib/playerStorage';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GroupMember {
  player_id: string;
  display_name: string;
  joined_at: string;
  is_creator: boolean;
}

interface GroupInfo {
  id: string;
  name: string;
  join_code: string;
  created_by: string | null;
}

interface GroupDetailScreenProps {
  groupId: string;
  onBack: () => void;
}

export const GroupDetailScreen: React.FC<GroupDetailScreenProps> = ({ groupId, onBack }) => {
  const { safeAreaTop } = useDeviceType();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<GroupMember | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    setIsLoading(true);
    
    try {
      const url = new URL('https://nltdspmkogjsnnywqzke.supabase.co/functions/v1/get-group-members');
      url.searchParams.set('group_id', groupId);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('יש להתחבר');
        onBack();
        return;
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok || data.error) {
        console.error('Error fetching group details:', data.error);
        toast.error(data.error || 'שגיאה בטעינת פרטי הקבוצה');
        onBack();
        return;
      }
      
      setGroup(data.group);
      setMembers(data.members);
      setIsCreator(data.is_creator);
      setCurrentPlayerId(data.current_player_id);
    } catch (err) {
      console.error('Error fetching group details:', err);
      toast.error('שגיאה בטעינת פרטי הקבוצה');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (member: GroupMember) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        toast.error('יש להתחבר');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('remove-group-member', {
        body: {
          group_id: groupId,
          player_id_to_remove: member.player_id
        }
      });
      
      if (error || data?.error) {
        console.error('Error removing member:', error || data?.error);
        toast.error(data?.error || 'שגיאה בהסרת החבר');
        return;
      }
      
      toast.success(`${member.display_name} הוסר מהקבוצה`);
      setMemberToRemove(null);
      fetchGroupDetails();
    } catch (err) {
      console.error('Error removing member:', err);
      toast.error('שגיאה בהסרת החבר');
    }
  };

  const copyCode = () => {
    if (group?.join_code) {
      navigator.clipboard.writeText(group.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLeaveGroup = async () => {
    if (!group) return;
    
    setIsLeaving(true);
    try {
      await leaveGroup(group.id);
      toast.success('עזבת את הקבוצה בהצלחה');
      setShowLeaveConfirm(false);
      onBack();
    } catch (err: any) {
      console.error('Error leaving group:', err);
      toast.error(err.message || 'שגיאה בעזיבת הקבוצה');
    } finally {
      setIsLeaving(false);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ paddingTop: `${Math.max(safeAreaTop + 16, 56)}px` }}
      >
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
        <p className="mt-4 text-muted-foreground">טוען פרטי קבוצה...</p>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold flex-1 truncate">{group?.name}</h1>
        <button
          onClick={fetchGroupDetails}
          disabled={isLoading}
          className="p-2 rounded-full glass-card hover:bg-muted/50 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Join Code */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">קוד הצטרפות:</span>
            <code className="font-mono text-lg bg-muted px-3 py-1 rounded-lg font-bold">
              {group?.join_code}
            </code>
          </div>
          <button 
            onClick={copyCode}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {copiedCode ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="glass-card p-4 flex-1">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          חברי הקבוצה ({members.length})
        </h3>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div 
              key={member.player_id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                member.player_id === currentPlayerId 
                  ? 'bg-primary/10 border border-primary/30' 
                  : 'bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {member.is_creator && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
                <span className={member.player_id === currentPlayerId ? 'font-bold' : ''}>
                  {member.display_name}
                  {member.player_id === currentPlayerId && ' (אתה)'}
                </span>
              </div>
              
              {/* Remove button - only visible to creator for non-creator members */}
              {isCreator && !member.is_creator && (
                <button
                  onClick={() => setMemberToRemove(member)}
                  className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leave Group Button - only for non-creators */}
      {!isCreator && (
        <button
          onClick={() => setShowLeaveConfirm(true)}
          className="w-full mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 hover:bg-orange-500/20 transition-colors flex items-center justify-center gap-3 text-orange-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">עזיבת הקבוצה</span>
        </button>
      )}

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>הסרת חבר מהקבוצה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך להסיר את {memberToRemove?.display_name} מהקבוצה?
              פעולה זו לא ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={() => memberToRemove && handleRemoveMember(memberToRemove)}
              className="bg-destructive hover:bg-destructive/90"
            >
              הסר
            </AlertDialogAction>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave Group Confirmation Dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>עזיבת הקבוצה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך לעזוב את הקבוצה "{group?.name}"?
              תוכל להצטרף מחדש בעזרת קוד ההצטרפות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2">
            <AlertDialogAction 
              onClick={handleLeaveGroup}
              disabled={isLeaving}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {isLeaving ? 'עוזב...' : 'עזוב'}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isLeaving}>ביטול</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
