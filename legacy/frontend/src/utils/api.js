const OFFLINE_QUEUE_KEY = 'offline-mutation-queue';

/**
 * Enhanced fetch wrapper for offline support
 */
export const api = {
    /**
     * GET request - relies on Service Worker caching for offline view
     */
    get: async (url, options = {}) => {
        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API GET Error:', error);
            throw error;
        }
    },

    /**
     * POST request - queues if offline
     */
    post: async (url, data, options = {}) => {
        return handleMutation('POST', url, data, options);
    },

    /**
     * PUT request - queues if offline
     */
    put: async (url, data, options = {}) => {
        return handleMutation('PUT', url, data, options);
    },

    /**
     * DELETE request - queues if offline
     */
    delete: async (url, options = {}) => {
        return handleMutation('DELETE', url, null, options);
    }
};

/**
 * Handle data mutations with offline queuing
 */
async function handleMutation(method, url, data, options = {}) {
    // Check network status
    if (!navigator.onLine) {
        console.log(`[Offline] Queuing ${method} request to ${url}`);

        // Add to queue
        const queue = getQueue();
        const requestItem = {
            id: uuidv4(), // Use uuid or simpler ID
            timestamp: Date.now(),
            method,
            url,
            data,
            headers: options.headers || { 'Content-Type': 'application/json' }
        };

        queue.push(requestItem);
        saveQueue(queue); // Using localStorage as per "browser storage" request

        // Return a mock success for optimistic UI
        return {
            offline: true,
            message: 'Request queued for sync',
            id: requestItem.id,
            ...data
        };
    }

    // Online: perform normal request
    try {
        const fetchOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: data ? JSON.stringify(data) : undefined,
            ...options
        };

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Return JSON if content-type is json, else text or null
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }
        return { success: true };
    } catch (error) {
        console.error(`API ${method} Error:`, error);
        throw error;
    }
}

// Queue Helpers
export function getQueue() {
    try {
        const item = localStorage.getItem(OFFLINE_QUEUE_KEY);
        return item ? JSON.parse(item) : [];
    } catch (e) {
        return [];
    }
}

export function saveQueue(queue) {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
}

// Simple UUID generator if uuid library isn't available
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
