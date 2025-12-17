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
      path: "/virtualization",
      name: "virtualization-demo",
      component: () => import("@/pages/VirtualizationPage.vue"),
    },
    ...menuRoutes,
  ],
})

export default router
