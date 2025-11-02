"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveUserInfoIntoLocalStorage } from "@/utils/commons";

export default function OAuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash || "";
    const params = new URLSearchParams(hash.startsWith("#") ? hash.substring(1) : hash);
    const token = params.get("access_token");

    if (token) {
      saveUserInfoIntoLocalStorage({ token });

      // Clean URL fragment
      const cleanUrl = window.location.href.split("#")[0];
      window.history.replaceState(null, "", cleanUrl);

      // Notify the AuthProvider in this tab
      window.dispatchEvent(new Event("auth-updated"));
    }

    // Redirect to home (or a "post-login" page)
    router.replace("/");
  }, [router]);

  return null;
}
