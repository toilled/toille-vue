# toille-vue

This is a simple static web application built with [Gridsome](https://gridsome.org/) (Vue.js). It serves as a personal website and includes a few interactive components.

## Features

*   **Dynamic Pages**: Page content is loaded from a JSON file and rendered dynamically using Gridsome's data store and templates.
*   **Interactive Components**: Includes an alcohol unit checker, a mini-game, and components that fetch data from external APIs.
*   **Styling**: Uses `@picocss/pico` for lightweight and clean styling.

## Project Structure

*   `src/components`: Contains the Vue components.
*   `src/layouts`: Contains the main layout.
*   `src/pages`: Contains the page components.
*   `src/templates`: Contains templates for dynamic pages.
*   `src/configs/pages.json`: Defines the pages and their content.
*   `src/main.js`: The application's entry point.

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
    npm install
    ```

## Available Scripts

*   **`npm run dev`**: Starts the development server (`gridsome develop`).
*   **`npm run build`**: Builds the application for production (`gridsome build`).
*   **`npm run explore`**: Explore the GraphQL data (`gridsome explore`).

## Notes

*   This project uses Gridsome which relies on Vue 2.7.
*   Components use the Composition API via `@vue/composition-api` or standard Options API.
