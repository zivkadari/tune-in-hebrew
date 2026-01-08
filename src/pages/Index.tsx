import { useGameState } from "@/hooks/useGameState";
import { HomeScreen } from "@/screens/HomeScreen";
import { LevelScreen } from "@/screens/LevelScreen";
import { SuccessScreen } from "@/screens/SuccessScreen";

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
    canContinue,
    startGame,
    continueGame,
    onBubbleClick,
    onUndo,
    onSubmit,
    onHint,
    onPlay,
    nextLevel,
    goHome,
  } = useGameState();

  if (screen === "home") {
    return (
      <HomeScreen
        coins={gameState.coins}
        canContinue={canContinue}
        onStart={startGame}
        onContinue={continueGame}
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
      />
    );
  }

  return null;
};

export default Index;
