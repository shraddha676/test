import { useState } from "react";
import { useGetDailyTip } from "@workspace/api-client-react";
import {
  BookOpen,
  Droplets,
  Trash2,
  AlertCircle,
  PlayCircle,
  AlertTriangle,
  Package,
  ShoppingBag,
  UtensilsCrossed,
  Syringe,
  Flame,
  Images,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Biohazard,
  FlaskConical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const VIDEOS = [
  {
    id: "A8udcpxDLtc",
    title: "How to Segregate Waste at Home",
    description: "A practical guide to sorting wet, dry, and hazardous waste at the source.",
    channel: "EcoSense India",
  },
  {
    id: "_6xlNyWPpB8",
    title: "Journey of a Recycled Plastic Bottle",
    description: "Follow a plastic bottle from your bin all the way to being reborn as something new.",
    channel: "Plastic Collective",
  },
];

const GREEN_BIN_GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=400&fit=crop&q=80",
    label: "Fruit & vegetable peels",
  },
  {
    url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&q=80",
    label: "Food scraps & leftovers",
  },
  {
    url: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=400&fit=crop&q=80",
    label: "Garden leaves & clippings",
  },
];

const BLUE_BIN_GALLERY = [
  {
    url: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&h=400&fit=crop&q=80",
    label: "Plastic bottles & containers",
  },
  {
    url: "/gallery-cardboard.jpeg",
    label: "Paper, cardboard & cartons",
  },
  {
    url: "/gallery-glass-cans.jpeg",
    label: "Glass bottles & metal cans",
  },
];

const RED_BIN_GALLERY = [
  {
    url: "/gallery-hazardous-medicine.jpeg",
    label: "Expired medicines & syringes",
  },
  {
    url: "/gallery-hazardous-chemicals.jpeg",
    label: "Paints, oils & chemicals",
  },
  {
    url: "/gallery-ewaste.jpeg",
    label: "Electronics & E-Waste",
  },
];

const QUIZ_QUESTIONS = [
  {
    question: "Where should banana peels and vegetable scraps go?",
    options: ["Green Bin (Wet Waste)", "Blue Bin (Dry Waste)", "Red Bin (Hazardous)", "Normal Dustbin"],
    answer: 0,
    explanation: "Organic food waste like peels and scraps are biodegradable and go in the Green Bin for composting.",
  },
  {
    question: "A broken mobile phone is classified as which type of waste?",
    options: ["Dry Waste", "Wet Waste", "E-Waste / Hazardous", "Organic Waste"],
    answer: 2,
    explanation: "Electronics contain toxic metals like lead and mercury. They must be taken to an e-waste collection point.",
  },
  {
    question: "Which of these belongs in the BLUE Dry Waste bin?",
    options: ["Leftover curry", "Clean plastic bottle", "Dead batteries", "Used diapers"],
    answer: 1,
    explanation: "Clean, dry recyclables like plastic bottles go in the Blue Bin. Soiled, hazardous, or wet items do not.",
  },
  {
    question: "Approximately how long does a plastic bottle take to decompose in a landfill?",
    options: ["5 years", "50 years", "100 years", "450 years"],
    answer: 3,
    explanation: "Plastic bottles can take up to 450 years to break down, which is why recycling them is so critical.",
  },
  {
    question: "Which of these can safely be added to a home compost bin?",
    options: ["Plastic wrapper", "Tea bags & coffee grounds", "Glass pieces", "Old batteries"],
    answer: 1,
    explanation: "Tea bags and coffee grounds are fully compostable organic matter that enrich your compost pile.",
  },
];

