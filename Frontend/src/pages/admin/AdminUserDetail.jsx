import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, Phone, Shield, ShieldOff, Trash2, ArrowLeft,
  Search, Heart, Calendar, Upload, Clock, Image as ImageIcon,
  ExternalLink, Activity as ActivityIcon,
} from "lucide-react";
import { API_BASE_URL } from "@/config";
import usePageTitle from "@/hooks/usePageTitle";

export default function AdminUserDetail() {
  usePageTitle("User Details");
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: adminUser } = useAppContext();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${adminUser.token}` },
        });
        if (res.ok) setData(await res.json());
        else navigate("/admin/users");
      } catch (err) {
        console.error("Failed to fetch user detail:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (res.ok) navigate("/admin/users");
      else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAdmin = async () => {
    setIsToggling(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminUser.token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData((prev) => ({
          ...prev,
          user: { ...prev.user, isAdmin: result.isAdmin },
        }));
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
      <div className="max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl md:col-span-2" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { user: viewedUser, searchHistory, activityCount, recentActivity } = data;
  const displayName = viewedUser.name || viewedUser.username || "User";
  const isSelf = viewedUser._id === adminUser._id;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/users")}
          className="rounded-xl gap-2 text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-card/40 backdrop-blur-sm border-border/40 h-full">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[3px] shadow-lg shadow-indigo-500/20 mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&size=128&bold=true`}
                  alt="Avatar"
                  className="h-full w-full rounded-full object-cover border-[3px] border-background"
                />
              </div>
              <h2 className="text-lg font-bold tracking-tight">{displayName}</h2>
              <p className="text-sm text-muted-foreground">@{viewedUser.username}</p>

              <div className="mt-3">
                {viewedUser.isAdmin ? (
                  <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-bold">User</Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 w-full mt-6">
                <div className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
                  <p className="text-xl font-bold">{viewedUser.uploadsCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Uploads</p>
                </div>
                <div className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
                  <p className="text-xl font-bold">{viewedUser.favorites?.length || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Favorites</p>
                </div>
                <div className="rounded-xl bg-background/50 border border-border/30 p-3 text-center">
                  <p className="text-xl font-bold">{activityCount || 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Sessions</p>
                </div>
              </div>

              {/* Info fields */}
              <div className="w-full mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Mobile</p>
                    <p className="text-sm font-medium">{viewedUser.mobileNo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/30">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Joined</p>
                    <p className="text-sm font-medium">{formatDate(viewedUser.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full mt-6 space-y-2">
                <Button
                  variant="outline"
                  onClick={handleToggleAdmin}
                  disabled={isSelf || isToggling}
                  className="w-full rounded-xl h-10 gap-2 font-semibold"
                >
                  {viewedUser.isAdmin ? (
                    <><ShieldOff className="h-4 w-4" /> Demote from Admin</>
                  ) : (
                    <><Shield className="h-4 w-4" /> Promote to Admin</>
                  )}
                </Button>

                {showDeleteConfirm ? (
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="flex-1 rounded-xl h-10 font-semibold"
                    >
                      {isDeleting ? "Deleting..." : "Confirm Delete"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-xl h-10 font-semibold"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSelf}
                    className="w-full rounded-xl h-10 gap-2 font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete User
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right column */}
        <div className="md:col-span-2 space-y-6">
          {/* Search History */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-card/40 backdrop-blur-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-500" /> Search History
                  <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0.5">
                    {searchHistory?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchHistory?.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {searchHistory.map((entry) => (
                      <div key={entry._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="h-10 w-10 rounded-lg overflow-hidden border border-border/50 shrink-0 bg-muted">
                          {entry.imageUrl ? (
                            <img src={entry.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{entry.matchesCount || 0} products found</p>
                          <p className="text-[11px] text-muted-foreground">{formatTimeAgo(entry.createdAt)}</p>
                        </div>
                        {entry.matches?.length > 0 && (
                          <div className="flex -space-x-1.5">
                            {entry.matches.slice(0, 3).map((m, i) => (
                              <div key={i} className="h-7 w-7 rounded-md overflow-hidden border border-background">
                                <img src={m.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No search history</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Favorites */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-card/40 backdrop-blur-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" /> Favorites
                  <Badge variant="secondary" className="text-[10px] font-bold px-1.5 py-0.5">
                    {viewedUser.favorites?.length || 0}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {viewedUser.favorites?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1">
                    {viewedUser.favorites.map((fav) => (
                      <a
                        key={fav._id}
                        href={fav.shopLink || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative aspect-square rounded-xl overflow-hidden border border-border/40 hover:border-primary/30 transition-all"
                      >
                        <img
                          src={fav.imageUrl}
                          alt={fav.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                          <p className="text-[9px] text-white font-medium truncate">{fav.name}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No favorites saved</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card/40 backdrop-blur-sm border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ActivityIcon className="h-4 w-4 text-purple-500" /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity?.length > 0 ? (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {recentActivity.map((act) => (
                      <div key={act._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                          act.type === "search" ? "bg-emerald-500/10" : "bg-purple-500/10"
                        }`}>
                          <Search className={`h-3.5 w-3.5 ${act.type === "search" ? "text-emerald-500" : "text-purple-500"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{act.type}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {act.metadata?.matchesCount ? `${act.metadata.matchesCount} matches` : ""}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground/60 font-medium">{formatTimeAgo(act.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No activity recorded</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
