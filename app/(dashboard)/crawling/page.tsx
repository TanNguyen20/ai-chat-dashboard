"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Play, Square, Users, Clock, User, Phone, MapPin, GraduationCap, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BASE_URL } from "@/const/api";

type CrawlState = "idle" | "running" | "completed" | "error";

interface CrawledUser {
  mssv: string;
  ho_ten?: string;
  gioi_tinh?: string;
  ngay_vao_truong?: string;
  lop_hoc?: string;
  co_so?: string;
  bac_dao_tao?: string;
  loai_hinh_dao_tao?: string;
  khoa?: string;
  nganh?: string;
  chuyen_nganh?: string;
  khoa_hoc?: string;
  noi_cap?: string;
  ngay_sinh?: string;
  so_cmnd?: string;
  doi_tuong?: string;
  ngay_vao_doan?: string;
  dien_thoai?: string;
  dia_chi_lien_he?: string;
  noi_sinh?: string;
  ho_khau_thuong_tru?: string;
  email_dnc?: string;
  mat_khau_email_dnc?: string;
  ma_ho_so?: string;
  timestamp: string;
  status: string;
}

interface CrawlingStatus {
  status: CrawlState;
  currentUserId?: number;
  totalUsers?: number;
  processedUsers?: number;
  message?: string;
}

