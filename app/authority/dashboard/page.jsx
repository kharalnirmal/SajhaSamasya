"use client";

import { useEffect, useState, useCallback } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Star,
  LogOut,
  Settings,
  X,
  ChevronDown,
  ChevronUp,
  MapPin,
  MessageSquare,
  RefreshCw,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { DISTRICTS, CATEGORIES } from "@/lib/constants";
import PostActionsMenu from "@/components/posts/PostActionsMenu";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useAutoRefresh } from "@/lib/hooks/useAutoRefresh";
import { useTranslation } from "@/lib/hooks/useTranslation";

const CATEGORY_COLORS = {
  road: "bg-orange-100 text-orange-700",
  water: "bg-blue-100 text-blue-700",
  electricity: "bg-yellow-100 text-yellow-700",
  garbage: "bg-green-100 text-green-700",
  safety: "bg-red-100 text-red-700",
  other: "bg-gray-100 text-gray-600",
};

const CATEGORY_HEX = {
  road: "#f97316",
  water: "#3b82f6",
  electricity: "#eab308",
  garbage: "#22c55e",
  safety: "#ef4444",
  other: "#6b7280",
};

const STATUS_PIE_COLORS = {
  Pending: "#eab308",
  Active: "#3b82f6",
  Resolved: "#22c55e",
  Overdue: "#ef4444",
};

