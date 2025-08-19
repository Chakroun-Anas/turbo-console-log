# Turbo Console Log - Telemetry & Analytics

## 🔐 Privacy-First Analytics

Turbo Console Log includes **optional** and **anonymous** telemetry to help us understand extension usage patterns and improve the user experience. This document explains exactly what data we collect, why we collect it, and how your privacy is protected.

## 🎛️ User Control

**You are in complete control** of telemetry data:

- **VS Code Global Setting**: Respects your VS Code telemetry preference (`telemetry.telemetryLevel`)
- **Extension-Specific Setting**: `turboConsoleLog.isTurboTelemetryEnabled` (default: `true`)
- **Double Privacy Check**: Data is only sent when BOTH settings allow it
- **Zero Impact**: Telemetry failures never affect extension functionality

## 📊 What Data We Collect

### Fresh Installation Analytics

When you install Turbo Console Log for the first time:

```typescript
{
  developerId: "dev_a1b2c3d4e5f6",     // Anonymous, hashed identifier
  installedAt: "2025-08-18T10:00:00Z", // Installation timestamp
  timezoneOffset: -480,                // Timezone offset (not location)
  extensionVersion: "3.5.0",           // Extension version installed
  vscodeVersion: "1.85.0",             // VS Code version
  platform: "darwin"                   // Operating system (darwin/win32/linux)
}
```

### Extension Update Analytics

When you update to a new version:

```typescript
{
  developerId: "dev_a1b2c3d4e5f6",     // Same anonymous identifier
  updatedAt: "2025-08-18T10:00:00Z",   // Update timestamp
  newVersion: "3.5.0",                 // New version installed
  isPro: false,                        // Pro/Free mode status
  timezoneOffset: -480,                // Timezone offset
  vscodeVersion: "1.85.0",             // VS Code version
  platform: "darwin"                   // Operating system
}
```

## ❌ What We DON'T Collect

We are committed to **data minimization** and **privacy protection**:

- ❌ **No Personal Information**: Names, emails, usernames, or identifiers
- ❌ **No Code Content**: Your source code, file paths, or project details
- ❌ **No Keystrokes**: What you type or keyboard activity
- ❌ **No File Access**: File names, directory structures, or content
- ❌ **No Network Activity**: URLs, API calls, or external connections
- ❌ **No Location Data**: Only timezone offset, never precise location
- ❌ **No Behavioral Tracking**: How you use features or interact with UI

## 🔒 Privacy Protection

### Anonymous User Identification

```typescript
// Developer ID generation (simplified)
const combined = [
  vscode.env.machineId, // VS Code's anonymous machine identifier
  vscode.env.language, // Language preference
  process.platform, // Operating system
  process.arch, // CPU architecture
  'turbo-console-log-stable', // Extension-specific salt
].join('-');

const developerId = `dev_${sha256(combined).substring(0, 16)}`;
```

**Key Properties:**

- **Anonymous**: No way to trace back to individual users
- **Stable**: Same ID across sessions for trend analysis
- **Hashed**: SHA256 encryption with extension-specific salt
- **Limited**: Only 16 characters used from hash for privacy

### Data Transmission Security

- **HTTPS Only**: All data transmitted over encrypted connections
- **Timeout Protection**: 5-second timeout prevents hanging
- **Graceful Failure**: Network issues never break extension
- **No Retry Abuse**: Failed requests don't spam servers

## 🎯 Why We Collect This Data

### 1. **Installation Success Reporting**

- **Purpose**: Understand adoption rates and installation success
- **Benefit**: Helps us prioritize platform support and compatibility
- **Example**: "85% of installations are on macOS, we should test there more"

### 2. **Update Adoption Patterns**

- **Purpose**: See how quickly users adopt new versions
- **Benefit**: Helps us plan release schedules and communication
- **Example**: "Users take 2 weeks on average to update, let's improve notifications"

### 3. **Platform Distribution**

- **Purpose**: Understand which platforms need most attention
- **Benefit**: Better testing and platform-specific improvements
- **Example**: "Windows users report more issues, let's focus testing there"

### 4. **Pro vs Free Usage**

- **Purpose**: Understand feature adoption and business metrics
- **Benefit**: Helps us balance free and pro features appropriately
- **Example**: "20% of users use Pro features, let's expand the free tier"

### 5. **Version Compatibility**

- **Purpose**: See which VS Code versions are most common
- **Benefit**: Helps us maintain compatibility and drop legacy support
- **Example**: "95% of users have VS Code 1.80+, we can use newer APIs"

## 🛡️ Technical Implementation

### Error Handling

```typescript
try {
  await sendAnalytics(data);
  console.log('Analytics sent successfully');
} catch (error) {
  // Silently fail - never break extension functionality
  console.warn('Analytics failed:', error);
}
```

### Privacy Compliance

```typescript
private canSendTelemetry(): boolean {
  const vscodeTelemetryEnabled = vscode.env.isTelemetryEnabled ?? true;
  const customTelemetryEnabled = this.config.get('isTurboTelemetryEnabled', true);

  return vscodeTelemetryEnabled && customTelemetryEnabled;
}
```

## 📋 Data Retention & Management

- **Retention Period**: Analytics data is retained for 2 years maximum
- **Aggregation**: Data is aggregated for trend analysis, not individual tracking
- **No Cross-Reference**: Cannot be linked to other services or accounts
- **Open Source**: This entire implementation is open source and auditable

## 🔧 How to Disable Telemetry

### Option 1: VS Code Global Setting

```json
{
  "telemetry.telemetryLevel": "off"
}
```

### Option 2: Extension-Specific Setting

```json
{
  "turboConsoleLog.isTurboTelemetryEnabled": false
}
```

### Option 3: VS Code Settings UI

1. Open VS Code Settings (`Cmd/Ctrl + ,`)
2. Search for "turbo telemetry"
3. Uncheck "Turbo Telemetry Enabled"

## 📞 Questions or Concerns?

If you have any questions about our telemetry practices:

- **GitHub Issues**: [Create an issue](https://github.com/Chakroun-Anas/turbo-console-log/issues)
- **Code Review**: [View telemetry source code](./telemetryService.ts)
- **Privacy Policy**: All practices documented in this README

## 🤝 Transparency Commitment

We believe in **radical transparency** for telemetry:

- ✅ **Open Source**: All telemetry code is publicly auditable
- ✅ **Clear Documentation**: Exactly what we collect and why
- ✅ **User Control**: Easy to disable with multiple options
- ✅ **No Surprises**: No hidden data collection or changes without notice
- ✅ **Data Minimization**: Only collect what's necessary for improvement

---

_Last Updated: August 18, 2025_  
_Turbo Console Log v3.5.0_
