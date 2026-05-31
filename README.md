# Tribal Tripe MVP

Tribal Tripe is a web application for discovering African cultural heritage. It helps users explore museums, heritage sites, cultural stories, artifacts, and curated routes across several African countries.

This project is an MVP, which means Minimum Viable Product. It is the first usable version of the product, built to test the idea, collect feedback, and improve the experience with the team.

The app runs fully in the browser for now. There is no backend or database yet. The content is stored inside the project files, and saved favorites are stored only in the user's browser.

## What You Can Do In The App

- Discover museums, monuments, heritage sites, and cultural centers.
- Explore African countries through heritage-focused cards.
- Read short cultural stories with key points and timelines.
- View a starter gallery of cultural artifacts.
- Search across places, stories, and artifacts.
- Save favorite items locally in the browser.
- Switch between light mode and dark mode.
- Open a place location in Google Maps.

## Who This README Is For

This guide is written for every team member, including people who are not developers.

If you only want to test the app on your computer, follow the sections below in this order:

1. Install the required tools.
2. Clone the project.
3. Install the project dependencies.
4. Start the app.
5. Open the local link in your browser.

## Required Tools

Before running the project, install these tools on your machine:

- Git: used to download the project from GitHub.
- Node.js: used to run the app locally.
- npm: installed automatically with Node.js.

Recommended Node.js version:

```text
Node.js >= 20.19.0 or >= 22.12.0
```

To check if the tools are already installed, open a terminal and run:

```bash
git --version
node --version
npm --version
```

If one of these commands is not recognized, install the missing tool before continuing.

## Clone The Project

Open a terminal, choose the folder where you want to keep the project, then run one of the commands below.

Use HTTPS if you are not sure which option to choose:

```bash
git clone https://github.com/Shegitu/TribeTrip.git
cd TribeTrip
```

Use SSH only if your GitHub SSH key is already configured:

```bash
git clone git@github.com:Shegitu/TribeTrip.git
cd TribeTrip
```

After `cd TribeTrip`, your terminal should be inside the project folder.

## Install The Project

Run this command once after cloning the project:

```bash
npm ci
```

This downloads all packages needed by the app. It can take a few minutes depending on your internet connection.

If `npm ci` fails, try:

```bash
npm install
```

## Start The App Locally

Run:

```bash
npm run dev
```

After the command starts, the terminal will show a local URL. It usually looks like this:

```text
http://localhost:5173/
```

Open that link in your browser.

If port `5173` is already busy, Vite may show another port, for example `http://localhost:5174/`. Use the URL shown in your terminal.

## How To Test The App Locally

After opening the local URL in your browser, check these basic flows:

- The home page loads correctly.
- The navigation works between Home, Discover, Stories, Search, and Saved.
- You can open a heritage place detail page.
- You can search for a place, story, or artifact.
- You can save an item as a favorite.
- The saved item appears in the Saved screen.
- The light/dark theme switch works.
- The Google Maps direction button opens a map link.

Favorites and theme preferences are saved only in your browser. They are not shared with other users.

## Useful Commands

```bash
npm run dev      # Start the app for local testing
npm run build    # Create the production build in the dist/ folder
npm run preview  # Test the production build locally
npm run lint     # Check the code for common issues
```

For normal local testing, most team members only need:

```bash
npm run dev
```

## Project Structure

```text
.
|-- public/                 # Public images, logos, favicon, and static assets
|-- src/
|   |-- App.jsx             # Main application screens and behavior
|   |-- App.css             # Main application styles
|   |-- index.css           # Global styles
|   |-- main.jsx            # React entry point
|   `-- data/content.js     # Countries, places, stories, artifacts, and categories
|-- index.html              # Main HTML file used by Vite
|-- package.json            # Project commands and dependencies
|-- package-lock.json       # Exact installed dependency versions
`-- vite.config.js          # Vite configuration
```

## Where The Content Lives

Most app content is in:

```text
src/data/content.js
```

This file contains:

- `countries`: countries shown in the app.
- `categories`: content categories.
- `locations`: museums, heritage sites, and cultural centers.
- `stories`: cultural stories and timelines.
- `artifacts`: cultural objects shown in the gallery.

To add or update content, edit the matching list in `src/data/content.js` and follow the existing examples.

## Where The Images Live

Local images and logos are in:

```text
public/
```

Important assets include:

- `public/hero-grand-bassam.jpg`
- `public/logo-light.jpeg`
- `public/logo-dark.jpeg`
- `public/logo-mark-light.png`
- `public/logo-mark-dark.png`

Some content images are loaded from external URLs inside `src/data/content.js`.

## Environment Variables

No environment variables are required to run this MVP locally.

## Before Sharing Code Changes

Developers should run these commands before pushing changes or opening a pull request:

```bash
npm run lint
npm run build
```

This checks that the code has no common lint errors and that the production build still works.

## Common Problems

- `git` is not recognized: install Git and reopen your terminal.
- `node` or `npm` is not recognized: install Node.js and reopen your terminal.
- `npm ci` fails: check that your Node.js version is compatible.
- The app does not open on `5173`: use the exact URL shown in the terminal.
- Favorites or theme look stuck: clear the browser local storage for the local site.
- An image does not load: check if the image path in `public/` or the external URL in `src/data/content.js` is correct.