function RatingStars({ rating }) {
  const full = Math.floor(rating);
  const frac = rating - full;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= full
              ? "text-yellow-400 fill-yellow-400"
              : i === full + 1 && frac >= 0.5
                ? "text-yellow-400 fill-yellow-200"
                : "text-gray-300"
          }`}
        />
      ))}
      <span className="ml-1 text-gray-600 text-xs">{rating.toFixed(1)}</span>
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isOverdue(post) {
  return (
    post.samasyaStatus !== "completed" &&
    post.deadline &&
    new Date(post.deadline) < new Date()
  );
}

export default function AuthorityDashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const { t } = useTranslation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [areaOpen, setAreaOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [savingArea, setSavingArea] = useState(false);
  const [responseModal, setResponseModal] = useState(null); // { postId, currentStatus }
  const [responseText, setResponseText] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const handlePostUpdated = (updatedPost) => {
    setData((prev) => ({
      ...prev,
      posts: prev.posts.map((p) =>
        p._id === updatedPost._id ? updatedPost : p,
      ),
    }));
  };

  const handlePostDeleted = (deletedId) => {
    setData((prev) => ({
      ...prev,
      posts: prev.posts.filter((p) => p._id !== deletedId),
    }));
  };

  const fetchData = useCallback(
    async (filter = statusFilter) => {
      try {
        const res = await fetch(`/api/posts/authority?status=${filter}`);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
        if (json.authority?.area) {
          setSelectedCategories(json.authority.area.categories || []);
          setSelectedDistrict(json.authority.area.district || "");
        }
      } catch (err) {
        toast.error(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/authority/sign-in");
      return;
    }
    fetchData();
  }, [isLoaded, isSignedIn, router, fetchData]);

  // Auto-refresh every 10 seconds (silent, no loading spinner)
  useAutoRefresh(fetchData, 10000, isLoaded && isSignedIn);

  const handleFilterChange = (f) => {
    setStatusFilter(f);
    setLoading(true);
    fetchData(f);
  };

  const handleSaveArea = async () => {
    setSavingArea(true);
    try {
      const res = await fetch("/api/user/area", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categories: selectedCategories,
          district: selectedDistrict,
        }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      toast.success(t("auth.areaSaved"));
      setAreaOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to save area");
    } finally {
      setSavingArea(false);
    }
  };

  const handleStatusUpdate = async (postId, newStatus) => {
    setUpdatingId(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, response: responseText }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      toast.success(`Marked as ${newStatus.replace("_", " ")}`);
      setResponseModal(null);
      setResponseText("");
      fetchData();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const toggleCategory = (c) =>
    setSelectedCategories((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="border-blue-600 border-t-2 rounded-full w-8 h-8 animate-spin" />
      </div>
    );
  }

  const { posts = [], stats = {}, authority } = data || {};
  const areaConfigured = !!(
    authority?.area?.district && authority?.area?.categories?.length > 0
  );

  /* ── Derive chart data from posts ── */
  const statusChartData = [
    { name: "Pending", value: stats.pending ?? 0 },
    { name: "Active", value: stats.inProgress ?? 0 },
    { name: "Resolved", value: stats.completed ?? 0 },
    { name: "Overdue", value: stats.overdue ?? 0 },
  ].filter((d) => d.value > 0);

  const categoryChartData = CATEGORIES.map((cat) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    count: posts.filter((p) => p.category === cat).length,
    fill: CATEGORY_HEX[cat] || "#6b7280",
  })).filter((d) => d.count > 0);

  /* ── 7-day trend data (reported vs resolved per day) ── */
  const trendData = (() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10); // YYYY-MM-DD
      const label = d.toLocaleDateString("en", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const reported = posts.filter(
        (p) => p.createdAt && p.createdAt.slice(0, 10) === dateStr,
      ).length;
      const resolved = posts.filter(
        (p) =>
          p.samasyaStatus === "completed" &&
          p.respondedAt &&
          p.respondedAt.slice(0, 10) === dateStr,
      ).length;
      days.push({ date: label, Reported: reported, Resolved: resolved });
    }
    return days;
  })();

  const hasTrendData = trendData.some((d) => d.Reported > 0 || d.Resolved > 0);

  return (
    <div className="bg-slate-50 pb-28 min-h-screen">
      {/* ── Authority header ── */}
      <div className="bg-white border-b border-slate-100 px-4 pt-5 pb-5">
        <div className="flex justify-between items-center mx-auto max-w-2xl">
          <div className="flex items-center gap-3">
            {authority?.avatar ? (
              <Image
                src={authority.avatar}
                alt={authority.name}
                width={40}
                height={40}
                className="border border-slate-200 rounded-full object-cover"
              />
            ) : (
              <div className="flex justify-center items-center bg-indigo-100 rounded-full w-10 h-10 font-bold text-indigo-600 text-sm">
                {authority?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">
                {authority?.name}
              </p>
              {authority?.department && (
                <p className="text-slate-400 text-xs">{authority.department}</p>
              )}
              <div className="flex items-center gap-3 mt-0.5">
                <RatingStars rating={authority?.rating ?? 5} />
                <span className="text-slate-400 text-[10px]">
                  {authority?.totalResolved ?? 0} {t("auth.resolved")} ·{" "}
                  {authority?.totalIgnored ?? 0} {t("auth.ignored")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setAreaOpen((o) => !o)}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg text-slate-600 text-xs transition"
            >
              <Settings className="w-3.5 h-3.5" />
              {t("auth.area")}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1 bg-slate-100 hover:bg-red-50 hover:text-red-600 px-2 py-1.5 rounded-lg text-slate-500 text-xs transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {(authority?.rating ?? 5) < 3.5 && (
          <div className="mx-auto mt-2 max-w-2xl">
            <p className="text-yellow-600 text-xs">⚠ {t("auth.lowRating")}</p>
          </div>
        )}
      </div>

      {/* ── Area settings panel ── */}
      {areaOpen && (
        <div className="bg-white mx-auto px-4 py-4 border-b border-slate-100 max-w-2xl">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-slate-700 text-sm">
              {t("auth.areaSettings")}
            </h3>
            <button
              onClick={() => setAreaOpen(false)}
              className="p-1 rounded-md hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          <p className="mb-3 text-slate-400 text-xs">{t("auth.areaHint")}</p>

          <div className="mb-3">
            <p className="mb-1.5 font-medium text-slate-600 text-xs">
              {t("auth.categories")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`px-3 py-1 rounded-full text-xs capitalize border transition ${
                    selectedCategories.includes(c)
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-1.5 font-medium text-slate-600 text-xs">
              {t("auth.district")}
            </p>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-white px-3 py-2 border border-slate-200 focus:border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 w-full text-sm transition"
            >
              <option value="">{t("auth.selectDistrict")}</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSaveArea}
            disabled={savingArea}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 px-4 py-2 rounded-lg w-full font-medium text-white text-sm transition"
          >
            {savingArea ? t("auth.saving") : t("auth.saveArea")}
          </button>
        </div>
      )}

      <div className="space-y-4 mx-auto px-4 pt-4 max-w-2xl">
        {/* ── Stats grid ── */}
        <div className="gap-3 grid grid-cols-5">
          {[
            {
              label: t("auth.total"),
              value: stats.total ?? 0,
              icon: ClipboardList,
              color: "text-indigo-500",
              bg: "bg-indigo-50",
            },
            {
              label: t("auth.pending"),
              value: stats.pending ?? 0,
              icon: Clock,
              color: "text-amber-500",
              bg: "bg-amber-50",
            },
            {
              label: t("auth.active"),
              value: stats.inProgress ?? 0,
              icon: TrendingUp,
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              label: t("auth.done"),
              value: stats.completed ?? 0,
              icon: CheckCircle,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              label: t("auth.overdue"),
              value: stats.overdue ?? 0,
              icon: AlertTriangle,
              color: "text-red-500",
              bg: "bg-red-50",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white p-2.5 border border-slate-100 rounded-xl text-center"
            >
              <div
                className={`flex justify-center items-center rounded-lg w-7 h-7 mx-auto mb-1.5 ${s.bg}`}
              >
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className="font-bold text-slate-800 text-lg leading-none">
                {s.value}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Charts Section ── */}
        {(statusChartData.length > 0 || categoryChartData.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Distribution — Donut */}
            {statusChartData.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {t("auth.statusDist")}
                </h4>
                <div className="relative" style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={48}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {statusChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_PIE_COLORS[entry.name]}
                            className="drop-shadow-sm"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "rgba(255,255,255,0.95)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                        itemStyle={{ color: "#374151" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-slate-800 leading-none">
                      {stats.total ?? 0}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      {t("auth.total")}
                    </span>
                  </div>
                </div>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
                  {statusChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: STATUS_PIE_COLORS[entry.name] }}
                      />
                      <span className="text-[11px] text-slate-500">
                        {entry.name}{" "}
                        <span className="text-slate-400">({entry.value})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown — Bar Chart */}
            {categoryChartData.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  {t("auth.byCategory")}
                </h4>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={categoryChartData}
                      layout="vertical"
                      margin={{ top: 0, right: 4, bottom: 0, left: 0 }}
                      barCategoryGap="20%"
                    >
                      <CartesianGrid
                        horizontal={false}
                        strokeDasharray="3 3"
                        stroke="#f1f5f9"
                      />
                      <XAxis
                        type="number"
                        allowDecimals={false}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{
                          fontSize: 11,
                          fill: "#4b5563",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={72}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(99,102,241,0.06)", radius: 8 }}
                        contentStyle={{
                          background: "rgba(255,255,255,0.95)",
                          backdropFilter: "blur(8px)",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                        itemStyle={{ color: "#374151" }}
                      />
                      <Bar
                        dataKey="count"
                        radius={[0, 6, 6, 0]}
                        animationBegin={0}
                        animationDuration={800}
                      >
                        {categoryChartData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Inline legend */}
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
                  {categoryChartData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-sm shrink-0"
                        style={{ background: entry.fill }}
                      />
                      <span className="text-[11px] text-slate-500">
                        {entry.name}{" "}
                        <span className="text-slate-400">({entry.count})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 7-Day Trend — Area Line Chart ── */}
        {hasTrendData && (
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t("auth.7dayTrend")}
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-[3px] rounded-full bg-blue-500" />
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t("auth.reported")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-[3px] rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t("post.resolved")}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 8, right: 8, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient
                      id="gradReported"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="gradResolved"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.25}
                      />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      padding: "8px 14px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                    itemStyle={{ padding: "2px 0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Reported"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#gradReported)"
                    dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "#3b82f6",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    animationBegin={0}
                    animationDuration={900}
                  />
                  <Area
                    type="monotone"
                    dataKey="Resolved"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gradResolved)"
                    dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
                    activeDot={{
                      r: 5,
                      fill: "#10b981",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    animationBegin={0}
                    animationDuration={900}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
          {["all", "pending", "in_progress", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                statusFilter === f
                  ? "bg-white shadow-sm text-indigo-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {f === "in_progress"
                ? t("auth.active")
                : f === "all"
                  ? t("auth.all")
                  : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="px-2 text-slate-400 hover:text-indigo-500 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Coverage area hint */}
        {selectedCategories.length > 0 && selectedDistrict ? (
          <div className="flex items-center gap-1.5 text-indigo-500 text-xs">
            <Shield className="w-3.5 h-3.5" />
            <span>{t("auth.showing")}:</span>
            {selectedCategories.map((c) => (
              <span
                key={c}
                className="capitalize bg-indigo-50 px-1.5 py-0.5 rounded text-indigo-600"
              >
                {c}
              </span>
            ))}
            <span className="text-slate-400">·</span>
            <span className="text-slate-600">{selectedDistrict}</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 bg-amber-50 px-4 py-3 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition"
            onClick={() => setAreaOpen(true)}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <p className="font-medium text-amber-700 text-xs">
              {t("auth.selectAreaFirst")}
            </p>
          </div>
        )}

        {/* ── Post feed ── */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 border border-dashed border-slate-200 rounded-xl text-center">
            <ClipboardList className="w-8 h-8 text-slate-300" />
            <p className="text-slate-400 text-sm">{t("auth.noIssues")}</p>
            {selectedCategories.length === 0 && (
              <p className="text-slate-400 text-xs">{t("auth.setArea")}</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => {
              const overdue = isOverdue(post);
              return (
                <div
                  key={post._id}
                  className={`bg-white rounded-xl overflow-hidden border ${overdue ? "border-red-200" : "border-slate-100"}`}
                >
                  {/* Post photo */}
                  {post.photo && (
                    <div
                      className="relative bg-gray-100 w-full"
                      style={{ height: 160 }}
                    >
                      <Image
                        src={post.photo}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="640px"
                      />
                    </div>
                  )}

                  <div className="space-y-3 p-4">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {post.author?.avatar ? (
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={28}
                            height={28}
                            className="rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="flex justify-center items-center bg-slate-100 rounded-full w-7 h-7 text-slate-500 text-xs shrink-0">
                            {post.author?.name?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-700 text-xs truncate">
                            {post.author?.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {timeAgo(post.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {overdue && (
                          <span className="flex items-center gap-0.5 bg-red-100 px-2 py-0.5 rounded-full text-[10px] text-red-600">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${CATEGORY_COLORS[post.category]}`}
                        >
                          {post.category}
                        </span>
                        <PostActionsMenu
                          post={post}
                          onUpdated={handlePostUpdated}
                          onDeleted={handlePostDeleted}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug">
                        {post.title}
                      </h3>
                      <p className="mt-0.5 text-slate-400 text-xs line-clamp-2">
                        {post.description}
                      </p>
                    </div>

                    {/* Location */}
                    {post.location?.address && (
                      <p className="flex items-center gap-1 text-slate-400 text-xs">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {post.location.address}
                        </span>
                      </p>
                    )}

                    {/* Deadline */}
                    {post.deadline && post.samasyaStatus !== "completed" && (
                      <p
                        className={`text-xs ${overdue ? "text-red-500" : "text-slate-400"}`}
                      >
                        {t("auth.deadline")}:{" "}
                        {new Date(post.deadline).toLocaleString()}
                      </p>
                    )}

                    {/* Authority response if exists */}
                    {post.authorityResponse && (
                      <div className="bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100">
                        <p className="text-indigo-700 text-xs">
                          <span className="font-medium">
                            {t("auth.response")}:{" "}
                          </span>
                          {post.authorityResponse}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {post.samasyaStatus !== "completed" && (
                      <div className="flex gap-2 pt-1">
                        {post.samasyaStatus === "pending" && (
                          <button
                            disabled={
                              updatingId === post._id || !areaConfigured
                            }
                            onClick={() => {
                              if (!areaConfigured) {
                                toast.error(t("common.selectAreaFirst"));
                                setAreaOpen(true);
                                return;
                              }
                              handleStatusUpdate(post._id, "in_progress");
                            }}
                            className="flex flex-1 justify-center items-center gap-1 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 py-2 border border-indigo-200 rounded-lg font-medium text-indigo-600 text-xs transition"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            {t("auth.markInProgress")}
                          </button>
                        )}
                        <button
                          disabled={updatingId === post._id || !areaConfigured}
                          onClick={() => {
                            if (!areaConfigured) {
                              toast.error(t("common.selectAreaFirst"));
                              setAreaOpen(true);
                              return;
                            }
                            setResponseModal({
                              postId: post._id,
                              currentStatus: post.samasyaStatus,
                            });
                            setResponseText("");
                          }}
                          className="flex flex-1 justify-center items-center gap-1 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 py-2 border border-emerald-200 rounded-lg font-medium text-emerald-600 text-xs transition"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t("auth.markComplete")}
                        </button>
                        <button
                          disabled={!areaConfigured}
                          onClick={() => {
                            if (!areaConfigured) {
                              toast.error(t("common.selectAreaFirst"));
                              setAreaOpen(true);
                              return;
                            }
                            setResponseModal({
                              postId: post._id,
                              currentStatus: post.samasyaStatus,
                              responseOnly: true,
                            });
                            setResponseText(post.authorityResponse || "");
                          }}
                          className="bg-slate-50 hover:bg-slate-100 disabled:opacity-50 p-2 border border-slate-200 rounded-lg text-slate-500 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    {post.samasyaStatus === "completed" && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t("post.resolved")}{" "}
                        {post.respondedAt ? timeAgo(post.respondedAt) : ""}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Response / Complete modal ── */}
      {responseModal && (
        <div className="z-50 fixed inset-0 flex justify-center items-end bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-5 rounded-xl w-full max-w-lg border border-slate-200 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-700 text-sm">
                {responseModal.responseOnly
                  ? t("auth.addResponse")
                  : t("auth.markCompleted")}
              </h3>
              <button
                onClick={() => setResponseModal(null)}
                className="p-1 rounded-md hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder={t("auth.responsePlaceholder")}
              rows={3}
              className="px-3 py-2 border border-slate-200 focus:border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-100 w-full text-sm resize-none transition"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setResponseModal(null)}
                className="flex-1 hover:bg-slate-50 py-2 border border-slate-200 rounded-lg text-slate-500 text-sm transition"
              >
                {t("auth.cancel")}
              </button>
              {!responseModal.responseOnly && (
                <button
                  disabled={updatingId === responseModal.postId}
                  onClick={() =>
                    handleStatusUpdate(responseModal.postId, "completed")
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 py-2 rounded-lg font-medium text-white text-sm transition"
                >
                  {updatingId === responseModal.postId
                    ? t("auth.saving")
                    : t("auth.confirmComplete")}
                </button>
              )}
              {responseModal.responseOnly && (
                <button
                  disabled={updatingId === responseModal.postId}
                  onClick={() =>
                    handleStatusUpdate(
                      responseModal.postId,
                      responseModal.currentStatus,
                    )
                  }
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 py-2 rounded-lg font-medium text-white text-sm transition"
                >
                  {updatingId === responseModal.postId
                    ? t("auth.saving")
                    : t("auth.saveResponse")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
