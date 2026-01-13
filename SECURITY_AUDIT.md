# 🛡️ Security Audit Report
**Date:** 2026-01-13
**Project:** Gheychee LightVersion
**Auditor:** Antigravity Agent

## Executive Summary
The application is generally secure for a "Lite" version, leveraging standard libraries (`telegraf`, `youtube-dl-exec`) that handle common input sanitization. The primary security risk is the **Container Privilege (Running as Root)**, which could expose the hosting environment if a vulnerability is exploited.

---

## 🚨 Critical Findings

### 1. Root User Execution (High Risk)
**Issue:** The `Dockerfile` does not specify a USER, meaning the application runs as `root` inside the container.
**Impact:** If an attacker exploits a vulnerability in Node.js or `yt-dlp`, they gain root access to the container filesystem, making it easier to attack the host or lateral networks.
**Recommendation:** Create a non-root user in Docker and switch to it.

```dockerfile
# Example Fix
USER node
```

---

## ⚠️ Major Findings

### 2. Denial of Service (DoS) via Large Files (Medium Risk)
**Issue:** There is no explicit timeout configured for `yt-dlp`.
**Impact:** A malicious user could send a link to a 10-hour 4K video. The bot would try to download it, consuming all memory/CPU on Cloud Run, causing the instance to crash or rack up costs.
**Recommendation:** Add a `timeout` flag to the `youtubedl` call in `mediaProvider.js`.

### 3. Secrets Management (Medium Risk)
**Issue:** `BOT_TOKEN` is passed as a plain Environment Variable.
**Impact:** Anyone with "Viewer" access to the Google Cloud Project see the token in the Cloud Run Console.
**Recommendation:** For Enterprise use, use **Google Secret Manager**. For this project, Env Vars are "Acceptable Risk".

---

## ✅ Safe Controls
-   **Command Injection**: The bot uses `youtube-dl-exec` which properly escapes shell arguments, preventing attacks like `http://twitter.com; rm -rf /`.
-   **URL Validation**: The `src/utils/validator.js` enforces strict protocol (`http/https`) and domain whitelisting (Twitter/Instagram).
-   **Dependencies**: The codebase relies on well-maintained packages.

## Next Steps
1.  **[Optional]** switch to non-root user in Dockerfile.
2.  **[Recommended]** Add download timeout (e.g., 30 seconds).
