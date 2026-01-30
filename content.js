/**
 * WebConvert+ Content Script
 * Entry point for the extension on web pages.
 */

// Listen for messages from popup/background - MUST BE REGISTERED EARLY
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "toggle") {
        if (request.value) {
            MutationEngine.start();
        } else {
            MutationEngine.stop();
        }
        sendResponse({ success: true });
    } else if (request.action === "contextMenu") {
        handleContextMenu(request, sendResponse);
        return true; // Keep channel open for async response
    }
});

async function handleContextMenu(request, sendResponse) {
    Utils.log('Context menu action:', request.command, request.selectionText);

    try {
        if (request.command === 'wcp-convert-currency') {
            // Re-scan the page with currency converter
            if (window.CurrencyConverter) {
                MutationEngine.scan(document.body);
                Utils.log('Currency conversion triggered via context menu');
            }
            sendResponse({ success: true });
        } else if (request.command === 'wcp-convert-unit') {
            // Re-scan the page with unit converter
            if (window.UnitConverter) {
                MutationEngine.scan(document.body);
                Utils.log('Unit conversion triggered via context menu');
            }
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, message: 'Unknown command' });
        }
    } catch (error) {
        Utils.error('Error handling context menu:', error);
        sendResponse({ success: false, message: error.message });
    }
}

// Initialize
(async () => {
    Utils.log('Content script loaded');

    // Load settings
    const settings = await Utils.storage.get(null); // Get all settings

    // Register converters to MutationEngine
    if (window.CurrencyConverter) {
        MutationEngine.registerConverter(window.CurrencyConverter);
    }
    if (window.UnitConverter) {
        MutationEngine.registerConverter(window.UnitConverter);
    }
    if (window.DateTimeConverter) {
        MutationEngine.registerConverter(window.DateTimeConverter);
    }

    // Give converters a moment to initialize (they init in constructors)
    await new Promise(resolve => setTimeout(resolve, 500));

    Utils.log('Converters registered, starting MutationEngine');

    // Start Engine if enabled (default to true)
    if (settings.enabled !== false) {
        MutationEngine.start();
    }
})();
