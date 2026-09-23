import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

const GamePlay = ({ vocabData, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [wrongWords, setWrongWords] = useState([]);
  const [timeLeft, setTimeLeft] = useState(100); // 100%에서 감소

  const currentWord = vocabData[currentIndex];

  // 음성 재생 함수 (TTS)
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  // 문제 생성: 정답 1개 + 오답 3개 셔플
  const generateOptions = useCallback(() => {
    if (!currentWord) return;
    const correct = currentWord.word;
    const others = vocabData
      .filter(v => v.word !== correct)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(v => v.word);
    
    setOptions([correct, ...others].sort(() => 0.5 - Math.random()));
  }, [currentWord, vocabData]);

  useEffect(() => {
    generateOptions();
    setShowHint(false);
    setTimeLeft(100);
  }, [currentIndex, generateOptions]);

  // 타이머 효과
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          handleAnswer(null); // 시간 초과 시 오답 처리
          return 100;
        }
        return prev - 1.5; // 속도 조절
      });
    }, 100);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleAnswer = (selected) => {
    if (selected === currentWord.word) {
      speak(currentWord.word);
      setScore(s => s + 10);
      nextStep();
    } else {
      setShowHint(true);
      if (!wrongWords.find(w => w.wordId === currentWord.wordId)) {
        setWrongWords([...wrongWords, currentWord]);
      }
      // 오답 시 약간의 딜레이 후 힌트 보여주고 기회 더 줌 (고교 기초 학습자 배려)
    }
  };

  const nextStep = () => {
    if (currentIndex < vocabData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onFinish({ score, wrongWords });
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto bg-slate-50 p-6">
      {/* 진행 바 */}
      <div className="w-full bg-gray-200 h-3 rounded-full mb-8">
        <div 
          className="bg-blue-500 h-3 rounded-full transition-all duration-100" 
          style={{ width: `${timeLeft}%` }}
        />
      </div>

      {/* 문제 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="text-sm text-blue-600 font-bold mb-2">무슨 뜻일까요?</span>
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 text-center">
          {currentWord?.meaning}
        </h1>
        
        {/* 예문 및 힌트 */}
        <div className="min-h-[80px] text-center">
          {showHint ? (
            <div className="bg-yellow-100 p-3 rounded-lg animate-bounce">
              <p className="text-yellow-700 font-mono text-xl">힌트: {currentWord?.initialSound}</p>
            </div>
          ) : (
            <p className="text-slate-500 italic">{currentWord?.easyExample}</p>
          )}
        </div>
      </div>

      {/* 선택지 영역 */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => handleAnswer(opt)}
            className="h-20 bg-white border-2 border-slate-200 rounded-2xl text-xl font-bold text-slate-700 active:scale-95 active:bg-blue-50 transition-all shadow-sm"
          >
            {opt}
          </button>
        ))}
      </div>

      {/* 하단 컨트롤 */}
      <button 
        onClick={() => speak(currentWord.word)}
        className="mt-6 mx-auto p-4 bg-slate-200 rounded-full"
      >
        <Volume2 size={24} className="text-slate-600" />
      </button>
    </div>
  );
};

export default GamePlay;
