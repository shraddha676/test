import { Router, type IRouter } from "express";

const router: IRouter = Router();

const tips = [
  { id: 1, tip: "Segregate your wet waste daily and use it for composting", category: "wet-waste", icon: "leaf" },
  { id: 2, tip: "Flatten cardboard boxes before recycling to save space", category: "dry-waste", icon: "package" },
  { id: 3, tip: "Rinse plastic containers before putting them in the recycling bin", category: "dry-waste", icon: "recycle" },
  { id: 4, tip: "Use vegetable peels to make compost for your garden", category: "wet-waste", icon: "sprout" },
  { id: 5, tip: "Never mix wet and dry waste -- it contaminates recyclables", category: "general", icon: "alert-circle" },
  { id: 6, tip: "E-waste like old phones should go to certified recycling centers", category: "electronic", icon: "smartphone" },
  { id: 7, tip: "Paper bags are recyclable -- flatten and bundle them together", category: "dry-waste", icon: "file" },
  { id: 8, tip: "Food scraps can be turned into biogas through biodigesters", category: "wet-waste", icon: "zap" },
];

router.get("/tips/daily", (req, res) => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const tip = tips[dayOfYear % tips.length];
  res.json(tip);
});

export default router;
