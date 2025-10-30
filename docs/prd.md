# Synapse — Product Requirements Document

Version: 1.0  
Author: Gemini (as Assistant to Developer)  
Date: October 7, 2025  
Project (Working): Synapse

---

## Table of Contents

1. [Introduction and Goals](#introduction-and-goals)
2. [Target Audience & User Stories](#target-audience--user-stories)
3. [Core Feature Requirements](#core-feature-requirements)
4. [AI & Innovation Feature Requirements](#ai--innovation-feature-requirements)
5. [Technical & Ethical Constraints](#technical--ethical-constraints)
6. [Appendix](#appendix)

---

## 1. Introduction and Goals

### 1.1 Project Overview
Synapse is a Chrome Extension that helps students, developers, and remote workers maximize focus and improve time management by converting browsing activity into actionable, personalized behavioral insights using an on-device AI (Gemini Nano).

### 1.2 Problem Statement
Most time trackers require manual logging or rely on static block lists. Users need a smarter, privacy-preserving tool that understands nuanced behaviors (for example, productive research vs. unproductive scrolling on the same domain) and offers practical suggestions without sending private browsing history to external servers.

### 1.3 Goals & Success Metrics

- Innovation (AI)
  - Goal: Integrate the Gemini Nano Prompt API to analyze local time-series data and generate personalized insights on-device.
  - Success metric (hackathon): Submission for "Best Hybrid AI Application" or "Most Helpful" categories.

- Functionality
  - Goal: Accurately track active time spent on every visited domain.
  - Success metric: Active time tracking within ±5% of manual stopwatch tests during focused sessions.

- UX / Adoption
  - Goal: Provide a frictionless UI for focus sessions and insight review.
  - Success metric: Stable core features (Pomodoro, tracking) demonstrated in product video with clear UI.

## 2. Target Audience & User Stories

### 2.1 Target Audience

- Primary: Students preparing for exams/projects; developers; remote professionals who need uninterrupted work blocks.
- Key pain points: distraction from social media/news; difficulty estimating true active work time; lack of awareness about personal focus patterns.

### 2.2 Core User Stories

| Role | Need | Feature |
|---|---|---|
| Student / Developer | "As a student, I want to define my 'work' websites so the tool can accurately measure my productive time." | Site categorization (Work / Neutral / Unproductive) |
| User | "I need to block out distractions and structure my work time into focused bursts." | Pomodoro clock & Focus Mode |
| User | "I want the tracker to pause when I step away so my time logs are accurate." | Idle detection (active time) |
| User | "I want personalized suggestions without sending my browsing history to a server." | On-device AI insights (Gemini Nano) |

## 3. Core Feature Requirements

### 3.1 Time Tracking Engine (Data Layer)

| ID | Feature | Requirements | Technical APIs |
|---:|---|---|---|
| C1.1 | Active time tracking | Track time (in seconds) per domain. Count time only when the user is actively engaging with the browser. | chrome.tabs, chrome.idle |
| C1.2 | Idle detection | Pause timer when chrome.idle reports 'idle' or 'locked' (60s threshold). Resume on 'active'. | chrome.idle.onStateChanged, chrome.idle.setDetectionInterval |
| C1.3 | Site categorization | Allow users to tag sites as Work, Neutral, or Unproductive. Default to Neutral. | chrome.storage.local |
| C1.4 | Data persistence | Store time logs, site categories, and analysis reports locally (chrome.storage.local). | chrome.storage.local |

### 3.2 Productivity Tools (UX / UI)

| ID | Feature | Requirements | Technical APIs |
|---:|---|---|---|
| C2.1 | Focus Mode / Pomodoro | Customizable timer (e.g., 25m work / 5m break). | JS timers, chrome.notifications |
| C2.2 | Break / session nudges | Use chrome.notifications for unobtrusive reminders. | chrome.notifications |
| C2.3 | Worksite filtering | Soft-block or warn when visiting Unproductive sites during Focus Mode. | chrome.tabs, chrome.notifications |
| C2.4 | Dashboard view | Popup UI showing current site, Pomodoro status, and today's Work vs Unproductive time. | HTML / CSS / JS |

## 4. AI & Innovation Feature Requirements

### 4.1 AI-Powered Behavioral Analysis

| ID | Feature | Requirements | Technical APIs |
|---:|---|---|---|
| A1.1 | History aggregation | Aggregate session time logs into a structured JSON payload for AI analysis at the end of a session. | JS data processing |
| A1.2 | On-device analysis | Use the Gemini Nano Prompt API to process local JSON and return a concise paragraph summarizing focus patterns. | Gemini Nano Prompt API |
| A1.3 | Personalized insights | AI output must provide: (1) the single most time-consuming unproductive site, (2) the least productive time slot, (3) one clear, actionable suggestion. | Gemini Nano Prompt API |

### 4.2 External Integrations (Optional / Stretch Goals)

| ID | Feature | Requirements | Technical APIs |
|---:|---|---|---|
| E1.1 | Spotify integration | Basic music control (play/pause/skip) in the extension UI. Requires external API keys and OAuth (hybrid feature). | Spotify API (external) |

## 5. Technical & Ethical Constraints

### 5.1 Technical Constraints

- Platform: Chrome Extension (Manifest V3).
- AI Model: Core analysis should use the Gemini Nano Prompt API for on-device insights.
- Data security: All sensitive data (browsing history, time logs) must be stored locally (chrome.storage.local) and must not be transmitted externally for core analysis.

### 5.2 Ethical & Privacy Constraints (Critical)

- No medical diagnosis: AI output must avoid language that suggests medical conditions (e.g., ADHD, depression). Keep outputs focused on behaviors and time-management suggestions only.
- Clear disclaimer: Include a visible disclaimer stating insights are behavioral observations for productivity improvement and not medical advice or diagnosis.
- User control: Allow users to view and manually delete all collected local data via extension settings.

---

## Appendix

- Contact / Owner: Product lead (TBD).  
- Glossary:
  - "Active time" — Time spent while the browser/extension detects user activity (keyboard/mouse or active tab focus).
  - "Neutral" — Site not categorized by the user.
  - "Unproductive" — Site marked distracting by the user.
