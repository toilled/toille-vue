# toille-vue

This is a simple Vue.js web application built with Vite and TypeScript. It serves as a personal website and includes a few interactive components.

## Features

*   **Dynamic Pages**: Page content is loaded from a JSON file and rendered dynamically using Vue Router.
*   **Interactive Components**: Includes an alcohol unit checker, a mini-game, and components that fetch data from external APIs.
*   **Styling**: Uses `@picocss/pico` for lightweight and clean styling.

## Project Structure

*   `src/components`: Contains all the Vue components.
*   `src/configs/pages.json`: Defines the pages and their content.
*   `src/interfaces`: Contains TypeScript interfaces.
*   `src/main.ts`: The application's entry point.

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd toille-vue
    ```
3.  **Install dependencies:**
    ```bash
    bun install
    ```

## Available Scripts

*   **`bun run dev`**: Starts the development server.
*   **`bun run build`**: Builds the application for production.
*   **`bun run serve`**: Serves the production build locally.
*   **`bun run test`**: Runs the unit tests.
