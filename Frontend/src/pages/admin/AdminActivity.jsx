import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Activity as ActivityIcon, BarChart3, Search,
  TrendingUp, User, RefreshCcw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function AdminActivity() {
  usePageTitle("Activity Monitor");
  const { user } = useAppContext();
  const [chartData, setChartData] = useState([]);
  const [totalActivity, setTotalActivity] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const [chartRes, recentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/activity`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/activity/recent?limit=30`, { headers }),
      ]);
      if (chartRes.ok) {
        const data = await chartRes.json();
        setChartData(data.dailyChart || []);
        setTotalActivity(data.totalActivity || 0);
      }
      if (recentRes.ok) setRecentActivity(await recentRes.json());
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maxCount = Math.max(...chartData.map((d) => d.count), 1);

  const totalSearches = chartData.reduce((sum, d) => sum + (d.searches || 0), 0);
  const totalTryons = chartData.reduce((sum, d) => sum + (d.tryons || 0), 0);
  const avgDaily = chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.count, 0) / chartData.length).toFixed(1) : 0;
  const peakDay = chartData.reduce((max, d) => (d.count > max.count ? d : max), { count: 0, date: "-" });

  const filteredActivity = activeFilter === "all"
    ? recentActivity
    : recentActivity.filter((a) => a.type === activeFilter);

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <ActivityIcon className="h-6 w-6 text-purple-500" />
            Activity Monitor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">30-day platform activity trends and live feed</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="rounded-xl h-9 gap-2">
          <RefreshCcw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Total Actions", value: totalActivity, icon: ActivityIcon, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Searches (30d)", value: totalSearches, icon: Search, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Avg/Day", value: avgDaily, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Peak Day", value: `${peakDay.count}`, icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10", sub: peakDay.date !== "-" ? peakDay.date : "" },
        ].map((stat) => (
          <Card key={stat.label} className="bg-card/50 backdrop-blur-sm border-border/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <div className={`h-7 w-7 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              {stat.sub && <p className="text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Chart + Feed */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* 30-day Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Activity Trend (30 Days)</CardTitle>
                <CardDescription className="text-xs">All user actions aggregated daily</CardDescription>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                  No activity data yet
                </div>
              ) : (
                <div className="w-full" style={{ height: "224px" }}>
                  <div className="relative w-full h-full flex items-end gap-[3px] pt-6">
                    {chartData.map((item, i) => {
                      const barMaxHeight = 190;
                      const heightPx = maxCount > 0 ? Math.max((item.count / maxCount) * barMaxHeight, 6) : 6;
                      return (
                        <div key={i} className="relative w-full flex flex-col items-center group">
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-2 py-1 rounded-md shadow-lg pointer-events-none z-10 font-medium whitespace-nowrap text-center">
                            <p className="font-bold">{item.count} actions</p>
                            <p>{item.searches}s / {item.tryons}t · {item.date}</p>
                          </div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: heightPx }}
                            transition={{ duration: 0.6, delay: 0.2 + i * 0.02, ease: "easeOut" }}
                            className="w-full max-w-[12px] rounded-t bg-gradient-to-t from-purple-500/60 to-purple-500/20 hover:from-purple-500 hover:to-purple-500/60 transition-colors cursor-pointer"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Live Feed */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2"
        >
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Live Feed</CardTitle>
                  <CardDescription className="text-xs">Recent user actions</CardDescription>
                </div>
                <div className="flex gap-1">
                  {["all", "search", "tryon"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors capitalize ${
                        activeFilter === filter
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredActivity.length === 0 ? (
                <div className="h-56 flex items-center justify-center text-sm text-muted-foreground">
                  No activity
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredActivity.map((act, i) => (
                    <div key={act._id || i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === "search" ? "bg-emerald-500/10" : "bg-purple-500/10"
                      }`}>
                        {act.type === "search" ? (
                          <Search className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <ActivityIcon className="h-3.5 w-3.5 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/admin/users/${act.userId?._id}`}
                            className="text-sm font-semibold hover:text-primary transition-colors truncate"
                          >
                            {act.userId?.name || act.userId?.username || "User"}
                          </Link>
                          <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0 rounded capitalize shrink-0">
                            {act.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {act.metadata?.matchesCount ? `${act.metadata.matchesCount} matches found` : "Action performed"}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 font-medium shrink-0 mt-0.5">
                        {formatTimeAgo(act.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
