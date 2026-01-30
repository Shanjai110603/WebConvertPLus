/**
 * WebConvert+ Currency Converter
 */

class CurrencyConverter {
    constructor() {
        this.rates = {};
        this.symbolMap = {};
        this.targetCurrency = 'INR'; // Default, will be loaded from settings
        this.baseCurrency = 'USD';
        this.initialized = false;

        // Regex to match currency strings
        // Matches: Symbol or Code + optional space + number (with commas/decimals)
        // e.g. $100, $ 100, USD 100, 100 USD, 100.00
        // This is a simplified regex, might need refinement
        this.regex = /([$€£¥₹]|R\$|S\$|A\$|C\$|USD|EUR|GBP|INR|JPY|CAD|AUD|CNY|BRL|SGD)\s?(\d{1,3}(,\d{3})*(\.\d+)?|\d+(\.\d+)?)/gi;

        // Initialize
        this.init();
    }

    async init() {
        // Load rates and symbols
        try {
            const ratesUrl = chrome.runtime.getURL('assets/rates_default.json');
            const symbolsUrl = chrome.runtime.getURL('assets/currencies.json');

            const [ratesRes, symbolsRes] = await Promise.all([
                fetch(ratesUrl),
                fetch(symbolsUrl)
            ]);

            const ratesData = await ratesRes.json();
            const symbolsData = await symbolsRes.json();

            // Load default rates first
            this.rates = ratesData.rates;
            this.baseCurrency = ratesData.base;
            this.symbolMap = symbolsData;

            // Load user settings
            const settings = await Utils.storage.get([
                'targetCurrency',
                'customRates',
                'exchangeRates',
                'exchangeRatesDate',
                'exchangeRatesLastFetch'
            ]);

            if (settings.targetCurrency) {
                this.targetCurrency = settings.targetCurrency;
            }

            // Prefer fresh rates from automatic fetch over default rates
            if (settings.exchangeRates && Object.keys(settings.exchangeRates).length > 0) {
                this.rates = settings.exchangeRates;
                const rateAge = settings.exchangeRatesLastFetch
                    ? Math.round((Date.now() - settings.exchangeRatesLastFetch) / (1000 * 60 * 60))
                    : 'unknown';
                Utils.log('CurrencyConverter: Using fresh exchange rates from', settings.exchangeRatesDate || 'API',
                    `(${rateAge} hours old)`);
            } else {
                Utils.log('CurrencyConverter: Using default exchange rates from', ratesData.date);
            }

            // Custom rates override everything (user's manual input)
            if (settings.customRates && Object.keys(settings.customRates).length > 0) {
                // Merge custom rates (they override auto-fetched or default rates)
                Object.assign(this.rates, settings.customRates);
                Utils.log('CurrencyConverter: Applied', Object.keys(settings.customRates).length, 'custom rates');
            }

            this.initialized = true;
            Utils.log('CurrencyConverter initialized with target:', this.targetCurrency);
            Utils.log('CurrencyConverter: Total rates loaded:', Object.keys(this.rates).length, 'currencies');
        } catch (e) {
            Utils.error('Failed to init CurrencyConverter', e);
        }
    }

    process(text, node) {
        if (!this.initialized) return text;
        if (!text || text.length < 2) return text; // Skip short text

        // Avoid converting if it looks like a date or something else?
        // For now, simple regex replacement

        return text.replace(this.regex, (match, currencyPart, amountPart) => {
            // Determine currency code
            let code = this.symbolMap[currencyPart] || currencyPart.toUpperCase();

            // Clean amount (remove commas)
            let amountStr = amountPart.replace(/,/g, '');
            let amount = parseFloat(amountStr);

            if (isNaN(amount)) return match;

            // Convert
            if (code === this.targetCurrency) return match; // Already in target

            let rateFrom = this.rates[code];
            let rateTo = this.rates[this.targetCurrency];

            if (!rateFrom || !rateTo) return match; // Unknown rate

            // Convert to base (USD) then to target
            let valInBase = amount / rateFrom;
            let valInTarget = valInBase * rateTo;

            // Format
            const formatter = new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: this.targetCurrency,
                maximumFractionDigits: 2
            });

            return `${formatter.format(valInTarget)} (was ${match})`;
        });
    }
}

window.CurrencyConverter = new CurrencyConverter();
