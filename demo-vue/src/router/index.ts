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
      path: "/combobox",
      name: "combobox-demo",
      component: () => import("@/pages/combobox/ComboboxPage.vue"),
    },
    {
      path: "/virtualization",
      name: "virtualization-demo",
      component: () => import("@/pages/VirtualizationPage.vue"),
    },
    {
      path: "/datagrid",
      name: "datagrid-demo",
      component: () => import("@/pages/DataGridPage.vue"),
    },
    {
      path: "/datagrid/sugar",
      name: "datagrid-sugar-demo",
      component: () => import("@/pages/DataGridSugarPage.vue"),
    },
    {
      path: "/dialogs",
      name: "dialog-demo",
      component: () => import("@/pages/DialogPage.vue"),
    },
    {
      path: "/tooltips",
      name: "tooltip-demo",
      component: () => import("@/pages/tooltip/TooltipPage.vue"),
    },
    {
      path: "/popovers",
      name: "popover-demo",
      component: () => import("@/pages/popover/PopoverPage.vue"),
    },
    {
      path: "/disclosure",
      name: "disclosure-demo",
      component: () => import("@/pages/DisclosurePage.vue"),
    },
    {
      path: "/tabs",
      name: "tabs-demo",
      component: () => import("@/pages/TabsPage.vue"),
    },
    {
      path: "/treeview",
      name: "treeview-demo",
      component: () => import("@/pages/TreeviewPage.vue"),
    },
    ...menuRoutes,
  ],
})

export default router
