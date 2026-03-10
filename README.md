# Arbeitszeit Rechner

Eine mobile App zur Berechnung von Arbeitszeiten und Überstunden.

Die App wurde mit **React Native, TypeScript und Expo** entwickelt und speichert Arbeitstage lokal auf dem Gerät.

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

Repository klonen:

---

## Installation

Repository klonen:

git clone https://github.com/FerasHB/arbeitszeit-rechner.git

In den Projektordner wechseln:
cd arbeitszeit-rechner

Abhängigkeiten installieren:
npm install

App starten:
npx expo start

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