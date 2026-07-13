import { useState, useCallback } from "react";
import { supabase } from "../supabaseClient";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  subMonths,
  subWeeks,
  format,
  parseISO,
  differenceInDays,
} from "date-fns";

function toDateInput(d) {
  return typeof d === "string" ? d : format(d, "yyyy-MM-dd");
}

export function useSlips() {
  const [loading, setLoading] = useState(false);

  const fetchSlips = useCallback(async (year, month) => {
    setLoading(true);
    const start = toDateInput(new Date(year, month - 1, 1));
    const end = toDateInput(new Date(year, month, 0));
    const { data, error } = await supabase
      .from("slips")
      .select("*")
      .gte("date", start)
      .lte("date", end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) throw error;
    return data || [];
  }, []);

  const fetchSlipById = useCallback(async (id) => {
    const { data, error } = await supabase
      .from("slips")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const createSlip = useCallback(async (slip) => {
    const { data, error } = await supabase
      .from("slips")
      .insert({
        date: slip.date,
        stake: slip.stake,
        games_count: slip.games_count,
        bookmaker: slip.bookmaker,
        notes: slip.notes || null,
        status: slip.status || "pending",
        payout: slip.status === "lost" ? 0 : slip.payout || null,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  const updateSlip = useCallback(async (id, updates) => {
    const payload = { ...updates };
    if (updates.status === "lost") {
      payload.payout = 0;
    }
    const { data, error } = await supabase
      .from("slips")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }, []);

  const fetchMonthSummary = useCallback(async (year, month) => {
    const start = toDateInput(new Date(year, month - 1, 1));
    const end = toDateInput(new Date(year, month, 0));
    const { data, error } = await supabase
      .from("slips")
      .select("*")
      .gte("date", start)
      .lte("date", end);
    if (error) throw error;
    const slips = data || [];
    const resolved = slips.filter((s) => s.status !== "pending");
    const totalStaked = slips.reduce((sum, s) => sum + Number(s.stake), 0);
    const totalReturned = resolved.reduce((sum, s) => sum + Number(s.payout || 0), 0);
    const totalNet = resolved.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);
    const won = resolved.filter((s) => s.status === "won").length;
    const hitRate = resolved.length > 0 ? (won / resolved.length) * 100 : null;
    return { totalStaked, totalReturned, totalNet, won, resolved: resolved.length, hitRate, count: slips.length };
  }, []);

  const fetchAllResolved = useCallback(async () => {
    const { data, error } = await supabase
      .from("slips")
      .select("*")
      .neq("status", "pending")
      .order("date", { ascending: true });
    if (error) throw error;
    return data || [];
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    const resolved = await fetchAllResolved();
    const now = new Date();

    const monthlyNet = [];
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(now, i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthSlips = resolved.filter((s) => {
        const sd = parseISO(s.date);
        return sd.getFullYear() === y && sd.getMonth() === m;
      });
      const net = monthSlips.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);
      monthlyNet.push({ month: format(d, "MMM yyyy"), net, key: `${y}-${String(m + 1).padStart(2, "0")}` });
    }

    const cumulative = [];
    let running = 0;
    for (const item of resolved) {
      running += Number(item.payout || 0) - Number(item.stake);
      cumulative.push({ date: item.date, net: running });
    }

    const thisMonthStart = startOfMonth(now);
    const thisMonthSlips = resolved.filter((s) => parseISO(s.date) >= thisMonthStart);
    const thisMonthNet = thisMonthSlips.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);
    const prevMonthStart = startOfMonth(subMonths(now, 1));
    const prevMonthEnd = endOfMonth(subMonths(now, 1));
    const prevMonthSlips = resolved.filter((s) => {
      const sd = parseISO(s.date);
      return sd >= prevMonthStart && sd <= prevMonthEnd;
    });
    const prevMonthNet = prevMonthSlips.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);

    let monthlyChange = null;
    if (prevMonthNet !== 0) {
      monthlyChange = ((thisMonthNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100;
    }

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekSlips = resolved.filter((s) => parseISO(s.date) >= thisWeekStart);
    const thisWeekNet = thisWeekSlips.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);
    const prevWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
    const prevWeekSlips = resolved.filter((s) => {
      const sd = parseISO(s.date);
      return sd >= prevWeekStart && sd <= prevWeekEnd;
    });
    const prevWeekNet = prevWeekSlips.reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);

    let weeklyChange = null;
    if (prevWeekNet !== 0) {
      weeklyChange = ((thisWeekNet - prevWeekNet) / Math.abs(prevWeekNet)) * 100;
    }

    const totalWon = resolved.filter((s) => s.status === "won").length;
    const hitRate = resolved.length > 0 ? (totalWon / resolved.length) * 100 : null;

    return {
      monthlyNet,
      cumulative,
      weeklyChange,
      monthlyChange,
      hitRate,
    };
  }, [fetchAllResolved]);

  const fetchLossLimit = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("monthly_loss_limit")
      .eq("id", user.id)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data?.monthly_loss_limit ?? null;
  }, []);

  const setLossLimit = useCallback(async (limit) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    const val = limit ? Number(limit) : null;
    const { error } = await supabase.from("profiles").upsert(
      { id: user.id, monthly_loss_limit: val },
      { onConflict: "id" }
    );
    if (error) throw error;
  }, []);

  const fetchCurrentMonthLoss = useCallback(async () => {
    const now = new Date();
    const start = toDateInput(startOfMonth(now));
    const end = toDateInput(endOfMonth(now));
    const { data, error } = await supabase
      .from("slips")
      .select("stake, payout, status")
      .neq("status", "pending")
      .gte("date", start)
      .lte("date", end);
    if (error) throw error;
    const net = (data || []).reduce((sum, s) => sum + Number(s.payout || 0) - Number(s.stake), 0);
    return net;
  }, []);

  const isLocked = useCallback((slip) => {
    if (slip.status === "pending") return false;
    const resolvedAt = new Date(slip.updated_at || slip.created_at);
    return differenceInDays(new Date(), resolvedAt) > 7;
  }, []);

  return {
    loading,
    fetchSlips,
    fetchSlipById,
    createSlip,
    updateSlip,
    fetchMonthSummary,
    fetchAnalyticsData,
    fetchLossLimit,
    setLossLimit,
    fetchCurrentMonthLoss,
    isLocked,
  };
}
