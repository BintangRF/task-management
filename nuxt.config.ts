// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  css: [
    "~/assets/css/main.css",
    "@ionic/vue/css/core.css",
    "@ionic/vue/css/normalize.css",
    "@ionic/vue/css/structure.css",
    "@ionic/vue/css/typography.css",
  ],

  vite: { plugins: [tailwindcss()] },

  build: {
    transpile: ["@ionic/vue", "@ionic/core"],
  },

  // title and icon web
  app: {
    head: {
      title: "Task Management",
      meta: [
        { name: "description", content: "Task management" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    },
  },

  modules: ["@nuxtjs/ionic"],
});
