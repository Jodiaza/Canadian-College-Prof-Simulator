import { useState, useEffect } from 'react';
import { ArcadeCabinet } from './components/ArcadeCabinet';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { GameOverScreen } from './components/GameOverScreen';

export type Language = 'fr' | 'en';

type ScreenState = 'start' | 'play' | 'gameover';

function App() {
  const [screen, setScreen] = useState<ScreenState>('start');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [language, setLanguage] = useState<Language>('fr');

  // Load High Score from localStorage on mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('professor_tapper_high_score');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    const savedLanguage = localStorage.getItem('professor_tapper_language') as Language;
    if (savedLanguage === 'fr' || savedLanguage === 'en') {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('professor_tapper_language', lang);
  };

  const handleStartGame = () => {
    setScore(0);
    setLevel(1);
    setScreen('play');
  };

  const handleGameOver = (finalScore: number, finalLevel: number) => {
    setScore(finalScore);
    setLevel(finalLevel);
    
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('professor_tapper_high_score', String(finalScore));
    }
    
    setScreen('gameover');
  };

  const handleRestart = () => {
    handleStartGame();
  };

  return (
    <ArcadeCabinet>
      {screen === 'start' && (
        <StartScreen onStartGame={handleStartGame} highScore={highScore} language={language} onLanguageChange={handleLanguageChange} />
      )}
      {screen === 'play' && (
        <GameScreen onGameOver={handleGameOver} highScore={highScore} onExit={() => setScreen('start')} language={language} />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          score={score}
          level={level}
          highScore={highScore}
          onRestart={handleRestart}
          language={language}
        />
      )}
    </ArcadeCabinet>
  );
}

export default App;
