
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, Question, GameStatus } from './types';
import { INITIAL_QUESTIONS, WINNING_SCORE as DEFAULT_WINNING_SCORE, PLAYER_COLORS } from './constants';
import { fetchAIQuestions } from './services/geminiService';
import { fetchSpreadsheetQuestions } from './services/spreadsheetService';
import { audioService } from './services/audioService';
import PlayerZone from './components/PlayerZone';
import CarSprite from './components/CarSprite';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [questions, setQuestions] = useState<Question[]>(INITIAL_QUESTIONS);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [movingPlayer, setMovingPlayer] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | string>(3);
  const [showSettings, setShowSettings] = useState(false);
  const [winningScore, setWinningScore] = useState(DEFAULT_WINNING_SCORE);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  
  const playerQuestions = useRef<Question[][]>([]);
  const creatorName = "Mokhamad Syukron Ni'am-SMPN 1 Wiradesa";

  useEffect(() => {
    const loadQuestions = async () => {
      let allQs = [...INITIAL_QUESTIONS];
      if (spreadsheetId) {
        const sheetQs = await fetchSpreadsheetQuestions(spreadsheetId);
        if (sheetQs.length > 0) allQs = sheetQs;
      } else {
        const aiQs = await fetchAIQuestions();
        if (aiQs.length > 0) allQs = [...allQs, ...aiQs];
      }
      setQuestions(allQs);
    };
    loadQuestions();
  }, [spreadsheetId]);

  // Handle racing sounds with dynamic pitch/volume
  useEffect(() => {
    if (status === GameStatus.PLAYING || status === GameStatus.COUNTDOWN) {
      audioService.startEngine();
      
      // Calculate max score to drive the "intensity" of the shared background engine sound
      const currentMaxScore = players.length > 0 
        ? Math.max(...players.map(p => p.score)) 
        : 0;
        
      audioService.updateEngine(currentMaxScore, winningScore);
    } else {
      audioService.stopEngine();
    }
  }, [status, players, winningScore]);

  const goToLobby = () => {
    const initialPlayers: PlayerState[] = [1, 2, 3, 4].map(id => ({
      id,
      name: `Player ${id}`,
      score: 0,
      currentQuestionIndex: 0,
      lastAnswerTime: 0
    }));
    setPlayers(initialPlayers);
    setStatus(GameStatus.LOBBY);
  };

  const handleNameChange = (id: number, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: name.substring(0, 15) } : p));
  };

  const startCountdown = () => {
    setStatus(GameStatus.COUNTDOWN);
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 3) return 2;
        if (prev === 2) return 1;
        if (prev === 1) return 'GO!';
        clearInterval(timer);
        return 0;
      });
    }, 1000);
  };

  useEffect(() => {
    if (status === GameStatus.COUNTDOWN && countdown === 0) startGame();
  }, [countdown, status]);

  const startGame = useCallback(() => {
    playerQuestions.current = players.map(() => [...questions].sort(() => Math.random() - 0.5));
    setPlayers(prev => prev.map(p => ({ ...p, score: 0, currentQuestionIndex: 0, lastAnswerTime: Date.now() })));
    setStatus(GameStatus.PLAYING);
    setMovingPlayer(null);
  }, [questions, players]);

  const handleAnswer = (playerId: number, isCorrect: boolean) => {
    const pIdx = playerId - 1;
    if (isCorrect) {
      audioService.playCorrect();
      audioService.playMove();
      setMovingPlayer(playerId);
      setPlayers(prev => {
        const newPlayers = prev.map(p => p.id === playerId ? { ...p } : p);
        const p = newPlayers[pIdx];
        p.score += 1;
        p.currentQuestionIndex = (p.currentQuestionIndex + 1) % playerQuestions.current[pIdx].length;
        if (p.score >= winningScore) setStatus(GameStatus.FINISHED);
        return newPlayers;
      });
      setTimeout(() => setMovingPlayer(null), 800);
    } else {
      audioService.playWrong();
      setPlayers(prev => {
        const newPlayers = prev.map(p => p.id === playerId ? { ...p } : p);
        newPlayers[pIdx].currentQuestionIndex = (newPlayers[pIdx].currentQuestionIndex + 1) % playerQuestions.current[pIdx].length;
        return newPlayers;
      });
    }
  };

  const DynamicBackground = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-slate-950" />
      <style>{`
        @keyframes road-markings {
          from { background-position: 80px 0; }
          to { background-position: 0 0; }
        }
        .road-lane-animated {
          background-image: linear-gradient(90deg, #475569 50%, transparent 50%);
          background-size: 40px 2px;
          animation: road-markings 0.4s linear infinite;
        }
      `}</style>
    </div>
  );

  if (status === GameStatus.START) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden">
        <DynamicBackground />
        <div className="relative z-10 text-center space-y-4 animate-in zoom-in duration-700 px-4">
          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-black font-orbitron italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 drop-shadow-lg leading-tight">
              DESCRIPTIVE TEXT
            </h1>
            <h2 className="text-xl md:text-2xl font-bold font-orbitron text-slate-300 tracking-widest uppercase">
              English Grand Prix
            </h2>
          </div>
          <div className="bg-slate-900/60 p-6 rounded-3xl border border-yellow-500/20 backdrop-blur-xl shadow-2xl max-w-lg mx-auto">
            <p className="text-sm text-slate-200 mb-6 leading-relaxed font-medium">
              Race your VW Beetle! Collect <span className="text-yellow-400 font-bold">{winningScore} points</span> to win.
            </p>
            <div className="flex flex-col gap-6">
              <button onClick={goToLobby} className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 text-white font-orbitron text-xl font-bold rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95">
                START ENGINE!
              </button>
              <button onClick={() => setShowSettings(true)} className="w-full py-3 bg-slate-800/40 hover:bg-slate-700/40 text-slate-300 font-orbitron text-[10px] font-bold rounded-xl border border-slate-700/50 uppercase tracking-widest">
                SETTINGS
              </button>
            </div>
            <div className="mt-8 text-[11px] text-orange-400 font-bold tracking-[0.2em] uppercase drop-shadow-sm">
              Creator: {creatorName}
            </div>
          </div>
        </div>
        {showSettings && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-orbitron font-bold text-white mb-6 text-center">GAME SETTINGS</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-2 uppercase tracking-widest text-center">Winning Score</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 15, 20].map(val => (
                      <button key={val} onClick={() => setWinningScore(val)} className={`py-2 rounded-lg border-2 font-bold text-xs font-orbitron ${winningScore === val ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>{val}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] font-bold block mb-2 uppercase tracking-widest text-center">Spreadsheet ID</label>
                  <input type="text" value={spreadsheetId} onChange={(e) => setSpreadsheetId(e.target.value)} placeholder="Spreadsheet ID..." className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs outline-none focus:border-yellow-500" />
                </div>
              </div>
              <button onClick={() => setShowSettings(false)} className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-orbitron rounded-xl text-sm">SAVE & CLOSE</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (status === GameStatus.LOBBY) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden p-6">
        <DynamicBackground />
        <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-md">
          <h2 className="text-2xl font-orbitron font-bold text-center mb-6 text-white uppercase tracking-widest">Driver Entry</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {players.map((p, i) => (
              <div key={p.id} className="space-y-1">
                <label className={`text-[10px] font-bold uppercase tracking-widest text-${PLAYER_COLORS[i]}-400`}>Driver {p.id}</label>
                <input type="text" value={p.name} onChange={(e) => handleNameChange(p.id, e.target.value)} className={`w-full bg-slate-800/80 border-2 border-${PLAYER_COLORS[i]}-500/30 rounded-xl p-2.5 text-white text-sm outline-none focus:border-${PLAYER_COLORS[i]}-500 transition-all font-semibold`} />
              </div>
            ))}
          </div>
          <button onClick={startCountdown} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron text-lg font-bold rounded-2xl shadow-lg transition-all">START RACE</button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.COUNTDOWN) {
    return (
      <div className="h-screen w-screen flex items-center justify-center relative overflow-hidden bg-slate-950">
        <DynamicBackground />
        <div className="relative z-10 text-center animate-bounce">
          <div className="text-[120px] md:text-[160px] font-black font-orbitron text-yellow-400 drop-shadow-2xl">{countdown}</div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.FINISHED) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const winner = sortedPlayers[0];
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-950 p-6">
        <DynamicBackground />
        <div className="relative z-10 text-center space-y-4 animate-in slide-in-from-bottom duration-500">
          <h1 className="text-3xl font-bold font-orbitron text-white uppercase tracking-widest">GOAL!</h1>
          <div className="text-5xl md:text-7xl font-black font-orbitron text-yellow-400 drop-shadow-2xl px-4">{winner.name} WINS!</div>
          <div className="pt-4 flex gap-3 justify-center">
            <button onClick={startCountdown} className="px-8 py-4 bg-white text-slate-950 font-bold font-orbitron rounded-xl text-sm">REMATCH</button>
            <button onClick={() => setStatus(GameStatus.START)} className="px-8 py-4 bg-slate-800 text-white font-bold font-orbitron rounded-xl border border-slate-700 text-sm">MAIN MENU</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden relative">
      <DynamicBackground />
      <div className="h-[42%] w-full flex flex-col relative bg-slate-900/40 p-1 border-b-2 border-slate-800 z-10">
        <div className="flex-1 relative flex flex-col justify-between py-1">
          {/* Unified Start Area Width */}
          <div className="absolute left-6 top-0 bottom-0 w-14 z-0 overflow-hidden flex bg-black/60 border-x border-slate-700/50">
             <div className="flex-1 flex flex-col">
                 {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className={`w-full h-4 ${ i % 2 === 0 ? 'bg-white/90' : 'bg-black/90'}`} />
                 ))}
             </div>
             <div className="flex-1 flex flex-col">
                 {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className={`w-full h-4 ${ i % 2 !== 0 ? 'bg-white/90' : 'bg-black/90'}`} />
                 ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="font-orbitron font-black text-xl text-slate-950 drop-shadow-[0_0_2px_white] -rotate-90 tracking-[0.2em] whitespace-nowrap">START</div>
             </div>
          </div>

          {players.map((p, i) => (
            <div key={p.id} className="relative h-[24%] w-full border-y border-slate-800/40 flex items-center">
              <div className="absolute inset-x-0 h-[2px] top-1/2 -translate-y-1/2 road-lane-animated opacity-20" />
              <CarSprite color={PLAYER_COLORS[i]} score={p.score} maxScore={winningScore} isMoving={movingPlayer === p.id} name={p.name} />
            </div>
          ))}

          {/* Unified Finish Area Width (Matches Start Area) */}
          <div className="absolute right-6 top-0 bottom-0 w-14 z-0 overflow-hidden flex bg-black border-x border-slate-700/50 shadow-[0_0_30px_rgba(251,191,36,0.2)]">
             <div className="flex-1 flex flex-col">
                 {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className={`w-full h-4 ${ i % 2 === 0 ? 'bg-yellow-400' : 'bg-black'}`} />
                 ))}
             </div>
             <div className="flex-1 flex flex-col">
                 {Array.from({length: 20}).map((_, i) => (
                  <div key={i} className={`w-full h-4 ${ i % 2 !== 0 ? 'bg-yellow-400' : 'bg-black'}`} />
                 ))}
             </div>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="font-orbitron font-black text-xl text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)] rotate-90 scale-y-125 tracking-[0.2em] whitespace-nowrap">FINISH</div>
             </div>
          </div>
        </div>
      </div>
      <div className="h-[58%] w-full grid grid-cols-2 grid-rows-2 p-1 gap-1 z-10">
        {players.map((p, i) => (
          <PlayerZone key={p.id} player={p} color={PLAYER_COLORS[i]} question={playerQuestions.current[i]?.[p.currentQuestionIndex]} onAnswer={(idx) => handleAnswer(p.id, idx === playerQuestions.current[i][p.currentQuestionIndex].correctAnswer)} />
        ))}
      </div>
    </div>
  );
};

export default App;
