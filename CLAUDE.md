# Simulateur Balance des Blancs

## Description
Outil interactif pour visualiser l'effet de la balance des blancs sur une image en fonction de la température de couleur (Kelvin) et de la lumière de la scène.

## Stack technique
- Vite + React + TypeScript
- Chakra UI pour les composants
- Déploiement GitHub Pages via GitHub Actions

## Concept pédagogique
La balance des blancs corrige la dominante de couleur causée par différentes sources de lumière :
- **BB = Lumière scène** → Couleurs neutres
- **BB > Lumière scène** → Image plus chaude (orange)
- **BB < Lumière scène** → Image plus froide (bleue)

## Structure
```
src/
  App.tsx      # Composant principal avec simulateur
  main.tsx     # Point d'entrée React
```

## Fonctionnalités
- Scène visuelle illustrative (paysage avec maison, arbre, personnage)
- Sélection de la lumière de la scène (tungstène, fluorescent, soleil, etc.)
- Slider de réglage balance des blancs (2000K - 10000K)
- Préréglages rapides (6 types de lumière)
- Visualisation en temps réel avec filtres CSS
- Échelle Kelvin illustrée
- Explications pédagogiques

## Algorithme
- Conversion Kelvin → RGB basée sur la formule de Tanner Helland
- Application de filtres CSS (sepia, hue-rotate, saturate) pour simuler l'effet

## Commandes
```bash
npm install    # Installer les dépendances
npm run dev    # Serveur de développement
npm run build  # Build production
```

## Déploiement
Push sur `main` → GitHub Actions → GitHub Pages
URL: https://giantjack.github.io/simulateur-balance-blancs_A.P/
