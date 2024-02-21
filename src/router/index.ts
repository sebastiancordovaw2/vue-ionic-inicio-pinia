import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MesasPage from '../views/Mesas.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/mesas'
  },
  {
    path: '/mesas',
    name: 'Mesas',
    component: MesasPage
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
