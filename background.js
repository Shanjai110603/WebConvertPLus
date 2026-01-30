/**
 * WebConvert+ Background Script
 * Handles context menus, installation events, and automatic rate updates.
 */

// ==================== AUTOMATIC EXCHANGE RATE UPDATES ====================

/**
 * Fetch latest exchange rates from API
 */
async function fetchExchangeRates() {
    try {
        console.log('[WebConvert+] Fetching latest exchange rates...');

        // Check privacy mode first
        const settings = await chrome.storage.local.get(['privacyMode']);
        if (settings.privacyMode) {
            console.log('[WebConvert+] Privacy mode enabled, skipping rate fetch');
            return;
        }

        // Fetch from frankfurter.app (free, no API key needed)
        const response = await fetch('https://api.frankfurter.app/latest?from=USD');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Add USD as base rate (frankfurter doesn't include it)
        const rates = {
            USD: 1,
            ...data.rates
        };

        // Store rates with timestamp
        await chrome.storage.local.set({
            exchangeRates: rates,
            exchangeRatesDate: data.date,
            exchangeRatesLastFetch: Date.now()
        });

        console.log('[WebConvert+] Exchange rates updated successfully:', data.date);
        console.log('[WebConvert+] Fetched rates for', Object.keys(rates).length, 'currencies');

    } catch (error) {
        console.error('[WebConvert+] Failed to fetch exchange rates:', error);
        // Don't overwrite existing rates on failure
    }
}

/**
 * Check if rates need updating (older than 24 hours)
 */
async function checkAndUpdateRates() {
    const settings = await chrome.storage.local.get(['exchangeRatesLastFetch', 'privacyMode']);

    if (settings.privacyMode) {
        console.log('[WebConvert+] Privacy mode enabled, skipping rate update check');
        return;
    }

    const lastFetch = settings.exchangeRatesLastFetch || 0;
    const now = Date.now();
    const hoursSinceLastFetch = (now - lastFetch) / (1000 * 60 * 60);

    if (hoursSinceLastFetch >= 24 || lastFetch === 0) {
        console.log('[WebConvert+] Rates are stale (', Math.round(hoursSinceLastFetch), 'hours old), fetching fresh rates');
        await fetchExchangeRates();
    } else {
        console.log('[WebConvert+] Rates are fresh (', Math.round(hoursSinceLastFetch), 'hours old)');
    }
}

// ==================== CONTEXT MENUS ====================

// Create Context Menus
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "wcp-root",
        title: "WebConvert+",
        contexts: ["selection", "page"]
    });

    chrome.contextMenus.create({
        parentId: "wcp-root",
        id: "wcp-convert-currency",
        title: "Convert Currency",
        contexts: ["selection"]
    });

    chrome.contextMenus.create({
        parentId: "atp-root",
        id: "atp-convert-unit",
        title: "Convert Unit",
        contexts: ["selection"]
    });

    // Open options page on install
    chrome.runtime.openOptionsPage();

    // Fetch initial rates
    console.log('[WebConvert+] Extension installed, fetching initial exchange rates');
    checkAndUpdateRates();

    // Create daily alarm for automatic updates
    chrome.alarms.create('dailyRateUpdate', {
        delayInMinutes: 1, // First check after 1 minute
        periodInMinutes: 24 * 60 // Then every 24 hours
    });
    console.log('[WebConvert+] Daily rate update alarm created');
});

// Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId.startsWith("wcp-")) {
        chrome.tabs.sendMessage(tab.id, {
            action: "contextMenu",
            command: info.menuItemId,
            selectionText: info.selectionText
        });
    }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "openOptions") {
        chrome.runtime.openOptionsPage();
    } else if (request.action === "fetchRates") {
        // Allow manual rate fetch from options page
        fetchExchangeRates().then(() => {
            sendResponse({ success: true });
        }).catch(error => {
            sendResponse({ success: false, error: error.message });
        });
        return true; // Keep channel open for async response
    }
});

// ==================== ALARMS ====================

// Handle alarm for daily rate updates
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyRateUpdate') {
        console.log('[WebConvert+] Daily rate update alarm triggered');
        checkAndUpdateRates();
    }
});

// Check rates on startup (when browser opens)
chrome.runtime.onStartup.addListener(() => {
    console.log('[WebConvert+] Browser started, checking exchange rates');
    checkAndUpdateRates();
});
