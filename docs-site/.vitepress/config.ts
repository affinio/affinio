import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'en-US',
  title: 'Affino',
  description: 'Framework-agnostic UI cores with Vue and React adapters.',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    server: {
      host: true,      // 0.0.0.0
      port: 4174,
      strictPort: true
    }
  },
  sitemap: {
    hostname: 'https://affino.dev',
    transformItems: (items) => items.filter((item) => !item.url.startsWith('/datagrid-ru/'))
  },
  themeConfig: {
    siteTitle: 'Affino',
    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Core',
        items: [
          { text: 'surface-core', link: '/core/surface-core' },
          { text: 'overlay-kernel', link: '/core/overlay-kernel' },
          { text: 'overlay-host', link: '/core/overlay-host' },
          { text: 'menu-core', link: '/core/menu-core' },
          { text: 'tooltip-core', link: '/core/tooltip-core' },
          { text: 'popover-core', link: '/core/popover-core' },
          { text: 'dialog-core', link: '/core/dialog-core' },
          { text: 'selection-core', link: '/core/selection-core' },
          { text: 'listbox-core', link: '/core/listbox-core' },
          { text: 'combobox-core', link: '/core/combobox-core' },
          { text: 'tabs-core', link: '/core/tabs-core' },
          { text: 'disclosure-core', link: '/core/disclosure-core' },
          { text: 'grid-selection-core', link: '/core/grid-selection-core' },
          { text: 'virtualization-core', link: '/core/virtualization-core' },
          { text: 'treeview-core', link: '/core/treeview-core' },
          { text: 'aria-utils', link: '/core/aria-utils' },
          { text: 'focus-utils', link: '/core/focus-utils' }
        ]
      },
      {
        text: 'DataGrid',
        items: [
          { text: 'Overview', link: '/datagrid/' },
          { text: 'Core vs Sugar', link: '/datagrid/core-vs-sugar' },
          { text: 'Audience Tracks', link: '/datagrid/audience-tracks' },
          { text: 'Core Quickstart', link: '/datagrid/core-quickstart' },
          { text: 'Architecture', link: '/datagrid/architecture' },
          { text: 'Data Models', link: '/datagrid/data-models' },
          { text: 'Model Contracts', link: '/datagrid/model-contracts' },
          { text: 'Grid API', link: '/datagrid/grid-api' },
          { text: 'GroupBy Projection', link: '/datagrid/groupby-projection' },
          { text: 'Row Models', link: '/datagrid/row-models' },
          { text: 'Runtime Modes', link: '/datagrid/runtime-modes' },
          { text: 'Tree Data', link: '/datagrid/tree-data' },
          { text: 'Interaction Orchestration Engine', link: '/datagrid/orchestration' },
          { text: 'Data Source Protocol', link: '/datagrid/data-source-protocol' },
          { text: 'Deterministic Integration', link: '/datagrid/deterministic-integration' },
          { text: 'Runtime Events', link: '/datagrid/runtime-events' },
          { text: 'State, Events, Compute, Diagnostics', link: '/datagrid/state-events-compute-diagnostics' },
          { text: 'Custom Renderer', link: '/datagrid/custom-renderer' },
          { text: 'Range Selection', link: '/datagrid/range-selection' },
          { text: 'Fill Handle', link: '/datagrid/fill-handle' },
          { text: 'Range Move', link: '/datagrid/drag-move' },
          { text: 'Reordering', link: '/datagrid/reordering' },
          { text: 'Viewport & A11y', link: '/datagrid/viewport-a11y' },
          { text: 'Vue Integration', link: '/datagrid/vue-integration' },
          { text: 'Vue API Reference', link: '/datagrid/vue-api-reference' },
          { text: 'Sugar Overview', link: '/datagrid/sugar-overview' },
          { text: 'Vue Sugar Playbook', link: '/datagrid/vue-sugar-playbook' },
          { text: 'Laravel Integration', link: '/datagrid/laravel-integration' },
          { text: 'Migration Guide', link: '/datagrid/migration-guide' },
          { text: 'Migration & Compat', link: '/datagrid/migration-compat' },
          { text: 'Quality Gates', link: '/datagrid/quality-gates' },
          { text: 'Performance Gates', link: '/datagrid/performance-gates' },
          { text: 'Perf-by-Design', link: '/datagrid/perf-by-design-runtime' },
          { text: 'Parity Matrix', link: '/datagrid/parity-matrix' },
          { text: 'Performance & Diagnostics', link: '/datagrid/performance-diagnostics' },
          { text: 'Testing & QA', link: '/datagrid/testing-qa' },
          { text: 'End-to-End', link: '/datagrid/end-to-end' },
          { text: 'Release Notes', link: '/datagrid/releases' },
          { text: 'Troubleshooting', link: '/datagrid/troubleshooting' }
        ]
      },
      {
        text: 'Adapters',
        items: [
          { text: 'Laravel Adapter', link: '/adapters/laravel' },
          { text: 'Vue Adapter', link: '/adapters/vue' }
        ]
      },
      {
        text: 'Menu',
        items: [
          { text: 'Overview', link: '/menu/' },
          { text: 'Getting Started', link: '/menu/getting-started' },
          { text: 'Examples', link: '/menu/examples' },
          { text: 'Styling', link: '/menu/styling-and-animation' },
          { text: 'React Adapter', link: '/menu/react' },
          { text: 'Advanced', link: '/menu/advanced' }
        ]
      },
      { text: 'Tooltip', link: '/tooltip/' },
      { text: 'Popover', link: '/popover/' },
      { text: 'Dialog', link: '/dialog/' },
      { text: 'Tabs', link: '/tabs/' },
      { text: 'Disclosure', link: '/disclosure/' },
      { text: 'Playground', link: 'https://affino.dev' }
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Overview', link: '/' }
          ]
        },
        {
          text: 'Core Packages',
          collapsed: false,
          items: [
            { text: 'surface-core', link: '/core/surface-core' },
            { text: 'overlay-kernel', link: '/core/overlay-kernel' },
            { text: 'overlay-host', link: '/core/overlay-host' },
            { text: 'menu-core', link: '/core/menu-core' },
            { text: 'tooltip-core', link: '/core/tooltip-core' },
            { text: 'popover-core', link: '/core/popover-core' },
            { text: 'dialog-core', link: '/core/dialog-core' },
            { text: 'selection-core', link: '/core/selection-core' },
            { text: 'listbox-core', link: '/core/listbox-core' },
            { text: 'combobox-core', link: '/core/combobox-core' },
            { text: 'tabs-core', link: '/core/tabs-core' },
            { text: 'disclosure-core', link: '/core/disclosure-core' },
            { text: 'grid-selection-core', link: '/core/grid-selection-core' },
            { text: 'virtualization-core', link: '/core/virtualization-core' },
            { text: 'treeview-core', link: '/core/treeview-core' },
            { text: 'aria-utils', link: '/core/aria-utils' },
            { text: 'focus-utils', link: '/core/focus-utils' }
          ]
        },
        {
          text: 'DataGrid Core',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/datagrid/' },
            { text: 'Core vs Sugar', link: '/datagrid/core-vs-sugar' },
            { text: 'Audience Tracks', link: '/datagrid/audience-tracks' },
            { text: 'Core Quickstart', link: '/datagrid/core-quickstart' },
            { text: 'Architecture', link: '/datagrid/architecture' },
            { text: 'Data Models', link: '/datagrid/data-models' },
            { text: 'Model Contracts', link: '/datagrid/model-contracts' },
            { text: 'Grid API', link: '/datagrid/grid-api' },
            { text: 'GroupBy Projection', link: '/datagrid/groupby-projection' },
            { text: 'Row Models', link: '/datagrid/row-models' },
            { text: 'Runtime Modes', link: '/datagrid/runtime-modes' },
            { text: 'Tree Data', link: '/datagrid/tree-data' },
            { text: 'Interaction Orchestration Engine', link: '/datagrid/orchestration' },
            { text: 'Data Source Protocol', link: '/datagrid/data-source-protocol' },
            { text: 'Deterministic Integration', link: '/datagrid/deterministic-integration' },
            { text: 'Runtime Events', link: '/datagrid/runtime-events' },
            { text: 'State, Events, Compute, Diagnostics', link: '/datagrid/state-events-compute-diagnostics' },
            { text: 'Custom Renderer', link: '/datagrid/custom-renderer' },
            { text: 'Range Selection', link: '/datagrid/range-selection' },
            { text: 'Fill Handle', link: '/datagrid/fill-handle' },
            { text: 'Range Move', link: '/datagrid/drag-move' },
            { text: 'Reordering', link: '/datagrid/reordering' },
            { text: 'Viewport & A11y', link: '/datagrid/viewport-a11y' },
            { text: 'End-to-End', link: '/datagrid/end-to-end' }
          ]
        },
        {
          text: 'DataGrid Sugar',
          collapsed: false,
          items: [
            { text: 'Vue Integration', link: '/datagrid/vue-integration' },
            { text: 'Vue API Reference', link: '/datagrid/vue-api-reference' },
            { text: 'Sugar Overview', link: '/datagrid/sugar-overview' },
            { text: 'Vue Sugar Playbook', link: '/datagrid/vue-sugar-playbook' },
            { text: 'Laravel Integration', link: '/datagrid/laravel-integration' }
          ]
        },
        {
          text: 'DataGrid Operations',
          collapsed: true,
          items: [
            { text: 'Migration Guide', link: '/datagrid/migration-guide' },
            { text: 'Migration & Compat', link: '/datagrid/migration-compat' },
            { text: 'Quality Gates', link: '/datagrid/quality-gates' },
            { text: 'Performance Gates', link: '/datagrid/performance-gates' },
            { text: 'Perf-by-Design', link: '/datagrid/perf-by-design-runtime' },
            { text: 'Parity Matrix', link: '/datagrid/parity-matrix' },
            { text: 'Performance & Diagnostics', link: '/datagrid/performance-diagnostics' },
            { text: 'Testing & QA', link: '/datagrid/testing-qa' },
            { text: 'Release Notes', link: '/datagrid/releases' },
            { text: 'Troubleshooting', link: '/datagrid/troubleshooting' }
          ]
        },
        {
          text: 'Menu System',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/menu/' },
            { text: 'Getting Started', link: '/menu/getting-started' },
            { text: 'Examples', link: '/menu/examples' },
            { text: 'Styling & Animation', link: '/menu/styling-and-animation' },
            { text: 'React Adapter', link: '/menu/react' },
            { text: 'Advanced', link: '/menu/advanced' }
          ]
        },
        {
          text: 'Platform Adapters',
          collapsed: false,
          items: [
            { text: 'Laravel Adapter', link: '/adapters/laravel' },
            { text: 'Vue Adapter', link: '/adapters/vue' }
          ]
        },
        {
          text: 'Surface Systems',
          collapsed: true,
          items: [
            { text: 'Tooltip', link: '/tooltip/' },
            { text: 'Popover', link: '/popover/' },
            { text: 'Dialog', link: '/dialog/' },
            { text: 'Tabs', link: '/tabs/' },
            { text: 'Disclosure', link: '/disclosure/' }
          ]
        }
      ],
      '/core/': [
        {
          text: 'Core Packages',
          items: [
            { text: 'surface-core', link: '/core/surface-core' },
            { text: 'overlay-kernel', link: '/core/overlay-kernel' },
            { text: 'overlay-host', link: '/core/overlay-host' },
            { text: 'menu-core', link: '/core/menu-core' },
            { text: 'tooltip-core', link: '/core/tooltip-core' },
            { text: 'popover-core', link: '/core/popover-core' },
            { text: 'dialog-core', link: '/core/dialog-core' },
            { text: 'selection-core', link: '/core/selection-core' },
            { text: 'listbox-core', link: '/core/listbox-core' },
            { text: 'combobox-core', link: '/core/combobox-core' },
            { text: 'tabs-core', link: '/core/tabs-core' },
            { text: 'disclosure-core', link: '/core/disclosure-core' },
            { text: 'grid-selection-core', link: '/core/grid-selection-core' },
            { text: 'virtualization-core', link: '/core/virtualization-core' },
            { text: 'treeview-core', link: '/core/treeview-core' },
            { text: 'aria-utils', link: '/core/aria-utils' },
            { text: 'focus-utils', link: '/core/focus-utils' }
          ]
        }
      ],
      '/datagrid/': [
        {
          text: 'DataGrid Core',
          items: [
            { text: 'Overview', link: '/datagrid/' },
            { text: 'Core vs Sugar', link: '/datagrid/core-vs-sugar' },
            { text: 'Audience Tracks', link: '/datagrid/audience-tracks' },
            { text: 'Core Quickstart', link: '/datagrid/core-quickstart' },
            { text: 'Architecture', link: '/datagrid/architecture' },
            { text: 'Data Models', link: '/datagrid/data-models' },
            { text: 'Model Contracts', link: '/datagrid/model-contracts' },
            { text: 'Grid API', link: '/datagrid/grid-api' },
            { text: 'GroupBy Projection', link: '/datagrid/groupby-projection' },
            { text: 'Row Models', link: '/datagrid/row-models' },
            { text: 'Runtime Modes', link: '/datagrid/runtime-modes' },
            { text: 'Tree Data', link: '/datagrid/tree-data' },
            { text: 'Interaction Orchestration Engine', link: '/datagrid/orchestration' },
            { text: 'Data Source Protocol', link: '/datagrid/data-source-protocol' },
            { text: 'Deterministic Integration', link: '/datagrid/deterministic-integration' },
            { text: 'Runtime Events', link: '/datagrid/runtime-events' },
            { text: 'State, Events, Compute, Diagnostics', link: '/datagrid/state-events-compute-diagnostics' },
            { text: 'Custom Renderer', link: '/datagrid/custom-renderer' },
            { text: 'Range Selection', link: '/datagrid/range-selection' },
            { text: 'Fill Handle', link: '/datagrid/fill-handle' },
            { text: 'Range Move', link: '/datagrid/drag-move' },
            { text: 'Reordering', link: '/datagrid/reordering' },
            { text: 'Viewport & A11y', link: '/datagrid/viewport-a11y' },
            { text: 'End-to-End', link: '/datagrid/end-to-end' }
          ]
        },
        {
          text: 'DataGrid Sugar',
          items: [
            { text: 'Vue Integration', link: '/datagrid/vue-integration' },
            { text: 'Vue API Reference', link: '/datagrid/vue-api-reference' },
            { text: 'Sugar Overview', link: '/datagrid/sugar-overview' },
            { text: 'Vue Sugar Playbook', link: '/datagrid/vue-sugar-playbook' },
            { text: 'Laravel Integration', link: '/datagrid/laravel-integration' }
          ]
        },
        {
          text: 'DataGrid Operations',
          items: [
            { text: 'Migration Guide', link: '/datagrid/migration-guide' },
            { text: 'Migration & Compat', link: '/datagrid/migration-compat' },
            { text: 'Quality Gates', link: '/datagrid/quality-gates' },
            { text: 'Performance Gates', link: '/datagrid/performance-gates' },
            { text: 'Perf-by-Design', link: '/datagrid/perf-by-design-runtime' },
            { text: 'Parity Matrix', link: '/datagrid/parity-matrix' },
            { text: 'Performance & Diagnostics', link: '/datagrid/performance-diagnostics' },
            { text: 'Testing & QA', link: '/datagrid/testing-qa' },
            { text: 'Release Notes', link: '/datagrid/releases' },
            { text: 'Troubleshooting', link: '/datagrid/troubleshooting' }
          ]
        }
      ],
      '/datagrid-ru/': [
        {
          text: 'DataGrid Core (RU)',
          items: [
            { text: 'Overview', link: '/datagrid-ru/' },
            { text: 'Core vs Sugar', link: '/datagrid-ru/core-vs-sugar' },
            { text: 'Треки пользователей', link: '/datagrid-ru/audience-tracks' },
            { text: 'Core Quickstart', link: '/datagrid-ru/core-quickstart' },
            { text: 'Architecture', link: '/datagrid-ru/architecture' },
            { text: 'Data Models', link: '/datagrid-ru/data-models' },
            { text: 'Model Contracts', link: '/datagrid-ru/model-contracts' },
            { text: 'Grid API', link: '/datagrid-ru/grid-api' },
            { text: 'GroupBy Projection', link: '/datagrid-ru/groupby-projection' },
            { text: 'Row Models', link: '/datagrid-ru/row-models' },
            { text: 'Режимы рантайма', link: '/datagrid-ru/runtime-modes' },
            { text: 'Tree Data', link: '/datagrid-ru/tree-data' },
            { text: 'Interaction Orchestration Engine', link: '/datagrid-ru/orchestration' },
            { text: 'Data Source Protocol', link: '/datagrid-ru/data-source-protocol' },
            { text: 'Deterministic Integration', link: '/datagrid-ru/deterministic-integration' },
            { text: 'Runtime Events', link: '/datagrid-ru/runtime-events' },
            { text: 'State/events/compute/diagnostics', link: '/datagrid-ru/state-events-compute-diagnostics' },
            { text: 'Custom Renderer', link: '/datagrid-ru/custom-renderer' },
            { text: 'Range Selection', link: '/datagrid-ru/range-selection' },
            { text: 'Fill Handle', link: '/datagrid-ru/fill-handle' },
            { text: 'Range Move', link: '/datagrid-ru/drag-move' },
            { text: 'Reordering', link: '/datagrid-ru/reordering' },
            { text: 'Viewport & A11y', link: '/datagrid-ru/viewport-a11y' },
            { text: 'End-to-End', link: '/datagrid-ru/end-to-end' }
          ]
        },
        {
          text: 'DataGrid Sugar (RU)',
          items: [
            { text: 'Vue Integration', link: '/datagrid-ru/vue-integration' },
            { text: 'Vue API Reference', link: '/datagrid-ru/vue-api-reference' },
            { text: 'Sugar Overview', link: '/datagrid-ru/sugar-overview' },
            { text: 'Vue Sugar Playbook', link: '/datagrid-ru/vue-sugar-playbook' },
            { text: 'Laravel Integration', link: '/datagrid-ru/laravel-integration' }
          ]
        },
        {
          text: 'DataGrid Operations (RU)',
          items: [
            { text: 'Migration Guide', link: '/datagrid-ru/migration-guide' },
            { text: 'Migration & Compat', link: '/datagrid-ru/migration-compat' },
            { text: 'Quality Gates', link: '/datagrid-ru/quality-gates' },
            { text: 'Performance Gates', link: '/datagrid-ru/performance-gates' },
            { text: 'Perf-by-Design', link: '/datagrid-ru/perf-by-design-runtime' },
            { text: 'Parity Matrix', link: '/datagrid-ru/parity-matrix' },
            { text: 'Performance & Diagnostics', link: '/datagrid-ru/performance-diagnostics' },
            { text: 'Testing & QA', link: '/datagrid-ru/testing-qa' },
            { text: 'Release Notes', link: '/datagrid-ru/releases' },
            { text: 'Troubleshooting', link: '/datagrid-ru/troubleshooting' }
          ]
        }
      ],
      '/adapters/': [
        { text: 'Laravel Adapter', link: '/adapters/laravel' },
        { text: 'Vue Adapter', link: '/adapters/vue' }
      ],
      '/menu/': [
        { text: 'Overview', link: '/menu/' },
        { text: 'Getting Started', link: '/menu/getting-started' },
        { text: 'Examples', link: '/menu/examples' },
        { text: 'Styling & Animation', link: '/menu/styling-and-animation' },
        { text: 'React Adapter', link: '/menu/react' },
        { text: 'Advanced', link: '/menu/advanced' }
      ],
      '/tooltip/': [
        { text: 'Overview', link: '/tooltip/' },
        { text: 'Core API', link: '/core/tooltip-core' }
      ],
      '/popover/': [
        { text: 'Overview', link: '/popover/' },
        { text: 'Core API', link: '/core/popover-core' }
      ],
      '/dialog/': [
        { text: 'Overview', link: '/dialog/' },
        { text: 'Core API', link: '/core/dialog-core' }
      ],
      '/tabs/': [
        { text: 'Overview', link: '/tabs/' },
        { text: 'Core API', link: '/core/tabs-core' }
      ],
      '/disclosure/': [
        { text: 'Overview', link: '/disclosure/' },
        { text: 'Core API', link: '/core/disclosure-core' }
      ]
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/affinio/affinio' }
    ],
    footer: {
      message: 'MIT Licensed',
      copyright: '© ' + new Date().getFullYear() + ' Affino'
    }
  }
})
