import { useGameState } from "@/hooks/useGameState";
import { HomeScreen } from "@/screens/HomeScreen";
import { LevelScreen } from "@/screens/LevelScreen";
import { SuccessScreen } from "@/screens/SuccessScreen";
import { LevelsScreen } from "@/screens/LevelsScreen";

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
    totalLevels,
    isFirstTime,
    maxUnlockedLevel,
    levels,
    startGame,
    continueGame,
    onBubbleClick,
    onUndo,
    onSubmit,
    onHint,
    onPlay,
    nextLevel,
    previousLevel,
    openLevelsScreen,
    selectLevel,
    goHome,
  } = useGameState();

  if (screen === "home") {
    return (
      <HomeScreen
        coins={gameState.coins}
        isFirstTime={isFirstTime}
        onStart={startGame}
        onContinue={continueGame}
        onLevels={openLevelsScreen}
      />
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
        levelNumber={currentLevel.id}
        totalLevels={totalLevels}
        coins={gameState.coins}
        songTitle={currentLevel.title}
        onNextLevel={nextLevel}
        onHome={goHome}
        isLastLevel={currentLevel.id >= totalLevels}
      />
    );
  }

  if (screen === "level" && currentLevel) {
    return (
      <LevelScreen
        levelNumber={currentLevel.id}
        totalLevels={totalLevels}
        coins={gameState.coins}
        slots={slots}
        bubbles={bubbles}
        message={message}
        messageType={messageType}
        isPlaying={isPlaying}
        activePianoKeys={activePianoKeys}
        onPlay={onPlay}
        onBubbleClick={onBubbleClick}
        onUndo={onUndo}
        onSubmit={onSubmit}
        onHint={onHint}
        onHome={goHome}
        onPreviousLevel={previousLevel}
        canGoPrevious={currentLevel.id > 1}
      />
    );
  }

  return null;
};

export default Index;
