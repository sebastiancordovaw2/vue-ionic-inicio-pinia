import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import MesasPage from '../views/Mesas.vue'
import MesaPage from '../views/Mesa.vue'
import CompraPage from '../views/Compra.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/mesas'
  },
  {
    path: '/mesas',
    name: 'Mesas',
    component: MesasPage
  },
  {
    path: "/mesa/:id",
    name: "mesa",
    component: MesaPage
  },
  {
    path: "/compra/:id",
    name: "compra",
    component: CompraPage
  }
]

const router = createRouter({
  history: createWebHistory('https://sebastiancordovaw2.github.io/vue-ionic-inicio-pinia/'),
  routes
})

export default router
