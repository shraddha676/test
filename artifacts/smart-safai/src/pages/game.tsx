import { useState, useEffect } from "react";
import { Gamepad2, RefreshCcw, CheckCircle2, XCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WasteItem = {
  id: number;
  name: string;
  type: "wet" | "dry";
  icon: string;
};

const ITEMS: WasteItem[] = [
  { id: 1, name: "Apple Core", type: "wet", icon: "🍎" },
  { id: 2, name: "Plastic Bottle", type: "dry", icon: "🥤" },
  { id: 3, name: "Newspaper", type: "dry", icon: "📰" },
  { id: 4, name: "Glass Bottle", type: "dry", icon: "🍾" },
  { id: 5, name: "Banana Peel", type: "wet", icon: "🍌" },
  { id: 6, name: "Cardboard Box", type: "dry", icon: "📦" },
  { id: 7, name: "Tea Bags", type: "wet", icon: "🍵" },
  { id: 8, name: "Tin Can", type: "dry", icon: "🥫" },
];

export default function Game() {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{message: string, isCorrect: boolean} | null>(null);
  const [gameOver, setGameOver] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    // Shuffle items
    const shuffled = [...ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setScore(0);
    setFeedback(null);
    setGameOver(false);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: WasteItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    // A bit of styling for the dragged element
    setTimeout(() => {
      if (e.target instanceof HTMLElement) {
        e.target.style.opacity = "0.5";
      }
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.target instanceof HTMLElement) {
      e.target.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, binType: "wet" | "dry") => {
    e.preventDefault();
    const data = e.dataTransfer.getData("application/json");
    if (!data) return;
    
    try {
      const item: WasteItem = JSON.parse(data);
      
      if (item.type === binType) {
        // Correct
        setScore(prev => prev + 10);
        setFeedback({ message: `Correct! ${item.name} is ${binType} waste.`, isCorrect: true });
      } else {
        // Incorrect
        setFeedback({ message: `Oops! ${item.name} is ${item.type} waste, not ${binType}.`, isCorrect: false });
      }
      
      // Remove item from list
      const newItems = items.filter(i => i.id !== item.id);
      setItems(newItems);
      
      if (newItems.length === 0) {
        setGameOver(true);
      }
      
      // Clear feedback after 2 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 2000);
      
    } catch (err) {
      console.error("Failed to parse dropped item");
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
          <Gamepad2 className="w-10 h-10 text-primary" />
          Waste Sorting Master
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-lg">
          Drag and drop the waste items into the correct bins. Let's see how much you know about waste segregation!
        </p>
      </div>

      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <Award className="w-8 h-8 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Score</span>
            <span className="text-2xl font-black leading-none">{score}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {items.length} items left
          </Badge>
          <Button onClick={startNewGame} variant="ghost" size="icon" title="Restart Game">
            <RefreshCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        
        {/* Items to sort */}
        <div className="lg:col-span-2 bg-muted/30 p-6 rounded-3xl border border-border min-h-[400px] flex flex-col items-center">
          <h3 className="font-semibold text-lg mb-6 text-center w-full pb-4 border-b border-border/50">Items to Sort</h3>
          
          {gameOver ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
              <Award className="w-16 h-16 text-yellow-500 mb-2" />
              <h2 className="text-2xl font-bold">Game Over!</h2>
              <p className="text-muted-foreground">You scored {score} out of {ITEMS.length * 10}.</p>
              <Button onClick={startNewGame} className="mt-4 rounded-full px-8">
                Play Again
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {items.map(item => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className="bg-card border border-border shadow-sm rounded-xl p-4 cursor-grab active:cursor-grabbing hover:scale-105 hover:shadow-md transition-all flex flex-col items-center justify-center w-28 h-28 select-none"
                >
                  <span className="text-4xl mb-2 grayscale-[0.2]">{item.icon}</span>
                  <span className="text-xs font-medium text-center text-foreground leading-tight">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bins Area */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
          
          {/* Feedback Overlay */}
          {feedback && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full px-4 pointer-events-none">
              <div className={`p-4 rounded-2xl shadow-xl flex items-center justify-center gap-3 text-white font-bold text-lg max-w-sm mx-auto animate-in fade-in zoom-in duration-300 ${
                feedback.isCorrect ? "bg-green-500" : "bg-red-500"
              }`}>
                {feedback.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                {feedback.message}
              </div>
            </div>
          )}

          {/* Wet Bin */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "wet")}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-full aspect-square max-w-[280px] bg-green-100 dark:bg-green-900/30 rounded-b-3xl rounded-t-xl border-4 border-green-500 flex flex-col items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-8 bg-green-500 absolute top-0 left-0 rounded-t-sm" />
              <span className="text-6xl mb-4 drop-shadow-md">🍏</span>
              <h3 className="text-2xl font-black text-green-700 dark:text-green-400 tracking-tight">WET WASTE</h3>
              <p className="text-center text-sm font-medium text-green-600/80 mt-2">Compostable & Biodegradable</p>
            </div>
            <div className="bg-muted px-4 py-2 rounded-full text-sm font-medium text-muted-foreground border border-border">
              Drop items here
            </div>
          </div>

          {/* Dry Bin */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, "dry")}
            className="flex flex-col items-center gap-4 group"
          >
            <div className="w-full aspect-square max-w-[280px] bg-blue-100 dark:bg-blue-900/30 rounded-b-3xl rounded-t-xl border-4 border-blue-500 flex flex-col items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-8 bg-blue-500 absolute top-0 left-0 rounded-t-sm" />
              <span className="text-6xl mb-4 drop-shadow-md">📰</span>
              <h3 className="text-2xl font-black text-blue-700 dark:text-blue-400 tracking-tight">DRY WASTE</h3>
              <p className="text-center text-sm font-medium text-blue-600/80 mt-2">Recyclable Materials</p>
            </div>
            <div className="bg-muted px-4 py-2 rounded-full text-sm font-medium text-muted-foreground border border-border">
              Drop items here
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
