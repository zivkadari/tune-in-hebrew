import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useGameState } from "@/hooks/useGameState";
import { useDailyTimeAttack } from "@/hooks/useDailyTimeAttack";
import { HomeScreen } from "@/screens/HomeScreen";
import { LevelScreen } from "@/screens/LevelScreen";
import { SuccessScreen } from "@/screens/SuccessScreen";
import { LevelsScreen } from "@/screens/LevelsScreen";
import { NewGameNoticeDialog } from "@/components/NewGameNoticeDialog";
import { DailyTimeAttackHome } from "@/screens/DailyTimeAttackHome";
import { DailyTimeAttackRun } from "@/screens/DailyTimeAttackRun";
import { DailyTimeAttackResults } from "@/screens/DailyTimeAttackResults";
import { DailyLeaderboardScreen } from "@/screens/DailyLeaderboardScreen";
import { GroupsScreen } from "@/screens/GroupsScreen";
import { GroupDetailScreen } from "@/screens/GroupDetailScreen";
import { EnhancedLeaderboardScreen } from "@/screens/EnhancedLeaderboardScreen";
import { PracticeWarningDialog } from "@/components/PracticeWarningDialog";
import { WelcomeNameDialog } from "@/components/WelcomeNameDialog";
import type { DailyScreen } from "@/types/dailyTimeAttack";
import { 
  getPlayerId, 
  getOrCreatePlayerId, 
  getPlayerName, 
  updatePlayerName,
  isFirstTimePlayer,
  markPlayerAsReturning 
} from "@/lib/playerStorage";

