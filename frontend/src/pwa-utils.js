import { getQueue, clearQueue } from './utils/api';

let registration = null;
let isOnline = navigator.onLine;

/**
 * Register the service worker
 */
export async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            registration = await navigator.serviceWorker.register('/service-worker.js', {
                scope: '/'
            });

            console.log('[PWA] Service Worker registered successfully');

            // Check for updates on registration
            registration.addEventListener('updatefound', handleUpdateFound);

            // Check for updates periodically (every 5 minutes)
            setInterval(() => {
                registration.update();
            }, 5 * 60 * 1000);

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', handleSWMessage);

            return registration;
        } catch (error) {
            console.error('[PWA] Service Worker registration failed:', error);
            return null;
        }
    } else {
        console.warn('[PWA] Service Workers not supported');
        return null;
    }
}

/**
 * Handle service worker update found
 */
function handleUpdateFound() {
    const newWorker = registration.installing;
    console.log('[PWA] New service worker found, installing...');

    newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, show update notification
            console.log('[PWA] New version available!');
            showUpdateNotification();
        }
    });
}

/**
 * Handle messages from service worker
 */
function handleSWMessage(event) {
    if (event.data && event.data.type === 'SW_UPDATED') {
        console.log('[PWA] Service worker updated:', event.data.message);
        // Automatically reload to use new version
        window.location.reload();
    }
}

/**
 * Sync offline changes when back online
 */
async function syncOfflineChanges() {
    const queue = getQueue();
    if (queue.length === 0) return;

    console.log(`[PWA] Syncing ${queue.length} offline changes...`);
    showConnectionNotification(`Syncing ${queue.length} offline changes...`, 'info');

    let successCount = 0;
    let failedCount = 0;

    for (const item of queue) {
        try {
            console.log(`[Sync] Processing ${item.method} ${item.url}`);

            // Replay the request
            await fetch(item.url, {
                method: item.method,
                headers: item.headers,
                body: item.data ? JSON.stringify(item.data) : undefined
            });

            successCount++;
        } catch (error) {
            console.error(`[Sync] Failed to sync item ${item.url}:`, error);
            failedCount++;
        }
    }

    if (successCount > 0) {
        clearQueue(); // Clear queue after successful sync
        showConnectionNotification(`Synced ${successCount} changes successfully`, 'success');
        // Refresh page to show updated data
        setTimeout(() => window.location.reload(), 1500);
    } else if (failedCount > 0) {
        showConnectionNotification(`${failedCount} changes failed to sync`, 'warning');
    }
}

/**
 * Show update notification to user
 */
function showUpdateNotification() {
    // Create a subtle notification banner
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #1e40af 0%, #0891b2 100%);
    color: white;
    padding: 12px 20px;
    text-align: center;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
  `;

    banner.innerHTML = `
    <span>🎉 New version available!</span>
    <button id="pwa-update-btn" style="
      background: white;
      color: #1e40af;
      border: none;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
    ">Update Now</button>
    <button id="pwa-dismiss-btn" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    ">Later</button>
  `;

    document.body.appendChild(banner);

    // Update button handler
    document.getElementById('pwa-update-btn').addEventListener('click', () => {
        // Tell service worker to skip waiting
        if (registration && registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        banner.remove();
    });

    // Dismiss button handler
    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
        banner.remove();
    });
}

/**
 * Setup network change listeners for auto-update
 */
export function setupNetworkListeners() {
    // Listen for online event
    window.addEventListener('online', async () => {
        console.log('[PWA] Network reconnected, checking for updates...');
        isOnline = true;

        // Wait a moment for connection to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sync offline changes
        await syncOfflineChanges();

        // Check for service worker updates
        if (registration) {
            try {
                await registration.update();
                console.log('[PWA] Update check completed');
            } catch (error) {
                console.error('[PWA] Update check failed:', error);
            }
        }

        // Show connection restored notification
        showConnectionNotification('Connection restored', 'success');

        // Trigger full site download
        if (registration && registration.active) {
            registration.active.postMessage({ type: 'CACHE_ALL_DATA' });
            showConnectionNotification('Downloading latest data...', 'info');
        } else if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'CACHE_ALL_DATA' });
            showConnectionNotification('Downloading latest data...', 'info');
        }
    });

    // Listen for offline event
    window.addEventListener('offline', () => {
        console.log('[PWA] Network disconnected');
        isOnline = false;
        showConnectionNotification('No internet connection', 'warning');
    });
}

/**
 * Show connection status notification
 */
function showConnectionNotification(message, type) {
    const banner = document.createElement('div');
    banner.className = 'connection-notification';

    const bgColor = type === 'success' ? '#10b981' :
        type === 'info' ? '#3b82f6' : '#f59e0b';

    banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
  `;

    banner.textContent = message;
    document.body.appendChild(banner);

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
    document.head.appendChild(style);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        banner.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => banner.remove(), 300);
    }, 3000);
}

/**
 * Check if app is running as PWA
 */
export function isPWA() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}

/**
 * Get network status
 */
export function getNetworkStatus() {
    return {
        online: isOnline,
        type: navigator.connection?.effectiveType || 'unknown',
        downlink: navigator.connection?.downlink || 'unknown',
        rtt: navigator.connection?.rtt || 'unknown'
    };
}

/**
 * Initialize PWA features
 */
export async function initPWA() {
    console.log('[PWA] Initializing...');

    // Register service worker
    await registerServiceWorker();

    // Setup network listeners
    setupNetworkListeners();

    // Log PWA status
    console.log('[PWA] Running as PWA:', isPWA());

    // Feature: Trigger full site download
    if (registration && registration.active) {
        registration.active.postMessage({ type: 'CACHE_ALL_DATA' });
    } else if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'CACHE_ALL_DATA' });
    }

    return {
        registration,
        isPWA: isPWA(),
        networkStatus: getNetworkStatus()
    };
}