export default function CrawlingPage() {
  const [formData, setFormData] = useState({
    url: "",
    username: "",
    password: "",
    startUserId: "",
    endUserId: "",
  });

  const [crawlingStatus, setCrawlingStatus] = useState<CrawlingStatus>({ status: "idle" });
  const [crawledUsers, setCrawledUsers] = useState<CrawledUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    !!formData.url && !!formData.username && !!formData.password && !!formData.startUserId && !!formData.endUserId;

  const isRunning = crawlingStatus.status === "running";

  const startCrawling = async () => {
    if (!isFormValid || isRunning) return;

    setError(null);
    setCrawledUsers([]);
    setCrawlingStatus({ status: "running", processedUsers: 0 });

    try {
      const res = await fetch(`${BASE_URL.CRAWL_SERVICE}/api/start-crawling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const msg = payload?.detail || payload?.message || `Backend error (HTTP ${res.status})`;
        throw new Error(msg);
      }

      // Kick off SSE stream
      startSSE();
    } catch (e: any) {
      setError(e?.message || "Failed to reach backend");
      setCrawlingStatus({ status: "error" });
    }
  };

  const startSSE = () => {
    // Close old connection
    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource(`${BASE_URL.CRAWL_SERVICE}/api/crawling-events`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "user_crawled") {
          const u = data.user as Partial<CrawledUser>;
          setCrawledUsers((prev) => [
            ...prev,
            {
              ...u,
              mssv: String(u.mssv || ""),
              timestamp: new Date().toLocaleTimeString(),
              status: String(u.status || "success"),
            } as CrawledUser,
          ]);

          setCrawlingStatus((prev) => ({
            ...prev,
            currentUserId: u.mssv ? Number.parseInt(String(u.mssv)) : prev.currentUserId,
            processedUsers: (prev.processedUsers || 0) + 1,
          }));
        }

        if (data.type === "status") {
          setCrawlingStatus((prev) => ({
            ...prev,
            totalUsers: data.totalUsers ?? prev.totalUsers,
            message: data.message ?? prev.message,
          }));
        }

        if (data.type === "completed") {
          setCrawlingStatus({
            status: "completed",
            totalUsers: data.totalUsers,
            processedUsers: data.processedUsers,
            message: data.message,
          });
          es.close();
          eventSourceRef.current = null;
        }

        if (data.type === "error") {
          setError(data.message || "Unknown error");
          setCrawlingStatus({ status: "error" });
          es.close();
          eventSourceRef.current = null;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      setError("Lost connection to server");
      setCrawlingStatus({ status: "error" });
      es.close();
      eventSourceRef.current = null;
    };
  };

  const stopCrawling = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setCrawlingStatus({ status: "idle" });
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  return (
    <div className="bg-background">
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Web Crawling Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure and monitor your web crawling operations in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Configuration Panel */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Crawling Configuration</CardTitle>
              <CardDescription className="text-sm">Set up your crawling parameters and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">Target URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) => handleInputChange("url", e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startUserId" className="text-sm font-medium">Start User ID</Label>
                  <Input
                    id="startUserId"
                    type="number"
                    placeholder="250000"
                    value={formData.startUserId}
                    onChange={(e) => handleInputChange("startUserId", e.target.value)}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endUserId" className="text-sm font-medium">End User ID</Label>
                  <Input
                    id="endUserId"
                    type="number"
                    placeholder="260000"
                    value={formData.endUserId}
                    onChange={(e) => handleInputChange("endUserId", e.target.value)}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button onClick={startCrawling} disabled={!isFormValid || isRunning} className="flex-1 min-h-[44px]">
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? "Running..." : "Start Crawling"}
                </Button>

                {isRunning && (
                  <Button onClick={stopCrawling} variant="outline" className="flex-1 min-h-[44px] bg-transparent">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Panel */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="w-5 h-5" />
                Crawling Status
              </CardTitle>
              <CardDescription className="text-sm">Real-time progress and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge
                    variant={
                      crawlingStatus.status === "running"
                        ? "default"
                        : crawlingStatus.status === "completed"
                        ? "secondary"
                        : crawlingStatus.status === "error"
                        ? "destructive"
                        : "outline"
                    }
                    className="text-xs"
                  >
                    {crawlingStatus.status.charAt(0).toUpperCase() + crawlingStatus.status.slice(1)}
                  </Badge>
                </div>

                {typeof crawlingStatus.currentUserId === "number" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current User ID:</span>
                    <span className="text-sm font-mono">{crawlingStatus.currentUserId}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Processed:</span>
                  <span className="text-sm font-mono">{crawlingStatus.processedUsers ?? 0} users</span>
                </div>

                {typeof crawlingStatus.totalUsers === "number" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total:</span>
                    <span className="text-sm font-mono">{crawlingStatus.totalUsers} users</span>
                  </div>
                )}

                {crawlingStatus.message && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm break-words">{crawlingStatus.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crawled Users List */}
        {crawledUsers.length > 0 && (
          <Card className="mt-4 sm:mt-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5" />
                Crawled Users ({crawledUsers.length})
              </CardTitle>
              <CardDescription className="text-sm">Real-time feed of successfully crawled student data</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <ScrollArea className="h-80 sm:h-96 lg:h-[500px]">
                <div className="space-y-4">
                  {crawledUsers.map((user, index) => (
                    <div key={`${user.mssv}-${index}`}>
                      <Card className="border-l-4 border-l-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="font-semibold text-base">{user.ho_ten || "Unknown Name"}</span>
                              <Badge variant="outline" className="text-xs">
                                {user.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">{user.timestamp}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Student ID:</span>
                            <span className="font-mono text-sm font-medium">{user.mssv}</span>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Personal Information */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-primary flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Personal Info
                              </h4>
                              <div className="space-y-1 text-xs">
                                {user.gioi_tinh && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Gender:</span>
                                    <span>{user.gioi_tinh}</span>
                                  </div>
                                )}
                                {user.ngay_sinh && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Birth Date:</span>
                                    <span>{user.ngay_sinh}</span>
                                  </div>
                                )}
                                {user.so_cmnd && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID Number:</span>
                                    <span className="font-mono">{user.so_cmnd}</span>
                                  </div>
                                )}
                                {user.noi_sinh && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Place of Birth:</span>
                                    <span>{user.noi_sinh}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Academic Information */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-primary flex items-center gap-1">
                                <GraduationCap className="w-3 h-3" />
                                Academic Info
                              </h4>
                              <div className="space-y-1 text-xs">
                                {user.khoa && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Faculty:</span>
                                    <span>{user.khoa}</span>
                                  </div>
                                )}
                                {user.nganh && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Major:</span>
                                    <span>{user.nganh}</span>
                                  </div>
                                )}
                                {user.chuyen_nganh && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Specialization:</span>
                                    <span>{user.chuyen_nganh}</span>
                                  </div>
                                )}
                                {user.lop_hoc && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Class:</span>
                                    <span>{user.lop_hoc}</span>
                                  </div>
                                )}
                                {user.khoa_hoc && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Academic Year:</span>
                                    <span>{user.khoa_hoc}</span>
                                  </div>
                                )}
                                {user.bac_dao_tao && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Education Level:</span>
                                    <span>{user.bac_dao_tao}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contact & Other Information */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm text-primary flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Contact Info
                              </h4>
                              <div className="space-y-1 text-xs">
                                {user.dien_thoai && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Phone:</span>
                                    <span className="font-mono">{user.dien_thoai}</span>
                                  </div>
                                )}
                                {user.email_dnc && (
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email:</span>
                                    <span className="font-mono text-xs break-all">{user.email_dnc}</span>
                                  </div>
                                )}
                                {user.dia_chi_lien_he && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">Contact Address:</span>
                                    <span className="text-xs break-words">{user.dia_chi_lien_he}</span>
                                  </div>
                                )}
                                {user.ho_khau_thuong_tru && (
                                  <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground">Permanent Address:</span>
                                    <span className="text-xs break-words">{user.ho_khau_thuong_tru}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Additional Information Row */}
                          <div className="mt-4 pt-3 border-t border-border/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                              {user.co_so && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Campus:</span>
                                  <span>{user.co_so}</span>
                                </div>
                              )}
                              {user.ngay_vao_truong && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">Entry Date:</span>
                                  <span>{user.ngay_vao_truong}</span>
                                </div>
                              )}
                              {user.ma_ho_so && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Profile Code:</span>
                                  <span className="font-mono">{user.ma_ho_so}</span>
                                </div>
                              )}
                              {user.doi_tuong && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">Target Group:</span>
                                  <span>{user.doi_tuong}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      {index < crawledUsers.length - 1 && <Separator className="my-3" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
