import type { RouteRecordRaw } from "vue-router"

export const menuRoutes: RouteRecordRaw[] = [
  {
    path: "/menu",
    component: () => import("@/pages/menu/MenuPage.vue"),
    children: [
      {
        path: "simple",
        name: "menu.simple",
        component: () => import("@/pages/menu/SimpleMenu.vue"),
      },
    ],
  },
]
