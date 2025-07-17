# To-Do Web App 1.0

A hierarchical, interactive, and feature-rich to-do list application built with Next.js, TypeScript, and Tailwind CSS. This application allows you to organize your tasks in a nested structure, manage them with a user-friendly interface, and customize your experience with multiple themes.

## 🚀 Features

-   **Hierarchical Task Management**: Organize your tasks in a tree-like structure with infinite nesting.
-   **Drag & Drop**: Easily reorder and restructure your tasks by dragging and dropping them.
-   **Rich Text Editor**: A full-featured Tiptap-based text editor for your tasks, including support for images.
-   **Context Menu**: Right-click on a task to access quick actions like marking as complete, deleting, adding a sub-task, or adding a new task.
-   **Theming**: Choose from multiple themes to customize the look and feel of the application. The selected theme is now more prominent in the theme switcher.
-   **Search**: Quickly find tasks with the built-in search functionality.
-   **Resizable Panels**: Adjust the layout to your liking with resizable panels.
-   **Responsive Design**: The application is fully responsive and works great on all screen sizes.
-   **User Authentication**: Secure user authentication with NextAuth.js and Prisma.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **UI Components**: [Radix UI](https://www.radix-ui.com/)
-   **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **Database ORM**: [Prisma](https://www.prisma.io/)
-   **Authentication**: [NextAuth.js](https://next-auth.js.org/)
-   **Rich Text Editor**: [Tiptap](https://tiptap.dev/)

## 📦 Packages Used

Here's a list of the main packages used in this project and what they do:

-   **`@auth/prisma-adapter`**: NextAuth.js adapter for Prisma.
-   **`@dnd-kit/core`**: Lightweight and modular drag and drop library.
-   **`@prisma/client`**: Type-safe Prisma client for database interactions.
-   **`@radix-ui/*`**: A collection of unstyled, accessible UI components.
-   **`@tiptap/*`**: A headless, framework-agnostic rich text editor.
-   **`axios`**: Promise-based HTTP client for making API requests.
-   **`bcryptjs`**: Library for hashing passwords.
-   **`class-variance-authority`**: Create type-safe and composable UI components with variants.
-   **`clsx`**: Utility for constructing `className` strings conditionally.
-   **`lucide-react`**: Beautiful and consistent icon library.
-   **`next`**: The React framework for production.
-   **`next-auth`**: Authentication for Next.js.
-   **`next-themes`**: Easy dark mode for Next.js.
-   **`prisma`**: Next-generation ORM for Node.js and TypeScript.
-   **`react`**: A JavaScript library for building user interfaces.
-   **`tailwindcss`**: A utility-first CSS framework.
-   **`typescript`**: A typed superset of JavaScript.
-   **`zustand`**: A small, fast, and scalable state-management solution.

## 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18.x or later)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/your_repository.git
    ```
2.  Install NPM packages
    ```sh
   npm install
   ```
3.  Set up your environment variables by creating a `.env` file in the root of your project. You'll need to provide a `DATABASE_URL` for Prisma and a `NEXTAUTH_SECRET` for NextAuth.js.
    ```env
    DATABASE_URL="your_database_url"
    NEXTAUTH_SECRET="your_nextauth_secret"
    ```
4.  Run database migrations
    ```sh
    npx prisma migrate dev
    ```
5.  Start the development server
    ```sh
   npm run dev
   ```

Now, open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📂 Project Structure

```
src/
├── app/                 # Next.js App Router pages and API routes
├── components/          # React components
├── lib/                 # Utility functions and libraries
├── store/               # Zustand state management stores
├── styles/              # Global styles and Tailwind CSS configuration
└── types/               # TypeScript type definitions
```

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by:** [Your Name](https://github.com/your_username) - 2024 