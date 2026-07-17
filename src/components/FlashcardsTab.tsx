import React, { useEffect, useState } from 'react';
import { 
  ClipboardList, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle, 
  RotateCw, 
  Star, 
  Award 
} from 'lucide-react';
import { db } from '../storage/db';
import { Flashcard } from '../types';
import { LearningEngine } from '../learning-engine/engine';

export const FlashcardsTab: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [ratingCompleted, setRatingCompleted] = useState(false);
  const [lastRating, setLastRating] = useState<number | null>(null);
  
  // Leitner distribution stats
  const [boxCounts, setBoxCounts] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    async function loadCards() {
      const allC = await db.flashcards.toArray();
      setCards(allC);
      
      // Calculate Leitner stats distribution
      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      allC.forEach(c => {
        counts[c.box] = (counts[c.box] || 0) + 1;
      });
      setBoxCounts(counts);
    }
    loadCards();
  }, [ratingCompleted]);

  const handleScore = async (rating: 1 | 2 | 3 | 4 | 5) => {
    if (cards.length === 0) return;
    const activeCard = cards[currentIdx];
    
    setLastRating(rating);
    setRatingCompleted(true);

    // Call Engine spaced repetition scoring algorithm
    await LearningEngine.scoreFlashcard(activeCard.id, rating);
  };

  const handleNext = () => {
    setRevealed(false);
    setRatingCompleted(false);
    setLastRating(null);

    if (currentIdx + 1 < cards.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setCurrentIdx(0); // Loop back for rehearsal sandbox
    }
  };

  const activeCard = cards[currentIdx];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-fade-in">
      
      {/* Leitner rating recall flashcard workspace */}
      <div className="lg:col-span-2 space-y-6 flex flex-col">
        
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex-1 flex flex-col justify-between min-h-[400px]">
          
          {/* Card title breadcrumbs */}
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 shrink-0 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-indigo-400" />
              <span>SPACED REPETITION STUDY: {currentIdx + 1} OF {cards.length}</span>
            </div>
            {activeCard && (
              <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-bold text-indigo-400 uppercase">
                BOX {activeCard.box}
              </span>
            )}
          </div>

          {activeCard ? (
            <div className="flex-1 flex flex-col justify-between">
              
              {/* Question / Prompt side */}
              <div className="space-y-6">
                
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-950 px-2.5 py-0.5 font-mono text-[10px] uppercase text-slate-400 border border-slate-800">
                    {activeCard.type}
                  </span>
                  {activeCard.tags.map(t => (
                    <span key={t} className="text-[10px] font-mono text-slate-500">#{t}</span>
                  ))}
                </div>

                <div className="text-sm md:text-base font-bold text-slate-100 leading-relaxed bg-slate-950/20 rounded-xl p-5 border border-slate-900/40">
                  {activeCard.prompt}
                </div>

                {/* Answer side (Hidden till revealed) */}
                {revealed && (
                  <div className="space-y-4 animate-fade-in border-t border-slate-800/80 pt-4">
                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{activeCard.answer}</p>
                    
                    {activeCard.codeSnippet && (
                      <pre className="rounded-lg bg-slate-950 border border-slate-800 p-3 font-mono text-xs text-indigo-300 leading-relaxed overflow-x-auto no-scrollbar">
                        <code>{activeCard.codeSnippet}</code>
                      </pre>
                    )}
                  </div>
                )}

              </div>

              {/* Action buttons controls block */}
              <div className="pt-6 shrink-0 border-t border-slate-800/60 mt-6 flex justify-center">
                {!revealed ? (
                  <button
                    onClick={() => setRevealed(true)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 text-sm font-semibold transition-all shadow-md shadow-indigo-500/10"
                  >
                    <span>Reveal Answer Card</span>
                  </button>
                ) : !ratingCompleted ? (
                  
                  // SM-2 Scoring Quality selector buttons
                  <div className="space-y-4 w-full">
                    <div className="text-center font-mono text-[10px] text-slate-500 uppercase tracking-widest">Rate recall quality:</div>
                    <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
                      {[
                        { val: 1, label: 'Forgot', col: 'hover:bg-rose-500/15 hover:text-rose-400 hover:border-rose-500/35' },
                        { val: 2, label: 'Hard', col: 'hover:bg-amber-500/15 hover:text-amber-400 hover:border-amber-500/35' },
                        { val: 3, label: 'Medium', col: 'hover:bg-indigo-500/15 hover:text-indigo-400 hover:border-indigo-500/35' },
                        { val: 4, label: 'Easy', col: 'hover:bg-violet-500/15 hover:text-violet-400 hover:border-violet-500/35' },
                        { val: 5, label: 'Perfect', col: 'hover:bg-emerald-500/15 hover:text-emerald-400 hover:border-emerald-500/35' }
                      ].map(rating => (
                        <button
                          key={rating.val}
                          onClick={() => handleScore(rating.val as any)}
                          className={`flex flex-col items-center gap-1 border border-slate-800 rounded-lg p-2.5 bg-slate-950 font-bold transition-all text-slate-400 ${rating.col}`}
                        >
                          <Star className="h-4 w-4" />
                          <span>{rating.val}</span>
                          <span className="text-[8px] font-normal leading-none">{rating.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                ) : (
                  
                  // Score Saved, cycle forward
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full bg-slate-950/40 rounded-xl p-3 border border-slate-900">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>SM-2 score {lastRating} processed! Spacing interval updated.</span>
                    </div>

                    <button
                      onClick={handleNext}
                      className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow"
                    >
                      <span>Cycle Next Card</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                )}
              </div>

            </div>
          ) : (
            <div className="text-center py-20 text-slate-500">No active spaced cards loaded.</div>
          )}

        </div>

      </div>

      {/* Leitner Box Spacing stats panel */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-indigo-400" />
              <span>Leitner Distribution</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Passed cards scale up to higher boxes, requiring fewer review rounds. Incorrect answers automatically cycle back to Box 1 for daily rehearsals.
            </p>
          </div>

          {/* Graphical Leitner bar stacks */}
          <div className="space-y-3.5">
            {[1, 2, 3, 4, 5].map(boxNum => {
              const count = boxCounts[boxNum] || 0;
              const total = cards.length || 1;
              const percent = Math.round((count / total) * 100);

              return (
                <div key={boxNum} className="space-y-1.5">
                  <div className="flex justify-between items-baseline font-mono text-xs">
                    <span className="font-bold text-slate-300">Box {boxNum} (Delay: {boxNum * 3}d)</span>
                    <span className="text-slate-500">{count} cards ({percent}%)</span>
                  </div>
                  
                  <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        boxNum === 1 ? 'bg-rose-500' :
                        boxNum === 2 ? 'bg-amber-500' :
                        boxNum === 3 ? 'bg-indigo-500' :
                        boxNum === 4 ? 'bg-violet-500' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Tips block */}
        <div className="rounded-lg bg-indigo-500/5 p-4 border border-indigo-500/10 font-mono text-[10px] text-indigo-300 leading-normal">
          <strong>Tip:</strong> Rehearsing flashcards daily reduces the statistical probability of forgetting syntax by up to 80% based on Ebbinghaus memory decay curves.
        </div>

      </div>

    </div>
  );
};
