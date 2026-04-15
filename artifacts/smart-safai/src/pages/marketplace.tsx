import { useState, useRef, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import {
  useGetListings,
  useCreateListing,
  getGetListingsQueryKey,
  getGetListingStatsQueryKey,
} from "@workspace/api-client-react";
import type { Listing } from "@workspace/api-zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ShoppingBag,
  Plus,
  Filter,
  Search,
  MapPin,
  Clock,
  Info,
  Recycle,
  Camera,
  Upload,
  X,
  Phone,
  User,
  IndianRupee,
  Tag,
  CheckCircle2,
  ChevronRight,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CATEGORIES = [
  { value: "plastic", label: "Plastic" },
  { value: "paper", label: "Paper / Cardboard" },
  { value: "metal", label: "Metal / Tin" },
  { value: "glass", label: "Glass" },
  { value: "organic", label: "Organic / Food" },
  { value: "electronic", label: "Electronics" },
  { value: "dry-waste", label: "Dry Waste (General)" },
  { value: "wet-waste", label: "Wet Waste (General)" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  category: z.string().min(1, "Select a category"),
  price: z.string().min(1, "Enter a price or write 'Free'"),
  description: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  contactInfo: z.string().min(5, "Enter a phone number or email so buyers can reach you"),
});

type SellStep = "photo" | "form";
type DialogMode = "sell" | "donate";

function isFree(price?: string | null) {
  if (!price) return false;
  return price.toLowerCase().trim() === "free" || price.toLowerCase().trim() === "₹0";
}

export default function Marketplace() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<DialogMode>("sell");
  const [sellStep, setSellStep] = useState<SellStep>("photo");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [contactDialogListing, setContactDialogListing] = useState<Listing | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { data: listingsData, isLoading } = useGetListings(
    categoryFilter !== "all" ? { category: categoryFilter } : undefined
  );
  const listings = Array.isArray(listingsData) ? listingsData : [];

  const createListing = useCreateListing();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "plastic",
      price: "",
      description: "",
      location: "",
      contactInfo: "",
    },
  });

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const openDialog = (mode: DialogMode) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: `Please log in to ${mode} an item.`,
        variant: "destructive",
      });
      return;
    }
    setDialogMode(mode);
    setSellStep("photo");
    setCapturedImage(null);
    setCameraMode(false);
    setCameraError(null);
    form.reset({
      title: "",
      category: "plastic",
      price: mode === "donate" ? "Free" : "",
      description: "",
      location: "",
      contactInfo: "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    stopStream();
    setDialogOpen(false);
    setCameraMode(false);
    setCapturedImage(null);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      setCameraMode(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      setCameraError("Camera access denied. Please upload a photo instead.");
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const MAX = 800;
    let w = video.videoWidth;
    let h = video.videoHeight;
    if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }

    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.75);

    stopStream();
    setCameraMode(false);
    setCapturedImage(dataUrl);
    setSellStep("form");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 800;
        let w = img.width;
        let h = img.height;
        if (w > MAX) { h = Math.round((h * MAX) / w); w = MAX; }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.75));
        setSellStep("form");
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const finalPrice = dialogMode === "donate" ? "Free" : values.price;
    createListing.mutate(
      {
        data: {
          title: values.title,
          category: values.category,
          description: values.description,
          location: values.location,
          imageUrl: capturedImage ?? undefined,
          price: finalPrice,
          contactInfo: values.contactInfo,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: dialogMode === "donate" ? "Donation Listed!" : "Listed!",
            description: dialogMode === "donate"
              ? "Your item is now available to collect for free."
              : "Your item is now live on the marketplace.",
          });
          queryClient.invalidateQueries({ queryKey: getGetListingsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetListingStatsQueryKey() });
          closeDialog();
        },
        onError: () => {
          toast({ title: "Error", description: "Could not create listing. Please try again.", variant: "destructive" });
        },
      }
    );
  };

  const filteredListings = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryLabel = (cat: string) =>
    CATEGORIES.find((c) => c.value === cat)?.label ?? cat.replace(/-/g, " ");

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      plastic: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
      paper: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      metal: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      glass: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      organic: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      electronic: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "dry-waste": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "wet-waste": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    };
    return map[cat] ?? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Marketplace
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Buy, sell, or donate recyclable materials. One person's waste is another's resource!
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full font-semibold border-green-500 text-green-700 hover:bg-green-50"
            onClick={() => openDialog("donate")}
          >
            <Heart className="w-5 h-5 mr-2 text-green-600" /> Donate
          </Button>
          <Button size="lg" className="rounded-full font-semibold shadow-sm" onClick={() => openDialog("sell")}>
            <Plus className="w-5 h-5 mr-2" /> Sell Item
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search listings..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2">
              <Filter className="w-4 h-4" />
              {categoryFilter === "all" ? "All Categories" : getCategoryLabel(categoryFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
              <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
              {CATEGORIES.map((c) => (
                <DropdownMenuRadioItem key={c.value} value={c.value}>{c.label}</DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Listing Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden border-border/50">
              <Skeleton className="h-52 w-full rounded-none" />
              <CardHeader className="p-4 pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center">
          <Recycle className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No listings found</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            {searchQuery
              ? "Nothing matched your search. Try different keywords."
              : "The marketplace is empty. Be the first to list something!"}
          </p>
          <Button variant="outline" onClick={() => openDialog("sell")}>Sell an Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              currentUserId={user?.id}
              getCategoryLabel={getCategoryLabel}
              getCategoryColor={getCategoryColor}
              onBuyNow={() => setContactDialogListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Sell / Donate Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              {sellStep === "photo" ? (
                dialogMode === "donate"
                  ? <><Heart className="w-5 h-5 text-green-600" /> Add Donation Photo</>
                  : <><Camera className="w-5 h-5 text-primary" /> Add Item Photo</>
              ) : (
                dialogMode === "donate"
                  ? <><Heart className="w-5 h-5 text-green-600" /> Donation Details</>
                  : <><Tag className="w-5 h-5 text-primary" /> Item Details</>
              )}
            </DialogTitle>
            {dialogMode === "donate" && (
              <div className="mt-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">FREE</span>
                <p className="text-xs text-green-700">This item will be listed for free — no charge to the collector.</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <StepDot active={sellStep === "photo"} done={sellStep === "form"} label="1. Photo" />
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <StepDot active={sellStep === "form"} done={false} label="2. Details" />
            </div>
          </DialogHeader>

          {sellStep === "photo" ? (
            <div className="p-6">
              {cameraMode ? (
                <div className="flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => { stopStream(); setCameraMode(false); }}>
                      <X className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                    <Button className="flex-1" onClick={capturePhoto}>
                      <Camera className="w-4 h-4 mr-2" /> Take Photo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {cameraError && (
                    <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{cameraError}</p>
                  )}
                  <div
                    className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload from gallery</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <Button variant="outline" className="w-full" onClick={startCamera}>
                    <Camera className="w-4 h-4 mr-2" /> Open Camera
                  </Button>
                  <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setSellStep("form")}>
                    Skip — add photo later
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {capturedImage && (
                <div className="relative rounded-xl overflow-hidden mb-5 aspect-video bg-muted">
                  <img src={capturedImage} alt="Item preview" className="w-full h-full object-cover" />
                  <button
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1 transition-colors"
                    onClick={() => { setCapturedImage(null); setSellStep("photo"); }}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Cardboard boxes (10 pcs)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {CATEGORIES.map((c) => (
                                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          {dialogMode === "donate" ? (
                            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-green-50 border-green-300">
                              <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">FREE</span>
                              <span className="text-sm text-green-700 font-medium">No charge</span>
                            </div>
                          ) : (
                            <FormControl>
                              <Input placeholder='e.g. ₹50 or Free' {...field} />
                            </FormControl>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pickup Location</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Block B Hostel, Gate 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Condition, quantity, pickup times..."
                            className="resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Contact (Phone / Email)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 9876543210 or you@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setSellStep("photo")}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className={`flex-1 ${dialogMode === "donate" ? "bg-green-600 hover:bg-green-700" : ""}`}
                      disabled={createListing.isPending}
                    >
                      {createListing.isPending
                        ? "Posting..."
                        : dialogMode === "donate"
                        ? "Post Donation"
                        : "Post Listing"}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      {contactDialogListing && (
        <ContactDialog listing={contactDialogListing} onClose={() => setContactDialogListing(null)} />
      )}
    </div>
  );
}

function StepDot({ active, done, label }: { active: boolean; done: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${active ? "text-primary" : done ? "text-green-600" : "text-muted-foreground"}`}>
      {done ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px] ${active ? "border-primary bg-primary text-white" : "border-muted-foreground"}`}>
          {label[0]}
        </span>
      )}
      {label.slice(3)}
    </div>
  );
}

function ListingCard({
  listing,
  currentUserId,
  getCategoryLabel,
  getCategoryColor,
  onBuyNow,
}: {
  listing: Listing;
  currentUserId?: string;
  getCategoryLabel: (c: string) => string;
  getCategoryColor: (c: string) => string;
  onBuyNow: () => void;
}) {
  const isOwn = currentUserId === listing.userId;
  const free = isFree(listing.price);

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 border-border/60 group">
      {listing.imageUrl ? (
        <div className="h-52 overflow-hidden bg-muted relative">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <Badge className={`absolute top-3 left-3 ${getCategoryColor(listing.category)} shadow-sm border-0 font-medium`}>
            {getCategoryLabel(listing.category)}
          </Badge>
          {listing.price && (
            free ? (
              <span className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> FREE
              </span>
            ) : (
              <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow">
                {listing.price}
              </span>
            )
          )}
        </div>
      ) : (
        <div className="h-52 bg-muted/30 flex items-center justify-center relative">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
          <Badge className={`absolute top-3 left-3 ${getCategoryColor(listing.category)} shadow-sm border-0 font-medium`}>
            {getCategoryLabel(listing.category)}
          </Badge>
          {listing.price && (
            free ? (
              <span className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> FREE
              </span>
            ) : (
              <span className="absolute top-3 right-3 bg-primary text-primary-foreground text-sm font-bold px-3 py-1 rounded-full shadow">
                {listing.price}
              </span>
            )
          )}
        </div>
      )}

      <CardHeader className="p-4 pb-2">
        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{listing.title}</h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {listing.location}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {format(new Date(listing.createdAt), "MMM d")}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-1">
        {listing.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{listing.description}</p>
        )}
        <div className="flex items-center gap-2 mt-auto">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
              {listing.userName?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-muted-foreground">{listing.userName ?? "Anonymous"}</span>
          <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {listing.requestCount} interested
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isOwn ? (
          <Button className="w-full" variant="secondary" disabled>
            Your Listing
          </Button>
        ) : free ? (
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={onBuyNow}
          >
            <Heart className="w-4 h-4 mr-2" /> Request (Free)
          </Button>
        ) : (
          <Button className="w-full" onClick={onBuyNow}>
            Buy Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function ContactDialog({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const free = isFree(listing.price);

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {free ? (
              <><Heart className="w-5 h-5 text-green-600" /> Request Free Item</>
            ) : (
              <><Phone className="w-5 h-5 text-primary" /> Contact Seller</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {listing.imageUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-muted">
              <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Item</p>
              <p className="font-semibold">{listing.title}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Price</p>
              {free ? (
                <p className="font-bold text-green-600 flex items-center gap-1.5">
                  <Heart className="w-4 h-4" /> Free — no charge
                </p>
              ) : listing.price ? (
                <p className="font-bold text-primary flex items-center gap-1">
                  <IndianRupee className="w-4 h-4" />{listing.price.replace(/[₹]/g, "")}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">Location</p>
              <p className="font-medium flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" /> {listing.location}
              </p>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {free ? "Donor" : "Seller"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{listing.userName ?? "Anonymous"}</p>
              </div>
            </div>
            {listing.contactInfo ? (
              <div className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm font-medium">{listing.contactInfo}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Info className="w-4 h-4" />
                <p>No contact info provided.</p>
              </div>
            )}
          </div>

          <Button className="w-full" onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
