"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Play,
  Square,
  Clock,
  User,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BASE_URL } from "@/const/api";

type CrawlState = "idle" | "running" | "completed" | "error" | "canceled";

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
  status: "success" | "no_info";
}

interface CrawlingStatus {
  status: CrawlState;
  runId?: string;
  effectiveStart?: number;
  end?: number;
  maxConcurrent?: number;
  currentUserId?: number;
  totalUsers?: number;
  processedUsers?: number;
  successUsers?: number;
  skippedUsers?: number;
  failedUsers?: number; // counts "no_info"
  message?: string;
  lastProcessed?: string | number | null;
}

type StreamMsg =
  | { type: "started"; run_id: string; start: number; end: number; max_concurrent: number }
  | { type: "student"; mssv: string; data: Record<string, any>; no_info?: boolean; status?: string; reason?: string }
  | { type: "progress"; student_id: number; status: "skipped" | "failed" | "canceled" | string; reason?: string }
  | { type: "warning"; message?: string }
  | { type: "completed"; run_id: string; last_processed?: string | number | null }
  | { type: "canceled"; run_id?: string; message?: string }
  | { type: "error"; message?: string }
  | Record<string, any>;

export default function CrawlingPage() {
  const [formData, setFormData] = useState({
    loginUrl: "",
    studentInfoUrl: "",
    startUserId: "",
    endUserId: "260000",
    maxConcurrent: "1",
  });

  const [crawlingStatus, setCrawlingStatus] = useState<CrawlingStatus>({ status: "idle" });
  const [crawledUsers, setCrawledUsers] = useState<CrawledUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid =
    !!formData.loginUrl && !!formData.studentInfoUrl && !!formData.startUserId && !!formData.endUserId;

  const isRunning = crawlingStatus.status === "running";

  const buildStreamUrl = () => {
    const start = Number.parseInt(formData.startUserId, 10);
    const end = Number.parseInt(formData.endUserId, 10);
    const maxC = Math.max(1, Math.min(10, Number.parseInt(formData.maxConcurrent || "1", 10) || 1));

    const params = new URLSearchParams({
      start: String(start),
      end: String(end),
      login_url: formData.loginUrl.trim(),
      info_url: formData.studentInfoUrl.trim(),
      max_concurrent: String(maxC),
    });

    return `${BASE_URL.CRAWL_SERVICE}/scrape/stream?${params.toString()}`;
  };

  const startCrawling = async () => {
    if (!isFormValid || isRunning) return;

    setError(null);
    setCrawledUsers([]);
    setCrawlingStatus({
      status: "running",
      processedUsers: 0,
      successUsers: 0,
      skippedUsers: 0,
      failedUsers: 0, // will count "no_info"
      message: "Starting…",
    });

    startSSE(buildStreamUrl());
  };

  const startSSE = (url: string) => {
    if (eventSourceRef.current) eventSourceRef.current.close();

    const es = new EventSource(url, { withCredentials: false });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: StreamMsg = JSON.parse(event.data);

        switch (data.type) {
          case "started": {
            const { run_id, start, end, max_concurrent } = data as Extract<StreamMsg, { type: "started" }>;
            setCrawlingStatus({
              status: "running",
              runId: run_id,
              effectiveStart: start,
              end,
              maxConcurrent: max_concurrent,
              totalUsers: Math.max(0, end - start),
              processedUsers: 0,
              successUsers: 0,
              skippedUsers: 0,
              failedUsers: 0,
              message: `Running (start=${start}, end=${end}, concurrency=${max_concurrent})`,
            });
            break;
          }

          case "student": {
            const msg = data as Extract<StreamMsg, { type: "student" }>;
            const u = (msg.data && Object.keys(msg.data).length > 0 ? msg.data : (msg as any)) as Partial<CrawledUser>;
            const mssv = String(msg.mssv || u.mssv || "");
            const isNoInfo = !!msg.no_info || msg.status === "no_info";
            const status: CrawledUser["status"] = isNoInfo ? "no_info" : "success";

            setCrawledUsers((prev) => [
              ...prev,
              {
                ...u,
                mssv,
                timestamp: new Date().toLocaleTimeString(),
                status,
              } as CrawledUser,
            ]);

            setCrawlingStatus((prev) => {
              const processed = (prev.processedUsers || 0) + 1;
              const success = (prev.successUsers || 0) + (status === "success" ? 1 : 0);
              const failed = (prev.failedUsers || 0) + (status === "no_info" ? 1 : 0);
              return {
                ...prev,
                currentUserId: Number.parseInt(mssv || "0", 10) || prev.currentUserId,
                processedUsers: processed,
                successUsers: success,
                failedUsers: failed,
                lastProcessed: mssv,
                message:
                  status === "success"
                    ? `Processed ${processed} • Success ${success}`
                    : `Processed ${processed} • No info ${failed}`,
              };
            });
            break;
          }

          case "progress": {
            // Only for skipped/canceled telemetry
            const { student_id, status, reason } = data as Extract<StreamMsg, { type: "progress" }>;
            setCrawlingStatus((prev) => {
              const processed = (prev.processedUsers || 0) + 1;
              let skipped = prev.skippedUsers || 0;
              if (status === "skipped") skipped += 1;

              const msg =
                status === "skipped"
                  ? `Skipped ${student_id}`
                  : status === "canceled"
                  ? `Canceled ${student_id}`
                  : `Checked ${student_id} (${status}${reason ? `, ${reason}` : ""})`;

              return {
                ...prev,
                processedUsers: processed,
                skippedUsers: skipped,
                currentUserId: Number.isFinite(student_id) ? student_id : prev.currentUserId,
                lastProcessed: Number.isFinite(student_id) ? student_id : prev.lastProcessed,
                message: msg,
              };
            });
            break;
          }

          case "warning": {
            setError(String((data as any).message || "Warning"));
            break;
          }

          case "canceled": {
            setCrawlingStatus((prev) => ({
              ...prev,
              status: "canceled",
              message: (data as any).message || "Canceled",
            }));
            es.close();
            eventSourceRef.current = null;
            break;
          }

          case "completed": {
            setCrawlingStatus((prev) => ({
              ...prev,
              status: "completed",
              message: `Completed. Last processed: ${(data as any).last_processed ?? "n/a"}`,
            }));
            es.close();
            eventSourceRef.current = null;
            break;
          }

          case "error": {
            setError((data as any).message || "Unknown error");
            setCrawlingStatus({ status: "error", message: "Stream error" });
            es.close();
            eventSourceRef.current = null;
            break;
          }

          default:
            // Ignore unknown event types
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    };

    es.onerror = () => {
      setError("Lost connection to server");
      setCrawlingStatus((prev) => ({ ...prev, status: "error" }));
      es.close();
      eventSourceRef.current = null;
    };
  };

  const stopCrawling = async () => {
    const runId = crawlingStatus.runId;
    if (runId) {
      try {
        const res = await fetch(`${BASE_URL.CRAWL_SERVICE}/cancel?run_id=${encodeURIComponent(runId)}`, {
          method: "POST",
        });
        if (!res.ok) {
          console.warn("Cancel request failed", await res.text());
        }
      } catch (e) {
        console.warn("Cancel request error", e as any);
      }
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setCrawlingStatus((prev) => ({ ...prev, status: "idle", message: "Stopped" }));
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
  }, []);

  // Derived progress
  const progress = useMemo(() => {
    const total = crawlingStatus.totalUsers || 0;
    const processed = crawlingStatus.processedUsers || 0;
    return total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;
  }, [crawlingStatus.totalUsers, crawlingStatus.processedUsers]);

  return (
    <div className="bg-background">
      <div className="flex flex-1 flex-col gap-4 p-3 sm:p-4">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Web Crawling Dashboard</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Configure and monitor your web crawling operations in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Configuration Panel */}
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Crawling Configuration</CardTitle>
              <CardDescription className="text-sm">Set up your crawling parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Login URL */}
              <div className="space-y-2">
                <Label htmlFor="loginUrl" className="text-sm font-medium">
                  Login URL
                </Label>
                <Input
                  id="loginUrl"
                  placeholder="https://example.com/sinh-vien-dang-nhap.html"
                  value={formData.loginUrl}
                  onChange={(e) => handleInputChange("loginUrl", e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              {/* Student Info URL */}
              <div className="space-y-2">
                <Label htmlFor="studentInfoUrl" className="text-sm font-medium">
                  Student Info URL
                </Label>
                <Input
                  id="studentInfoUrl"
                  placeholder="https://example.com/thong-tin-sinh-vien.html"
                  value={formData.studentInfoUrl}
                  onChange={(e) => handleInputChange("studentInfoUrl", e.target.value)}
                  disabled={isRunning}
                  className="w-full"
                />
              </div>

              {/* Start / End User IDs + Concurrency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startUserId" className="text-sm font-medium">
                    Start User ID
                  </Label>
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
                  <Label htmlFor="endUserId" className="text-sm font-medium">
                    End User ID
                  </Label>
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
                <div className="space-y-2">
                  <Label htmlFor="maxConcurrent" className="text-sm font-medium">
                    Concurrency (1–10)
                  </Label>
                  <Input
                    id="maxConcurrent"
                    type="number"
                    placeholder="1"
                    value={formData.maxConcurrent}
                    onChange={(e) => handleInputChange("maxConcurrent", e.target.value)}
                    disabled={isRunning}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Counters + Progress */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="outline">Run ID: {crawlingStatus.runId ?? "-"}</Badge>
                <Badge variant="secondary">
                  Processed: {crawlingStatus.processedUsers ?? 0}/{crawlingStatus.totalUsers ?? 0}
                </Badge>
                <Badge variant="outline">Success: {crawlingStatus.successUsers ?? 0}</Badge>
                <Badge variant="outline">Skipped: {crawlingStatus.skippedUsers ?? 0}</Badge>
                <Badge variant="outline">Failed / No info: {crawlingStatus.failedUsers ?? 0}</Badge>
              </div>
              {crawlingStatus.totalUsers ? (
                <div className="w-full h-2 rounded bg-muted overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              ) : null}

              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Runtime status line */}
              <div className="text-xs text-muted-foreground">
                {crawlingStatus.message ? crawlingStatus.message : "Idle"}
              </div>

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
          {crawledUsers.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="w-5 h-5" />
                  Crawled Users ({crawledUsers.length})
                </CardTitle>
                <CardDescription className="text-sm">
                  Real-time feed of crawled student data (success &amp; no-info)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <ScrollArea className="h-80 sm:h-96 lg:h-[500px]">
                  <div className="space-y-4">
                    {crawledUsers.map((user, index) => {
                      const isNoInfo = user.status === "no_info";
                      return (
                        <div key={`${user.mssv}-${index}`}>
                          <Card
                            className={
                              "border-l-4 " +
                              (isNoInfo ? "border-l-destructive/30" : "border-l-primary/20")
                            }
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                  <User className={"w-4 h-4 " + (isNoInfo ? "text-destructive" : "text-primary")} />
                                  <span className="font-semibold text-base">
                                    {user.ho_ten || "Unknown Name"}
                                  </span>
                                  <Badge variant={isNoInfo ? "destructive" : "outline"} className="text-xs">
                                    {isNoInfo ? "no_info" : "success"}
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
                              {/* If no_info, show a tiny hint line */}
                              {isNoInfo && (
                                <div className="text-xs text-muted-foreground mb-3">
                                  No data available for this student (max retries / timeout / invalid data).
                                </div>
                              )}

                              {!isNoInfo && (
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
                              )}
                              {/* If no_info, we intentionally don't render field grids */}
                            </CardContent>
                          </Card>
                          {index < crawledUsers.length - 1 && <Separator className="my-3" />}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
