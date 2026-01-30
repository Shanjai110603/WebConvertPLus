/**
 * WebConvert+ Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const toggleExtension = document.getElementById('toggleExtension');
    const toggleCurrency = document.getElementById('toggleCurrency');
    const toggleUnits = document.getElementById('toggleUnits');
    const toggleDate = document.getElementById('toggleDate');
    const optionsBtn = document.getElementById('optionsBtn');
    const statusDiv = document.getElementById('status');

    // Load Settings
    const settings = await Utils.storage.get([
        'enabled',
        'enableCurrency',
        'enableUnits',
        'enableDate'
    ]);

    // Set initial state
    toggleExtension.checked = settings.enabled !== false;
    toggleCurrency.checked = settings.enableCurrency !== false;
    toggleUnits.checked = settings.enableUnits !== false;
    toggleDate.checked = settings.enableDate !== false;

    // Event Listeners
    toggleExtension.addEventListener('change', () => {
        saveSetting('enabled', toggleExtension.checked);
        sendMessageToContent({ action: 'toggle', value: toggleExtension.checked });
    });

    toggleCurrency.addEventListener('change', () => saveSetting('enableCurrency', toggleCurrency.checked));
    toggleUnits.addEventListener('change', () => saveSetting('enableUnits', toggleUnits.checked));
    toggleDate.addEventListener('change', () => saveSetting('enableDate', toggleDate.checked));

    optionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });

    // Helper: Save a setting
    async function saveSetting(key, value) {
        await Utils.storage.set({ [key]: value });
        statusDiv.textContent = 'Saved!';
        setTimeout(() => statusDiv.textContent = 'Ready', 1000);
    }

    // Helper: Send message to content script
    function sendMessageToContent(message) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, message);
            }
        });
    }
});
