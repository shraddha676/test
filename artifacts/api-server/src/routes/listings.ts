import { Router, type IRouter } from "express";
import { db, listingsTable, insertListingSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateListingBody,
  GetListingParams,
  RequestListingParams,
  DeleteListingParams,
  GetListingsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/listings/stats/summary", async (req, res) => {
  try {
    const allListings = await db.select().from(listingsTable);
    const totalListings = allListings.length;
    const dryWasteCount = allListings.filter((l) =>
      ["plastic", "paper", "metal", "glass", "dry-waste"].includes(l.category)
    ).length;
    const wetWasteCount = allListings.filter((l) =>
      ["organic", "wet-waste"].includes(l.category)
    ).length;
    const electronicWasteCount = allListings.filter(
      (l) => l.category === "electronic"
    ).length;
    const otherCount = allListings.filter(
      (l) => l.category === "other"
    ).length;
    const totalRequests = allListings.reduce(
      (sum, l) => sum + l.requestCount,
      0
    );

    res.json({
      totalListings,
      dryWasteCount,
      wetWasteCount,
      electronicWasteCount,
      otherCount,
      totalRequests,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get listing stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings", async (req, res) => {
  try {
    const parsed = GetListingsQueryParams.safeParse(req.query);
    let results;
    if (parsed.success && parsed.data.category) {
      results = await db
        .select()
        .from(listingsTable)
        .where(eq(listingsTable.category, parsed.data.category))
        .orderBy(sql`${listingsTable.createdAt} DESC`);
    } else {
      results = await db
        .select()
        .from(listingsTable)
        .orderBy(sql`${listingsTable.createdAt} DESC`);
    }
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to get listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Must be logged in to create a listing" });
      return;
    }

    const parsed = CreateListingBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid listing data" });
      return;
    }

    const [listing] = await db
      .insert(listingsTable)
      .values({
        ...parsed.data,
        userId: req.user.id,
        userName: req.user.firstName
          ? `${req.user.firstName}${req.user.lastName ? ` ${req.user.lastName}` : ""}`
          : undefined,
      })
      .returning();

    res.status(201).json(listing);
  } catch (err) {
    req.log.error({ err }, "Failed to create listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/:id", async (req, res) => {
  try {
    const parsed = GetListingParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [listing] = await db
      .select()
      .from(listingsTable)
      .where(eq(listingsTable.id, parsed.data.id));

    if (!listing) {
      res.status(404).json({ error: "Listing not found" });
      return;
    }

    res.json(listing);
  } catch (err) {
    req.log.error({ err }, "Failed to get listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/listings/:id", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Must be logged in" });
      return;
    }

    const parsed = DeleteListingParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    await db.delete(listingsTable).where(eq(listingsTable.id, parsed.data.id));
    res.json({ success: true, message: "Listing deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings/:id/request", async (req, res) => {
  try {
    const parsed = RequestListingParams.safeParse({
      id: Number(req.params.id),
    });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    await db
      .update(listingsTable)
      .set({ requestCount: sql`${listingsTable.requestCount} + 1` })
      .where(eq(listingsTable.id, parsed.data.id));

    res.json({ success: true, message: "Request sent successfully!" });
  } catch (err) {
    req.log.error({ err }, "Failed to request listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
