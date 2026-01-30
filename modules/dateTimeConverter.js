/**
 * WebConvert+ Date & Time Converter
 */

class DateTimeConverter {
    constructor() {
        this.dateFormat = 'medium'; // 'full', 'long', 'medium', 'short'
        this.timeFormat = 'short';
        this.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Regex for various date formats
        // YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, Month DD, YYYY, etc.
        // This is complex to do perfectly with regex alone, but we'll try common patterns.

        // ISO 8601: 2024-05-20, 2024-05-20T12:00:00Z
        this.isoRegex = /\b\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?\b/g;

        // US/EU: 20/05/2024, 05/20/2024 (ambiguous, usually assume US if not clear)
        this.slashRegex = /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g;

        // Text: May 20, 2024; 20 May 2024
        this.textRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s\d{1,2},?\s\d{4}\b|\b\d{1,2}\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s\d{4}\b/gi;

        this.init();
    }

    async init() {
        const settings = await Utils.storage.get(['dateFormat', 'timezone']);
        if (settings.dateFormat) this.dateFormat = settings.dateFormat;
        if (settings.timezone) this.timezone = settings.timezone;
    }

    process(text, node) {
        if (!text || text.length < 8) return text;

        // Helper to format date
        const formatDate = (date) => {
            try {
                return new Intl.DateTimeFormat(undefined, {
                    dateStyle: this.dateFormat,
                    timeStyle: date.getHours() + date.getMinutes() > 0 ? this.timeFormat : undefined,
                    timeZone: this.timezone
                }).format(date);
            } catch (e) {
                return null;
            }
        };

        // Replace ISO
        text = text.replace(this.isoRegex, (match) => {
            const date = new Date(match);
            if (isNaN(date.getTime())) return match;
            const formatted = formatDate(date);
            return formatted ? `${formatted} (was ${match})` : match;
        });

        // Replace Text Dates
        text = text.replace(this.textRegex, (match) => {
            const date = new Date(match);
            if (isNaN(date.getTime())) return match;
            const formatted = formatDate(date);
            return formatted ? `${formatted} (was ${match})` : match;
        });

        return text;
    }
}

window.DateTimeConverter = new DateTimeConverter();
