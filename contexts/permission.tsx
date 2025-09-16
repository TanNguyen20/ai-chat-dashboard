"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { PageAccessService } from "@/services/pageAccess";
import type { PageAccess } from "@/types/pageAccess";
import { useAuth } from "@/components/auth-provider";
import Loading from "@/components/loading";

// ---- Types ----
type Crud = { create: boolean; read: boolean; update: boolean; delete: boolean };
type RolePermissionsMap = Record<string, Crud>;

interface RoleObj {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: string | null;
}
type RolesInput = string[] | RoleObj[];

interface PermissionContextType {
  /** Effective permissions for the CURRENT route (exact match); null while computing */
  permissions: Crud | null;
  /** Check a specific action on the CURRENT route */
  has: (action: keyof Crud) => boolean;

  /** Get effective CRUD for ANY exact URL using BE rules + user roles */
  getPermissionsFor: (url: string) => Crud | null;
  /** Convenience: can the user read a given exact URL? */
  canRead: (url: string) => boolean;

  /** Re-fetch the BE page access list */
  refresh: () => Promise<void>;
  /** True while checking/redirecting */
  isChecking: boolean;
}

// ---- Context ----
const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

// Public routes that should bypass permission checks
const PUBLIC_PATHS = new Set<string>([
  "/login",
  "/register",
  "/error/forbidden",
  "/error/not-found",
  "/error/unauthorized",
  "/error/service-unavailable",
  "/error/internal-server-error",
  "/error/default",
]);

// ---- Helpers ----
const normalizePath = (p?: string) => {
  if (!p) return "/";
  const noHash = p.split("#")[0];
  const noQuery = noHash.split("?")[0];
  // remove trailing slash (except for root)
  return noQuery !== "/" && noQuery.endsWith("/") ? noQuery.slice(0, -1) : noQuery;
};

// EXACT match only
const findExactPage = (all: PageAccess[] | null, p: string): PageAccess | undefined => {
  if (!all) return undefined;
  const path = normalizePath(p);
  return all.find((pg) => normalizePath(pg.url) === path);
};

const aggregatePermissions = (roles: string[], rp?: RolePermissionsMap): Crud | null => {
  if (!rp) return null;
  return roles.reduce<Crud>(
    (acc, role) => {
      const perm = rp[role];
      if (perm) {
        acc.create ||= !!perm.create;
        acc.read ||= !!perm.read;
        acc.update ||= !!perm.update;
        acc.delete ||= !!perm.delete;
      }
      return acc;
    },
    { create: false, read: false, update: false, delete: false }
  );
};

// ---- Provider ----
export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const path = useMemo(() => normalizePath(pathname), [pathname]);

  const { user, isLoading: isAuthLoading } = useAuth();

  const [pages, setPages] = useState<PageAccess[] | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [loadError, setLoadError] = useState(false); // remember fetch errors (fail closed)

  const loadPages = async () => {
    try {
      const res = await PageAccessService.list();
      setPages(res);
      setLoadError(false);
    } catch (e) {
      console.error("Failed to fetch page access list", e);
      setPages([]);       // fail closed
      setLoadError(true); // mark error so unknown paths go to /error/forbidden
    }
  };

  // Fetch when auth resolved or user changes
  useEffect(() => {
    if (isAuthLoading) return;
    (async () => {
      await loadPages();
    })();
  }, [isAuthLoading, user?.id]);

  // Extract role names from either string[] or { name: string }[]
  const roleNames: string[] = useMemo(() => {
    const roles = user?.roles as RolesInput | undefined;
    if (!roles) return [];
    if (Array.isArray(roles) && roles.length > 0) {
      if (typeof (roles as any)[0] === "string") return roles as string[];
      return (roles as RoleObj[]).map((r) => r.name).filter(Boolean);
    }
    return [];
  }, [user?.roles]);

  const currentPage = useMemo(() => findExactPage(pages, path), [pages, path]);

  const permissions = useMemo(() => {
    return aggregatePermissions(
      roleNames,
      currentPage?.rolePermissions as RolePermissionsMap | undefined
    );
  }, [roleNames, currentPage]);

  // Helpers to check ANY URL (exact match)
  const getPermissionsFor = useCallback(
    (url: string): Crud | null => {
      const page = findExactPage(pages, url);
      return aggregatePermissions(
        roleNames,
        page?.rolePermissions as RolePermissionsMap | undefined
      );
    },
    [pages, roleNames]
  );

  const canRead = useCallback(
    (url: string) => Boolean(getPermissionsFor(url)?.read),
    [getPermissionsFor]
  );

  // Guard: redirect when notfound/forbidden (exact match required)
  useEffect(() => {
    if (isAuthLoading) return;

    // begin check (helps avoid flicker on route changes)
    setIsChecking(true);

    // Let the auth layer handle unauthenticated users (redirect to /login, etc.)
    if (!user) {
      setIsChecking(false);
      return;
    }

    // Never guard public paths
    if (PUBLIC_PATHS.has(path)) {
      setIsChecking(false);
      return;
    }

    // Wait for access list to load
    if (!pages) return;

    const pageIsKnown = Boolean(currentPage);
    const canReadCurrent = Boolean(permissions?.read);

    if (!pageIsKnown) {
      alert("debug log pageIsKnown");
      // If the list fetch failed, fail closed to /error/forbidden; otherwise /error/notfound
      router.replace(loadError ? "/error/forbidden" : "/error/not-found");
      setIsChecking(false);
      return;
    }

    if (!canReadCurrent) {
      alert("debug log canReadCurrent");
      router.replace("/error/forbidden");
      setIsChecking(false);
      return;
    }

    // allowed
    setIsChecking(false);
  }, [
    isAuthLoading,
    user,
    pages,
    path,
    currentPage,
    permissions?.read,
    router,
    loadError,
  ]);

  const ctx = useMemo<PermissionContextType>(
    () => ({
      permissions,
      has: (action) => Boolean(permissions?.[action]),
      getPermissionsFor,
      canRead,
      refresh: loadPages,
      isChecking,
    }),
    [permissions, getPermissionsFor, canRead, isChecking]
  );

  // --- Show loading while auth is still resolving ---
  if (isAuthLoading) {
    return <Loading />;
  }

  // --- Show loading while permission check is running to avoid flicker ---
  if (isChecking) {
    return <Loading />;
  }

  return <PermissionContext.Provider value={ctx}>{children}</PermissionContext.Provider>;
}

// ---- Hook ----
export function usePermission() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error("usePermission must be used within a PermissionProvider");
  return ctx;
}