export default function Education() {
  const { data: tip, isLoading: tipLoading } = useGetDailyTip();

  return (
    <div className="flex flex-col gap-10 pb-24 md:pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-primary" />
            Education Hub
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Learn how to properly identify and segregate different types of waste to minimise environmental impact.
          </p>
        </div>
      </div>

      {/* Daily Tip */}
      <Card className="bg-primary/5 border-primary/20 shadow-sm">
        <CardContent className="p-6 flex items-start gap-4">
          <div className="bg-primary/20 p-3 rounded-full shrink-0 mt-1">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2 text-foreground">Did You Know?</h3>
            {tipLoading ? (
              <div className="space-y-2 mt-2 w-full max-w-2xl">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : tip ? (
              <p className="text-muted-foreground leading-relaxed">{tip.tip}</p>
            ) : (
              <p className="text-muted-foreground leading-relaxed">
                Almost 60% of campus waste is compostable, yet it often ends up in landfills. Proper segregation is
                the first step to reducing our carbon footprint!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waste Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WasteCard
          title="Green Bin — Wet Waste"
          icon={<Droplets className="w-6 h-6 text-green-600" />}
          color="border-green-200 bg-green-50/30 dark:bg-green-950/20"
          headerColor="bg-green-100 dark:bg-green-900/40"
          items={["Food scraps & leftovers", "Fruit & vegetable peels", "Tea bags & coffee grounds", "Used paper napkins", "Garden waste (leaves, twigs)"]}
          donts={[
            { label: "Plastic wrappers", icon: <ShoppingBag className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Rubber bands", icon: <Package className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Glass pieces", icon: <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" /> },
          ]}
        />
        <WasteCard
          title="Blue Bin — Dry Waste"
          icon={<Trash2 className="w-6 h-6 text-blue-600" />}
          color="border-blue-200 bg-blue-50/30 dark:bg-blue-950/20"
          headerColor="bg-blue-100 dark:bg-blue-900/40"
          items={["Paper, cardboard & cartons", "Plastic bottles & containers", "Glass bottles & jars", "Metal cans & foil", "Clean pizza boxes"]}
          donts={[
            { label: "Soiled food containers", icon: <UtensilsCrossed className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Used tissues / diapers", icon: <Package className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Medical waste", icon: <Syringe className="w-3.5 h-3.5 text-destructive shrink-0" /> },
          ]}
        />
        <WasteCard
          title="Red Bin — Hazardous Waste"
          icon={<Biohazard className="w-6 h-6 text-red-600" />}
          color="border-red-200 bg-red-50/30 dark:bg-red-950/20"
          headerColor="bg-red-100 dark:bg-red-900/40"
          items={["Batteries & power banks", "Paints, oils & chemicals", "Expired medicines", "Broken electronics & e-waste", "Used syringes & medical waste"]}
          donts={[
            { label: "Regular dry/wet bins", icon: <Trash2 className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Near water sources", icon: <Droplets className="w-3.5 h-3.5 text-destructive shrink-0" /> },
            { label: "Open burning / incinerators", icon: <Flame className="w-3.5 h-3.5 text-destructive shrink-0" /> },
          ]}
        />
      </div>

      {/* Featured Videos */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-primary" /> Featured Videos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VIDEOS.map((video) => (
            <YoutubeEmbed key={video.id} {...video} />
          ))}
        </div>
      </div>

      {/* Gallery */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
          <Images className="w-6 h-6 text-primary" /> Visual Segregation Guide
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          A picture is worth a thousand words — here's exactly what belongs in each bin.
        </p>

        {/* Green + Blue Bins */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-4 rounded-full bg-green-500 inline-block shrink-0" />
              <h3 className="font-semibold text-lg text-green-700 dark:text-green-400">Green Bin — Wet Waste</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {GREEN_BIN_GALLERY.map((item) => (
                <GalleryCard key={item.label} url={item.url} label={item.label} ring="ring-green-400" />
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-4 h-4 rounded-full bg-blue-500 inline-block shrink-0" />
              <h3 className="font-semibold text-lg text-blue-700 dark:text-blue-400">Blue Bin — Dry Waste</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BLUE_BIN_GALLERY.map((item) => (
                <GalleryCard key={item.label} url={item.url} label={item.label} ring="ring-blue-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Red Bin — Hazardous */}
        <div className="rounded-2xl border-2 border-red-200 bg-red-50/40 dark:bg-red-950/20 p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-4 rounded-full bg-red-500 inline-block shrink-0" />
            <h3 className="font-semibold text-lg text-red-700 dark:text-red-400">Red Bin — Hazardous Waste</h3>
          </div>
          <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-5 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            These items are dangerous. Never mix with regular bins — take them to a designated hazardous waste drop-off.
          </p>

          {/* Photo grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            {RED_BIN_GALLERY.map((item) => (
              <GalleryCard key={item.label} url={item.url} label={item.label} ring="ring-red-400" />
            ))}
          </div>

          {/* Hazardous item examples */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {[
              { icon: <FlaskConical className="w-5 h-5 text-red-600" />, label: "Batteries & Power Banks", detail: "AA, AAA, lithium cells" },
              { icon: <Flame className="w-5 h-5 text-red-600" />, label: "Paints & Oils", detail: "Aerosols, motor oil, varnish" },
              { icon: <Syringe className="w-5 h-5 text-red-600" />, label: "Expired Medicines", detail: "Pills, syrups, inhalers" },
              { icon: <Biohazard className="w-5 h-5 text-red-600" />, label: "Electronics (E-Waste)", detail: "Phones, laptops, TVs, cables" },
            ].map((ex) => (
              <div key={ex.label} className="bg-white dark:bg-red-950/40 border border-red-200 rounded-xl p-3 flex flex-col gap-2">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                  {ex.icon}
                </div>
                <p className="font-semibold text-sm text-red-800 dark:text-red-300 leading-snug">{ex.label}</p>
                <p className="text-xs text-red-600/70 dark:text-red-400/60">{ex.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Waste Quiz */}
      <WasteQuiz />
    </div>
  );
}

function WasteQuiz() {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = QUIZ_QUESTIONS[currentQ];
  const isCorrect = selectedAnswer === question.answer;

  const handleConfirm = () => {
    if (selectedAnswer === null) return;
    setConfirmed(true);
    if (selectedAnswer === question.answer) setScore((s) => s + 20);
  };

  const handleNext = () => {
    if (currentQ + 1 >= QUIZ_QUESTIONS.length) {
      const total = score + (selectedAnswer === question.answer ? 20 : 0);
      const prev = Number(localStorage.getItem("ss_quiz_points") ?? 0);
      localStorage.setItem("ss_quiz_points", String(prev + total));
      setFinished(true);
    } else {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setConfirmed(false);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelectedAnswer(null);
    setConfirmed(false);
    setScore(0);
    setFinished(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-2 flex items-center gap-2">
        <HelpCircle className="w-6 h-6 text-primary" /> Waste Sorting Quiz
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Test your knowledge and earn up to 100 points. Each correct answer = 20 points.
      </p>

      <Card className="border-primary/20 shadow-md overflow-hidden">
        {finished ? (
          <CardContent className="p-8 flex flex-col items-center text-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-1">Quiz Complete!</h3>
              <p className="text-muted-foreground">You scored</p>
              <p className="text-5xl font-extrabold text-primary mt-1">{score}<span className="text-2xl text-muted-foreground">/100</span></p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm text-center">
              {[
                { label: "Points Earned", value: score },
                { label: "Correct", value: score / 20 },
                { label: "Wrong", value: QUIZ_QUESTIONS.length - score / 20 },
              ].map((s) => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            {score >= 80 ? (
              <p className="text-green-600 font-semibold text-sm bg-green-50 rounded-xl px-4 py-2">
                Excellent! You're a waste segregation expert.
              </p>
            ) : score >= 60 ? (
              <p className="text-amber-600 font-semibold text-sm bg-amber-50 rounded-xl px-4 py-2">
                Good job! Review the guides above to improve further.
              </p>
            ) : (
              <p className="text-blue-600 font-semibold text-sm bg-blue-50 rounded-xl px-4 py-2">
                Keep learning! Check the waste guides above and try again.
              </p>
            )}
            <Button className="rounded-full px-8" onClick={handleRestart}>
              <RotateCcw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        ) : (
          <>
            <div className="bg-muted/30 px-6 pt-5 pb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Question {currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
                <span>{score} pts</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${((currentQ) / QUIZ_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            <CardContent className="p-6 flex flex-col gap-5">
              <p className="text-lg font-semibold leading-snug">{question.question}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {question.options.map((opt, idx) => {
                  let cls = "border rounded-xl px-4 py-3 text-sm font-medium text-left transition-all duration-200 cursor-pointer ";
                  if (!confirmed) {
                    cls += selectedAnswer === idx
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40 hover:bg-primary/5";
                  } else {
                    if (idx === question.answer) {
                      cls += "border-green-500 bg-green-50 text-green-800";
                    } else if (idx === selectedAnswer && idx !== question.answer) {
                      cls += "border-red-400 bg-red-50 text-red-800";
                    } else {
                      cls += "border-border opacity-50";
                    }
                  }
                  return (
                    <button
                      key={idx}
                      className={cls}
                      onClick={() => !confirmed && setSelectedAnswer(idx)}
                      disabled={confirmed}
                    >
                      <span className="flex items-center gap-2">
                        {confirmed && idx === question.answer && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />}
                        {confirmed && idx === selectedAnswer && idx !== question.answer && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>

              {confirmed && (
                <div className={`text-sm rounded-xl p-3 font-medium ${isCorrect ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                  {isCorrect ? "Correct! " : "Not quite. "}
                  {question.explanation}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                {!confirmed ? (
                  <Button
                    className="flex-1"
                    disabled={selectedAnswer === null}
                    onClick={handleConfirm}
                  >
                    Confirm Answer
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={handleNext}>
                    {currentQ + 1 >= QUIZ_QUESTIONS.length ? "See Results" : "Next Question"}
                  </Button>
                )}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

function WasteCard({
  title,
  icon,
  color,
  headerColor,
  items,
  donts,
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  headerColor: string;
  items: string[];
  donts: { label: string; icon: React.ReactNode }[];
}) {
  return (
    <Card className={`border shadow-sm h-full flex flex-col ${color}`}>
      <CardHeader className={`pb-4 ${headerColor} rounded-t-xl border-b border-border/40`}>
        <div className="flex items-center gap-3">
          <div className="bg-background/80 p-2 rounded-lg shadow-sm">{icon}</div>
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col gap-6">
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-foreground mb-3">
            What goes in here:
          </h4>
          <ul className="space-y-2">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary font-bold mt-0.5">•</span> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-destructive mb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Keep Out:
          </h4>
          <ul className="space-y-2">
            {donts.map((dont, idx) => (
              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                {dont.icon}
                <span>{dont.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function YoutubeEmbed({ id, title, description, channel }: { id: string; title: string; description: string; channel: string }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 shadow-sm bg-card">
      <div className="aspect-video w-full">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg leading-snug">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <p className="text-xs text-primary font-medium mt-2 flex items-center gap-1">
          <PlayCircle className="w-3.5 h-3.5" /> {channel}
        </p>
      </div>
    </div>
  );
}

function GalleryCard({ url, label, ring }: { url: string; label: string; ring: string }) {
  return (
    <div className={`rounded-lg overflow-hidden border border-border/40 shadow-sm ring-2 ${ring}/30 group`}>
      <div className="aspect-square overflow-hidden">
        <img
          src={url}
          alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="px-2 py-1.5 bg-card">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
      </div>
    </div>
  );
}
