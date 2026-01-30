/**
 * WebConvert+ Unit Converter
 */

class UnitConverter {
    constructor() {
        this.targetSystem = 'metric'; // 'metric', 'imperial', or 'auto' (based on locale)

        // Simple conversion factors (to Metric)
        // We convert everything to metric first, then to target if needed
        this.conversions = {
            // Length
            'mi': { to: 'km', factor: 1.60934 },
            'mile': { to: 'km', factor: 1.60934 },
            'miles': { to: 'km', factor: 1.60934 },
            'ft': { to: 'm', factor: 0.3048 },
            'foot': { to: 'm', factor: 0.3048 },
            'feet': { to: 'm', factor: 0.3048 },
            'in': { to: 'cm', factor: 2.54 },
            'inch': { to: 'cm', factor: 2.54 },
            'inches': { to: 'cm', factor: 2.54 },
            'yd': { to: 'm', factor: 0.9144 },
            'yard': { to: 'm', factor: 0.9144 },
            'yards': { to: 'm', factor: 0.9144 },

            // Weight
            'lb': { to: 'kg', factor: 0.453592 },
            'lbs': { to: 'kg', factor: 0.453592 },
            'pound': { to: 'kg', factor: 0.453592 },
            'pounds': { to: 'kg', factor: 0.453592 },
            'oz': { to: 'g', factor: 28.3495 },
            'ounce': { to: 'g', factor: 28.3495 },
            'ounces': { to: 'g', factor: 28.3495 },

            // Temp
            '°F': { to: '°C', func: (f) => (f - 32) * 5 / 9 },
            'F': { to: '°C', func: (f) => (f - 32) * 5 / 9 },

            // Speed
            'mph': { to: 'km/h', factor: 1.60934 },
        };

        // Reverse conversions (Metric to Imperial)
        this.reverseConversions = {
            'km': { to: 'mi', factor: 0.621371 },
            'm': { to: 'ft', factor: 3.28084 },
            'cm': { to: 'in', factor: 0.393701 },
            'kg': { to: 'lb', factor: 2.20462 },
            'g': { to: 'oz', factor: 0.035274 },
            '°C': { to: '°F', func: (c) => (c * 9 / 5) + 32 },
            'km/h': { to: 'mph', factor: 0.621371 },
        };

        this.regex = /(\d+(\.\d+)?)\s?(mi|mile|miles|ft|foot|feet|in|inch|inches|yd|yard|yards|lb|lbs|pound|pounds|oz|ounce|ounces|°F|F|mph|km|m|cm|kg|g|°C|km\/h)\b/gi;

        this.init();
    }

    async init() {
        const settings = await Utils.storage.get(['unitSystem']);
        if (settings.unitSystem) {
            this.targetSystem = settings.unitSystem;
        }
    }

    process(text, node) {
        if (!text) return text;

        return text.replace(this.regex, (match, value, decimals, unit) => {
            let val = parseFloat(value);
            let unitLower = unit.toLowerCase();

            // Determine if we need to convert
            // If target is metric, and unit is imperial -> convert
            // If target is imperial, and unit is metric -> convert

            let isImperialUnit = ['mi', 'mile', 'miles', 'ft', 'foot', 'feet', 'in', 'inch', 'inches', 'yd', 'yard', 'yards', 'lb', 'lbs', 'pound', 'pounds', 'oz', 'ounce', 'ounces', '°f', 'f', 'mph'].includes(unitLower);

            if (this.targetSystem === 'metric' && isImperialUnit) {
                // Convert to Metric
                let conv = this.conversions[unit] || this.conversions[unitLower]; // Try exact match then lower
                // Handle case sensitivity for F/C? usually case insensitive for units except maybe m vs M (milli vs Mega) but here we are simple.
                if (!conv) conv = this.conversions[Object.keys(this.conversions).find(k => k.toLowerCase() === unitLower)];

                if (conv) {
                    let newVal = conv.func ? conv.func(val) : val * conv.factor;
                    return `${newVal.toFixed(1)} ${conv.to} (${match})`;
                }
            } else if (this.targetSystem === 'imperial' && !isImperialUnit) {
                // Convert to Imperial
                let conv = this.reverseConversions[unit] || this.reverseConversions[unitLower];
                if (!conv) conv = this.reverseConversions[Object.keys(this.reverseConversions).find(k => k.toLowerCase() === unitLower)];

                if (conv) {
                    let newVal = conv.func ? conv.func(val) : val * conv.factor;
                    return `${newVal.toFixed(1)} ${conv.to} (${match})`;
                }
            }

            return match;
        });
    }
}

window.UnitConverter = new UnitConverter();
