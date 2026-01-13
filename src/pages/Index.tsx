import { useGameState } from "@/hooks/useGameState";
import { HomeScreen } from "@/screens/HomeScreen";
import { LevelScreen } from "@/screens/LevelScreen";
import { SuccessScreen } from "@/screens/SuccessScreen";
import { LevelsScreen } from "@/screens/LevelsScreen";
import { NewGameNoticeDialog } from "@/components/NewGameNoticeDialog";

const Index = () => {
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
        />
        <NewGameNoticeDialog
          open={showNewGameNotice}
          onClose={handleNewGameNoticeClose}
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
