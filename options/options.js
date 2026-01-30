/**
 * WebConvert+ Options Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Elements
    const targetCurrencySelect = document.getElementById('targetCurrency');
    const privacyModeCheck = document.getElementById('privacyMode');
    const unitSystemSelect = document.getElementById('unitSystem');
    const dateFormatSelect = document.getElementById('dateFormat');
    const timezoneSelect = document.getElementById('timezone');
    const customRatesJson = document.getElementById('customRatesJson');
    const fetchRatesBtn = document.getElementById('fetchRatesBtn');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const saveStatus = document.getElementById('saveStatus');
    const ratesStatus = document.getElementById('ratesStatus');

    // Load Data
    const ratesUrl = chrome.runtime.getURL('assets/rates_default.json');

    const ratesRes = await fetch(ratesUrl);
    const ratesData = await ratesRes.json();
    const currencyCodes = Object.keys(ratesData.rates);

    // Populate Selects
    for (const code of currencyCodes) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = code;
        targetCurrencySelect.appendChild(option);
    }



    // Populate Timezones
    const timezones = Intl.supportedValuesOf('timeZone');
    for (const tz of timezones) {
        const option = document.createElement('option');
        option.value = tz;
        option.textContent = tz;
        timezoneSelect.appendChild(option);
    }
    // Set default timezone
    timezoneSelect.value = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // Load Settings
    const settings = await Utils.storage.get([
        'targetCurrency',
        'privacyMode',
        'unitSystem',
        'dateFormat',
        'timezone',
        'customRates'
    ]);

    targetCurrencySelect.value = settings.targetCurrency || 'USD';
    privacyModeCheck.checked = settings.privacyMode || false;
    unitSystemSelect.value = settings.unitSystem || 'metric';
    dateFormatSelect.value = settings.dateFormat || 'medium';
    timezoneSelect.value = settings.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (settings.customRates) customRatesJson.value = JSON.stringify(settings.customRates, null, 2);

    // Event Listeners
    saveBtn.addEventListener('click', async () => {
        let customRates = null;
        try {
            if (customRatesJson.value.trim()) {
                customRates = JSON.parse(customRatesJson.value);

                // Validate structure
                if (customRates && typeof customRates === 'object' && !Array.isArray(customRates)) {
                    // Check if values are valid numbers
                    for (const [key, val] of Object.entries(customRates)) {
                        if (typeof val !== 'number' || val <= 0 || isNaN(val)) {
                            throw new Error(`Invalid rate for ${key}: must be a positive number`);
                        }
                    }
                } else {
                    throw new Error('Custom rates must be a JSON object with currency codes as keys');
                }
            }
        } catch (e) {
            alert('Invalid JSON in Custom Rates:\n' + e.message);
            return;
        }

        await Utils.storage.set({
            targetCurrency: targetCurrencySelect.value,
            privacyMode: privacyModeCheck.checked,
            unitSystem: unitSystemSelect.value,
            dateFormat: dateFormatSelect.value,
            timezone: timezoneSelect.value,
            customRates: customRates
        });

        saveStatus.classList.add('visible');
        setTimeout(() => saveStatus.classList.remove('visible'), 2000);
    });

    resetBtn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to reset all settings?')) {
            await Utils.storage.remove([
                'targetCurrency',
                'privacyMode',
                'unitSystem',
                'dateFormat',
                'timezone',
                'customRates'
            ]);
            location.reload();
        }
    });

    // Display current rate information
    const updateRateInfo = async () => {
        const rateSettings = await Utils.storage.get(['exchangeRatesLastFetch', 'exchangeRatesDate']);
        if (rateSettings.exchangeRatesLastFetch) {
            const hoursAgo = Math.round((Date.now() - rateSettings.exchangeRatesLastFetch) / (1000 * 60 * 60));
            ratesStatus.textContent = `Last updated: ${rateSettings.exchangeRatesDate || 'Unknown date'} (${hoursAgo} hours ago)`;
            ratesStatus.style.color = hoursAgo < 24 ? '#27ae60' : '#e67e22';
        } else {
            ratesStatus.textContent = 'No automatic rates fetched yet';
            ratesStatus.style.color = '#95a5a6';
        }
    };

    // Show current rate info on load
    updateRateInfo();

    fetchRatesBtn.addEventListener('click', async () => {
        if (privacyModeCheck.checked) {
            alert('Cannot fetch rates while Privacy Mode is enabled.');
            return;
        }

        ratesStatus.textContent = 'Fetching...';
        ratesStatus.style.color = '#3498db';

        try {
            // Send message to background script to fetch rates
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({ action: 'fetchRates' }, resolve);
            });

            if (response && response.success) {
                // Update rate info display
                await updateRateInfo();
                ratesStatus.textContent = 'Rates fetched successfully! They will be used automatically.';
                ratesStatus.style.color = '#27ae60';

                // Clear custom rates textarea since fresh rates will be used
                customRatesJson.value = '';
            } else {
                throw new Error(response?.error || 'Unknown error');
            }
        } catch (e) {
            ratesStatus.textContent = 'Error fetching rates: ' + e.message;
            ratesStatus.style.color = '#e74c3c';
            console.error(e);
        }
    });
});