const Index = () => {
  // Campaign mode state
  const {
    screen,
    gameState,
    currentLevel,
    slots,
    bubbles,
    message,
    messageType,
    isPlaying,
    activePianoKeys,
    audioProgress,
    totalLevels,
    isFirstTime,
    maxUnlockedLevel,
    levels,
    currentStageNumber,
    currentIsLastSongInStage,
    hintsUsedInLevel,
    showNewGameNotice,
    isFirstTimeCompletion,
    startGame,
    continueGame,
    restartGame,
    handleNewGameNoticeClose,
    onBubbleClick,
    onSlotClick,
    onClearAll,
    onHintRevealLetter,
    onHintRemoveFakes,
    onHintSolveAll,
    onPlay,
    nextLevel,
    previousLevel,
    openLevelsScreen,
    selectLevel,
    goHome,
    fullReset,
    hasFilledSlots,
    hasFakeBubbles,
  } = useGameState();

  // Daily Time Attack state
  const [dailyScreen, setDailyScreen] = useState<DailyScreen | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [showPracticeWarning, setShowPracticeWarning] = useState(false);
  
  const daily = useDailyTimeAttack();

  // Welcome dialog state for first-time players
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [welcomeName, setWelcomeName] = useState("");

  // Initialize anonymous auth and player on app mount - SEQUENTIAL to avoid race condition
  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // Step 1: Get or create auth session FIRST
        let { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No session found, creating anonymous session...');
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Error creating anonymous session:', error);
            return;
          }
          session = data.session;
          console.log('Created anonymous session:', session?.user?.id);
        } else {
          console.log('Existing session found:', session.user?.id);
        }
        
        // Step 2: Now that we have a stable session, handle player creation
        const existingPlayerId = getPlayerId();
        
        if (!existingPlayerId || isFirstTimePlayer()) {
          // Create player if needed (uses current session)
          await getOrCreatePlayerId();
          const name = await getPlayerName();
          setWelcomeName(name);
          setShowWelcomeDialog(true);
        }
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };
    
    initializePlayer();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Handle saving name from welcome dialog
  const handleWelcomeSaveName = useCallback(async (name: string) => {
    await updatePlayerName(name);
    markPlayerAsReturning();
    setShowWelcomeDialog(false);
  }, []);

  // Initialize daily mode when entering
  useEffect(() => {
    if (dailyScreen === 'daily-home' && !daily.dailySet) {
      daily.initialize();
    }
  }, [dailyScreen, daily.dailySet, daily.initialize]);

  // Handle entering Daily Time Attack mode
  const handleOpenTimeAttack = useCallback(() => {
    setDailyScreen('daily-home');
    daily.initialize();
  }, [daily]);

  // Handle starting a run
  const handleStartDailyRun = useCallback((type: 'official' | 'practice') => {
    daily.startRun(type);
    setDailyScreen('daily-run');
  }, [daily]);

  // Handle practice with warning
  const handleTryAgainPractice = useCallback(() => {
    setShowPracticeWarning(true);
  }, []);

  const handleConfirmPractice = useCallback(() => {
    setShowPracticeWarning(false);
    daily.resetForNewRun();
    handleStartDailyRun('practice');
  }, [daily, handleStartDailyRun]);

  // Handle quitting a run
  const handleQuitDailyRun = useCallback(() => {
    daily.endRun();
    setDailyScreen('daily-home');
  }, [daily]);

  // Handle going back to campaign home
  const handleBackFromDaily = useCallback(() => {
    setDailyScreen(null);
  }, []);

  // Effect to detect when run ends (isRunning becomes false while on run screen)
  useEffect(() => {
    if (dailyScreen === 'daily-run' && !daily.isRunning) {
      setDailyScreen('daily-run-ending');
    }
  }, [daily.isRunning, dailyScreen]);

  // Effect to show results when they're ready
  useEffect(() => {
    if (daily.runResult && dailyScreen === 'daily-run-ending') {
      setDailyScreen('daily-results');
    }
  }, [daily.runResult, dailyScreen]);

  // Daily Time Attack screens
  // Handle showing leaderboard
  const handleShowLeaderboard = useCallback(async () => {
    await daily.fetchLeaderboard();
    setDailyScreen('leaderboard');
  }, [daily]);

  if (dailyScreen === 'daily-home') {
    return (
      <DailyTimeAttackHome
        isLoading={daily.isLoading}
        hasPlayedOfficialToday={daily.hasPlayedOfficialToday}
        onStartRun={handleStartDailyRun}
        onLeaderboard={handleShowLeaderboard}
        onGroups={() => setDailyScreen('groups')}
        onBack={handleBackFromDaily}
      />
    );
  }

  if (dailyScreen === 'leaderboard' || dailyScreen === 'enhanced-leaderboard') {
    return (
      <EnhancedLeaderboardScreen
        dailyLeaderboard={daily.globalLeaderboard}
        onBack={() => setDailyScreen('daily-home')}
      />
    );
  }

  if (dailyScreen === 'daily-run') {
    return (
      <DailyTimeAttackRun
        runType={daily.runType!}
        totalSongs={12}
        timeLeftMs={daily.timeLeftMs}
        correctCount={daily.correctCount}
        skipUsed={daily.skipUsed}
        yearHintUsed={daily.yearHintUsed}
        currentSong={daily.currentSong}
        slots={daily.slots}
        bubbles={daily.bubbles}
        slotState={daily.slotState}
        isPlaying={daily.isPlaying}
        activePianoKeys={daily.activePianoKeys}
        message={daily.message}
        messageType={daily.messageType}
        onBubbleClick={daily.onBubbleClick}
        onSlotClick={daily.onSlotClick}
        onSkip={daily.useSkip}
        onYearHint={daily.useYearHint}
        onTogglePlay={daily.togglePlay}
        onQuit={handleQuitDailyRun}
      />
    );
  }

  if (dailyScreen === 'daily-run-ending') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-background/80">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-xl font-bold text-foreground">שומר תוצאות...</p>
        </div>
      </div>
    );
  }

  if (dailyScreen === 'daily-results' && daily.runResult) {
    return (
      <>
        <DailyTimeAttackResults
          runResult={daily.runResult}
          globalLeaderboard={daily.globalLeaderboard}
          onTryAgain={handleTryAgainPractice}
          onHome={() => setDailyScreen('daily-home')}
        />
        <PracticeWarningDialog
          open={showPracticeWarning}
          onOpenChange={setShowPracticeWarning}
          onConfirm={handleConfirmPractice}
        />
      </>
    );
  }

  if (dailyScreen === 'groups') {
    return (
      <GroupsScreen 
        onBack={() => setDailyScreen('daily-home')} 
        onGroupClick={(groupId) => {
          setSelectedGroupId(groupId);
          setDailyScreen('group-detail');
        }}
      />
    );
  }

  if (dailyScreen === 'group-detail' && selectedGroupId) {
    return (
      <GroupDetailScreen
        groupId={selectedGroupId}
        onBack={() => setDailyScreen('groups')}
      />
    );
  }

  // Campaign mode screens
  if (screen === "home") {
    return (
      <>
        <HomeScreen
          coins={gameState.coins}
          isFirstTime={isFirstTime}
          onStart={startGame}
          onContinue={continueGame}
          onRestart={restartGame}
          onLevels={openLevelsScreen}
          onFullReset={fullReset}
          onTimeAttack={handleOpenTimeAttack}
        />
        <NewGameNoticeDialog
          open={showNewGameNotice}
          onClose={handleNewGameNoticeClose}
        />
        <WelcomeNameDialog
          open={showWelcomeDialog}
          defaultName={welcomeName}
          onSave={handleWelcomeSaveName}
        />
      </>
    );
  }

  if (screen === "levels") {
    return (
      <LevelsScreen
        coins={gameState.coins}
        levels={levels}
        completedLevelIds={gameState.completedLevelIds}
        maxUnlockedLevel={maxUnlockedLevel}
        onSelectLevel={selectLevel}
        onHome={goHome}
      />
    );
  }

  if (screen === "success" && currentLevel) {
    return (
      <SuccessScreen
        songNumber={currentLevel.id}
        stageNumber={currentStageNumber}
        totalLevels={totalLevels}
        coins={gameState.coins}
        songTitle={currentLevel.title}
        onNextLevel={nextLevel}
        onHome={goHome}
        isLastLevel={currentLevel.id >= totalLevels}
        isLastSongInStage={currentIsLastSongInStage}
        usedHints={hintsUsedInLevel}
        isFirstTimeCompletion={isFirstTimeCompletion}
      />
    );
  }

  if (screen === "level" && currentLevel) {
    return (
      <LevelScreen
        songNumber={currentLevel.id}
        stageNumber={currentStageNumber}
        totalLevels={totalLevels}
        coins={gameState.coins}
        slots={slots}
        bubbles={bubbles}
        message={message}
        messageType={messageType}
        isPlaying={isPlaying}
        activePianoKeys={activePianoKeys}
        audioProgress={audioProgress}
        questionType={currentLevel.questionType}
        onPlay={onPlay}
        onBubbleClick={onBubbleClick}
        onSlotClick={onSlotClick}
        onClearAll={onClearAll}
        onHintRevealLetter={onHintRevealLetter}
        onHintRemoveFakes={onHintRemoveFakes}
        onHintSolveAll={onHintSolveAll}
        onHome={goHome}
        onPreviousLevel={previousLevel}
        canGoPrevious={currentLevel.id > 1}
        hasFilledSlots={hasFilledSlots}
        hasFakeBubbles={hasFakeBubbles}
      />
    );
  }

  return null;
};

export default Index;
