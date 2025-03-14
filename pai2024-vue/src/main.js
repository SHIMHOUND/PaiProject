import './assets/main.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router' // Vue Router v4
import { use } from 'echarts/core'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// ECharts (example for lazy loading)
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent])


import App from './App.vue'

// Component imports (assuming these exist in your project)
import Dashboard from './components/Dashboard.vue'
import PersonList from './components/PersonList.vue'
import ProjectList from './components/ProjectList.vue'
import Analysis from './components/Analysis.vue'  // Import Analysis
import Chat from './components/Chat.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Dashboard, // Use Dashboard instead of Home
        title: 'Pulpit',
        icon: 'mdi-home'
    },
    {
        path: '/persons',
        name: 'Persons',
        component: PersonList, // Use PersonList instead of Persons
        title: 'Osoby',
        icon: 'mdi-account-tie-woman',
        roles: [0, 1]
    },
    {
        path: '/projects',
        name: 'Projects',
        component: ProjectList,
        title: 'Projekty',
        icon: 'mdi-projector',
        roles: [0, 1]
    },
    // Другие маршруты...

    // Добавляем новый маршрут для Analysis
    {
        name: 'Analysis',
        path: '/analysis',
        component: Analysis,
        title: 'Analiza',
        icon: 'mdi-chart-bar',
        meta: {
            requiresAuth: true,
            roles: [0] // Только для роли 0
        }
    },
    {
        path: '/chat',
        name: 'Chat',
        component: Chat,
        title: 'Czat',
        icon: 'mdi-chat-outline',
        roles: [0, 1]
    }
]


const router = createRouter({
    history: createWebHashHistory(),
    routes
})


const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi'
    }
})


createApp(App).use(vuetify).use(router).mount('#app')