# Arbeitszeit Rechner

![React Native](https://img.shields.io/badge/React%20Native-0.74-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Expo](https://img.shields.io/badge/Expo-Framework-black)
![License](https://img.shields.io/badge/License-MIT-green)

Eine mobile App zur Berechnung von Arbeitszeiten und Überstunden.

---

## Features

- Berechnung der Soll-Endzeit
- Eingabe der tatsächlichen Endzeit
- Überstundenberechnung
- Speicherung von Arbeitstagen
- History mit gespeicherten Einträgen
- Wochenübersicht der Arbeitszeit

---

## Tech Stack

- React Native
- TypeScript
- Expo
- Expo Router
- AsyncStorage
- Custom Hooks
- Komponentenbasierte Architektur

---

## Projektstruktur
app
├─ (tabs)
│   ├─ index.tsx
│   ├─ history.tsx
│   └─ _layout.tsx
│
components
├─ LabeledInput.tsx
└─ ResultCard.tsx

hooks
├─ useWorkCalculator.ts
└─ useWorkEntries.ts

storage
└─ workEntries.ts

utils
├─ time.ts
└─ workCalculator.ts

---


## Installation

```bash
git clone https://github.com/FerasHB/arbeitszeit-rechner.git
```

In den Projektordner wechseln:
```bash
cd arbeitszeit-rechner
npm install
npx expo start
```

---

## Autor

Feras Hababa

GitHub:  
https://github.com/FerasHB

LinkedIn:  
https://www.linkedin.com/in/feras-hababa-a9227b337/

---

## Lizenz

Dieses Projekt dient zu Lern- und Demonstrationszwecken.