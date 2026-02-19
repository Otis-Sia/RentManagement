# Offline & Sync Capabilities

The Rent Management System now supports full offline capability with automatic synchronization and **full-site downloading**.

## New "Download Everything" Feature

The system now automatically downloads **ALL** critical data and application pages as soon as:
1.  The application is installed/opened for the first time.
2.  The device reconnects to the network.

This means you don't have to visit every page to make it available offline. The entire app is proactively cached.

## Features

1.  **Full Site Download (New)**
    -   **What it does:** Downloads all Houses, Tenants, Payments, Maintenance records, and Reports in the background.
    -   **When it happens:** On app launch and on network reconnection.
    -   **Indication:** You will see a notification "Downloading latest data..." when this happens.

2.  **Offline Viewing (Read)**
    -   All data viewed or *downloaded in the background* is cached.
    -   You can open any page offline, even if you haven't visited it before (as long as the background download completed).

3.  **Offline Actions (Write)**
    -   Add/Edit Houses offline.
    -   Changes saved to "Offline Queue".

4.  **Auto-Sync on Reconnect**
    -   Uploads your offline changes.
    -   **Downloads the latest full dataset** from the server to ensure your offline cache is fresh.

## Implementation Details

-   **`service-worker.js`**: 
    -   Now listens for `CACHE_ALL_DATA` message.
    -   Fetches `/api/houses/`, `/api/tenants/`, etc., and caches them.
    -   Pre-caches SPA routes (`/houses`, `/tenants`, etc.) on install.
-   **`src/pwa-utils.js`**: 
    -   Triggers `CACHE_ALL_DATA` on `initPWA()` and `online` event.

## How to Test

1.  **Fresh Start**: Open the app online.
2.  **Watch Console/Notification**: You should see "Downloading latest data...".
3.  **Wait**: Wait a few seconds for the download to complete.
4.  **Go Offline**: Turn off WiFi.
5.  **Navigate**: Go to a page you *haven't* visited yet in this session (e.g., Reports).
6.  **Verify**: The page and its data should load from the cache!

## Deploy

Run `./start_system.sh` to build the latest version and start the system.
