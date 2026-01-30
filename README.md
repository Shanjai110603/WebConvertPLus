# WebConvert+ 💱

> **Premium Chrome Extension for Automatic Currency, Unit, and Date/Time Conversion**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Shanjai110603/WebConvertPLus)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome](https://img.shields.io/badge/chrome-extension-orange.svg)](https://chrome.google.com/webstore)

---

## ✨ Features

### 💱 Smart Currency Converter
- **Automatic Detection**: Instantly converts prices on any webpage to your local currency
- **160+ Currencies**: Support for all major world currencies
- **Daily Updates**: Fresh exchange rates fetched automatically via Frankfurter API
- **Custom Rates**: Override with your own exchange rates if needed
- **Privacy Mode**: Block all external API calls for complete offline operation

### 📏 Universal Unit Converter
- **Metric ↔ Imperial**: Seamless conversion between measurement systems
- **6 Categories**:
  - 📍 Distance (km, miles, meters, feet)
  - ⚖️ Weight (kg, lbs, grams, ounces)
  - 🌡️ Temperature (°C, °F)
  - 🏎️ Speed (km/h, mph)
  - 🧴 Volume (liters, gallons)
  - 📐 Area (m², ft²)

### 🕒 Date & Time Localizer
- **Timezone Conversion**: Automatically converts to your local timezone
- **Format Adaptation**: Switches between date formats (MM/DD/YYYY ↔ DD/MM/YYYY)
- **Locale-Aware**: Respects your system preferences

---

## 🎨 Premium UI

**Glassmorphic Dark Theme** with:
- 🌌 Deep gradient backgrounds
- ✨ Translucent blur effects
- 🎭 Smooth animations
- 🎯 Intuitive grid layouts

---

## 🚀 Installation

### From Source (Developer Mode)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Shanjai110603/WebConvertPLus.git
   cd WebConvertPLus
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions`
   - Enable **Developer mode** (top right toggle)
   - Click **Load unpacked**
   - Select the cloned folder

3. **Start Converting!** 🎉

### From Chrome Web Store
*Coming Soon*

---

## 📖 Usage

### Automatic Mode
Just browse any website! WebConvert+ automatically detects and converts:
- Prices and currency symbols
- Measurements and units
- Dates and timestamps

### Popup Controls
Click the extension icon to:
- Toggle specific modules (Currency, Units, Date)
- Enable/disable the extension for current site
- Access settings

### Context Menu
1. Select text on any page
2. Right-click → **WebConvert+**
3. Choose **Convert Currency** or **Convert Unit**

### Settings Page
Right-click extension icon → **Options** to configure:
- 💰 Target currency
- 📏 Preferred unit system (Metric/Imperial)
- 📅 Date format
- 🌐 Timezone
- 🔒 Privacy mode
- 📊 Custom exchange rates

---

## 🔒 Privacy

**Privacy-First Design:**
- ✅ All conversions happen **client-side** in your browser
- ✅ No tracking or analytics
- ✅ No data sent to third-party servers (except optional rate fetching)
- ✅ **Privacy Mode** available to block ALL external calls
- ✅ Open source and transparent

**External API Usage:**
- Only uses [Frankfurter API](https://www.frankfurter.app/) for daily exchange rates
- Can be completely disabled via Privacy Mode

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Design**: Custom glassmorphic CSS (no frameworks)
- **Chrome APIs**: Storage, Context Menus, Alarms, Scripting
- **External API**: Frankfurter (exchange rates only)

---

## 📁 Project Structure

```
WebConvert+/
├── manifest.json           # Extension configuration
├── background.js          # Service worker
├── content.js             # Main content script
├── popup/                 # Popup interface
├── options/               # Settings page
├── modules/               # Core conversion logic
│   ├── currencyConverter.js
│   ├── unitConverter.js
│   ├── dateTimeConverter.js
│   ├── mutationEngine.js
│   └── utils.js
└── assets/                # Static resources
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Exchange rates provided by [Frankfurter API](https://www.frankfurter.app/)
- Icons from [Lucide Icons](https://lucide.dev/)
- Inspired by modern web design principles

---

## 📞 Support

- 🐛 **Bug Reports**: [Open an issue](https://github.com/Shanjai110603/WebConvertPLus/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/Shanjai110603/WebConvertPLus/discussions)
- ⭐ **Star this repo** if you find it useful!

---

<div align="center">
  <strong>Made with ❤️ for the global web community</strong>
  <br>
  <sub>Convert the world, one webpage at a time 🌍</sub>
</div>
