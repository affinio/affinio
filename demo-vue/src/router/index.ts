import { createRouter, createWebHistory } from 'vue-router'
import { menuRoutes } from './menu.routes';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/pages/HomePage.vue"),
    },
    {
      path: "/selection",
      name: "selection-demo",
      component: () => import("@/pages/SelectionPage.vue"),
    },
    {
      path: "/one-grid",
      name: "one-grid-demo",
      component: () => import("@/pages/OneGridPage.vue"),
    },
    ...menuRoutes,
  ],
})

export default router
