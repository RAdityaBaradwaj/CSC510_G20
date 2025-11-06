# Accessibility Checklist

RouteDash aims to comply with WCAG 2.1 AA requirements across the mobile application and documentation experience. This document tracks the checks performed each semester and captures outstanding work.

## Completed

- **Color contrast:** All primary and secondary brand colors meet 4.5:1 contrast on buttons, text, and form elements (verified with Stark and `react-native-accessibility-engine`).
- **Dynamic type:** Core React Native screens use `Text` components with `allowFontScaling`, allowing users to enlarge fonts via OS settings.
- **Screen-reader labels:** Interactive components (`Pressable`, `TouchableOpacity`, `Button`) include `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint` where applicable. Order status updates broadcast via `AccessibilityInfo.announceForAccessibility`.
- **Keyboard navigation (web preview):** Expo web build tested with `tab` navigation to ensure focus rings and skip-links function.
- **Documentation semantics:** Markdown headings and tables follow hierarchical order; images in README/poster include descriptive alt text.

## In Progress

- **Comprehensive audit:** Scheduled for 2025-11-20 with the NCSU Accessibility Lab. Findings will be logged as issues (`type:accessibility`) and summarized here.
- **High-contrast theme:** Design exploration for alternative theme to support photosensitive epilepsy.
- **Error messaging:** Expand voice-over announcements for form validation on registration and menu-edit flows.

## How to contribute

1. Run Expo app with VoiceOver/TalkBack enabled; capture discrepancies under a GitHub issue tagged `type:accessibility`.
2. For documentation updates, ensure tables include header rows and avoid conveying meaning solely via color.
3. Record findings in the “In Progress” section and link to relevant pull requests.

For questions, contact the accessibility point-of-contact listed in `CONTRIBUTING.md`.
