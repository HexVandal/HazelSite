# gloom.

Welcome to **gloom.** — a modern, personal website and digital playground built with bleeding-edge web technologies. This project is a showcase of my work, experiments, blog posts, and self-hosted services, all wrapped in a sleek, fast, and responsive Next.js app.

---

## 🚀 Overview

gloom. is designed to be a portfolio, blog, and tech playground. It features a clean UI, dark/light themes, and a modular codebase that makes it easy to extend and maintain. Whether you're here to check out my projects, read my thoughts, or get inspired for your own site, I hope you enjoy your stay!

---

## ✨ Features

- **Next.js 15**: App directory, server components, and all the latest features.
- **TailwindCSS**: Utility-first styling for rapid UI development.
- **shadcn/ui**: Beautiful, accessible React components.
- **Tanstack Query**: Powerful data fetching and caching.
- **Dark/Light Theme**: Seamless theme switching.
- **Blog**: Write, read, and share posts.
- **Responsive Design**: Looks great on any device.
- **SEO Optimized**: Metadata, Open Graph, and Twitter cards.
- **Self-hosted Services**: Links to my own hosted tools and dashboards.
- **Easy Deployment**: One-click deploy to [Vercel](https://vercel.com/).
- **TypeScript**: Full type safety across the stack.
- **Image Optimization**: Next.js image component for fast, responsive images.
- **Accessible**: Follows best practices for accessibility.

---

## 🛠️ How It Works

- **App Directory**: Uses Next.js 15's `/app` directory for routing and layouts.
- **Providers**: Global context for themes and React Query.
- **Components**: Modular, reusable components for UI, navigation, and content.
- **Data Fetching**: Uses Tanstack Query for client/server data management.
- **SEO**: Dynamic metadata for each page.
- **Assets**: All images and static files are in `/src/assets`.

---

## 🏗️ Project Structure

```
app
├── api
│   └── hello
│       └── route.ts
├── blog
│   ├── [slug]
│   │   └── page.tsx
│   └── page.tsx
├── dashboard
│   └── page.tsx
├── layout.tsx
├── page.tsx
└── projects
    └── page.tsx
public
├── favicon.ico
├── next.svg
├── apple-touch-icon.png
└── images
    ├── profile.jpg
    └── projects
        ├── project1.png
        └── project2.png
src
├── assets
│   ├── fonts
│   └── icons
├── components
│   ├── ui
│   └── layout
├── lib
│   ├── api.ts
│   └── db.ts
├── middleware
├── pages
│   ├── api
│   │   └── hello.ts
│   ├── blog
│   │   ├── [slug].tsx
│   │   └── index.tsx
│   ├── dashboard
│   │   └── index.tsx
│   ├── index.tsx
│   └── projects
│       └── index.tsx
└── styles
    ├── globals.css
    └── tailwind.css
```

---

## 🚀 Getting Started

To get started with gloom., follow these steps:

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/gloom.git
   cd realm
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**

   Visit `http://localhost:3000` to see your new site in action.

---

## 📦 Deployment

gloom. is optimized for deployment on Vercel. To deploy your own copy of gloom., follow these steps:

1. **Create a Vercel account** if you don't have one.
2. **Connect your GitHub repository** to Vercel.
3. **Import the gloom. project** from your GitHub repositories.
4. **Configure environment variables** if needed (e.g., for API keys or database URLs).
5. **Deploy the project** with the default settings.

For detailed instructions, visit the [Vercel documentation](https://vercel.com/docs).

---

## 📝 Writing Blog Posts

To write and publish blog posts on gloom., follow these steps:

1. **Create a new Markdown file** in the `src/posts` directory.
2. **Add frontmatter** to the top of the file for metadata (title, date, slug, etc.).
3. **Write your post content** using Markdown syntax.
4. **Save and close the file**.
5. **Visit the blog section** of your site to see your new post.

For more advanced usage, check the [Next.js Markdown documentation](https://nextjs.org/docs/advanced-features/markdown).

---

## 🎨 Customizing the Design

gloom. is designed to be easily customizable. To change the look and feel of your site, you can:

- **Edit the global styles** in `src/styles/globals.css`.
- **Customize the theme** in `tailwind.config.js`.
- **Modify or add components** in the `src/components` directory.
- **Update the layout** in `app/layout.tsx`.

For detailed customization options, refer to the documentation of [TailwindCSS](https://tailwindcss.com/docs) and [shadcn/ui](https://ui.shadcn.com/docs).

---

## 📚 Learning Resources

To get the most out of gloom., here are some resources to help you learn and explore:

- **Next.js Documentation**: Learn about the features and capabilities of Next.js.
- **TailwindCSS Documentation**: Discover how to use TailwindCSS for styling.
- **shadcn/ui Documentation**: Explore the components and usage of shadcn/ui.
- **Tanstack Query Documentation**: Understand data fetching and caching with Tanstack Query.
- **MDN Web Docs**: Comprehensive resources for web development technologies.

---

## 🤝 Contributing

Contributions to gloom. are welcome! To contribute, please follow these steps:

1. **Fork the repository** on GitHub.
2. **Create a new branch** for your feature or bugfix.
3. **Make your changes** and commit them with descriptive messages.
4. **Push your branch** to your forked repository.
5. **Create a pull request** to the main repository.

Please ensure your code follows the existing style and conventions. For major changes, open an issue first to discuss with the maintainers.

---

## 📜 License

gloom. is open-source software licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as you wish, but please include the original copyright notice and license text.

---

## 👀 Acknowledgments

gloom. is built with love and passion for web development. Special thanks to the creators and maintainers of the amazing technologies used in this project:

- [Next.js](https://nextjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tanstack Query](https://tanstack.com/query)
- [Vercel](https://vercel.com/)

---

Enjoy your visit to gloom., and feel free to reach out if you have any questions or feedback!
