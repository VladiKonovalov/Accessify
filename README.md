# Accessify - Accessibility Tool

A simple, powerful accessibility tool that makes any website more accessible for users with disabilities. Meets WCAG 2.1 AA standards.

## 🚀 Quick Start

### 1. Download Files
- `accessify-integration.html` - Full integration template
- `accessify-minimal.html` - Lightweight version
- `dist/accessify.min.js` - Main library

### 2. Add to Your Website

**Include the library:**
```html
<script src="path/to/accessify.min.js"></script>
```

**Copy the code:**
1. **CSS** - Copy styles from `accessify-integration.html`
2. **HTML** - Copy the accessibility controls HTML
3. **JavaScript** - Copy the initialization and control functions

### 3. That's It!
The accessibility tool will automatically appear on your website with a ♿ button in the top-right corner.

## 🎯 Features

- **Text Size Control** - Adjust font size (0.5x to 3x)
- **Contrast Modes** - Normal, High, Inverted, Grayscale
- **Theme Options** - Default, Dark, Light, Colorblind-friendly
- **Language Support** - English, Hebrew (RTL), Arabic (RTL), Spanish, French, German
- **Accessibility Testing** - Built-in WCAG 2.1 AA compliance testing
- **Mobile Responsive** - Works on all devices

## 📱 How It Works

1. **Click the ♿ button** to open accessibility controls
2. **Adjust settings** using the sliders and dropdowns
3. **Changes apply instantly** to your website
4. **Run tests** to check accessibility compliance
5. **Reset** to restore default settings

## 🔧 Customization

**Change button position:**
```css
.accessify-toggle {
    top: 20px;    /* Distance from top */
    right: 20px;  /* Distance from right */
}
```

**Change colors:**
```css
.accessify-toggle {
    background: #007AFF;  /* Button color */
}
```

**Add more languages:**
```javascript
const accessifyTranslations = {
    en: { title: "Accessibility Controls" },
    he: { title: "בקרות נגישות" },
    // Add your language here
};
```

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies
- Works with any HTML/CSS/JavaScript website

## 🎨 Examples

**Basic Implementation:**
```html
<!DOCTYPE html>
<html>
<head>
    <script src="accessify.min.js"></script>
    <style>
        /* Copy Accessify CSS here */
    </style>
</head>
<body>
    <h1>My Website</h1>
    <p>Content goes here...</p>
    
    <!-- Copy Accessify HTML here -->
    
    <script>
        /* Copy Accessify JavaScript here */
    </script>
</body>
</html>
```

## ✅ Compliance

- **WCAG 2.1 AA** - Full compliance
- **Israeli Standard 5568** - Supported
- **Section 508** - Compatible
- **EN 301 549** - Supported

## 🆘 Support

- **Documentation**: See `INTEGRATION_GUIDE.md` for detailed instructions
- **Examples**: Check `example.html` for a working demo
- **Issues**: Report problems in the project repository

## 📄 License

MIT License - Use freely in your projects.

---

**Make your website accessible in minutes, not hours!** 🎯
