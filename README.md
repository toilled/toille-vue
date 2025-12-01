# Starfield Dart

A complete rewrite of the Starfield site using Dart.

## Prerequisites

- [Dart SDK](https://dart.dev/get-dart) (Version 3.10.0 or later)

## Project Structure

- `web/`: Contains the source code and static assets.
  - `main.dart`: The main entry point for the Dart application.
  - `index.html`: The HTML entry point.
  - `styles.css`: The stylesheet.

## Setup

1.  **Install Dependencies:**
    ```bash
    dart pub get
    ```

## Build

To compile the Dart code to JavaScript for production:

```bash
dart compile js -O2 -o web/main.dart.js web/main.dart
# OR
make build
# OR
npm run build
```

## Run

To serve the site locally:

```bash
python3 -m http.server 3000 --directory web
# OR
make serve
# OR
npm run serve
```

Then open `http://localhost:3000` in your browser.
