<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="app-toolbar">
        <ion-buttons slot="start">
          <ion-button href="#/mesas" aria-label="Volver a las mesas">
            <ion-icon slot="icon-only" :icon="arrowBackOutline" />
          </ion-button>
        </ion-buttons>
        <div class="app-title">
          Mesa {{ mesa }}
          <small>Tomando pedido</small>
        </div>
        <ion-buttons slot="end">
          <ion-button fill="outline" @click="dirigirCompra(mesa)">
            <ion-icon slot="start" :icon="receiptOutline" />
            Venta
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      <ion-toolbar class="search-toolbar">
        <ion-searchbar placeholder="Buscar producto…" :debounce="0" @ionInput="onSearch($event)"></ion-searchbar>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="app-container">
        <div class="section-title" v-if="busqueda">
          Resultados <span class="count">{{ filter.length }}</span>
        </div>
        <div class="section-title" v-else-if="itemsMesa.length">
          Pedido actual (sin enviar) <span class="count">{{ totalUnidades }}</span>
        </div>

        <div v-if="busqueda && filter.length == 0" class="app-empty">
          <ion-icon :icon="searchOutline" />
          No se encontraron productos para “{{ busqueda }}”
        </div>

        <div v-else-if="!busqueda && itemsMesa.length == 0" class="app-empty">
          <ion-icon :icon="fastFoodOutline" />
          <strong>El pedido está vacío</strong><br />
          Usa el buscador para agregar productos
        </div>

        <div class="lista">
          <div
            v-for="f in listaVisible"
            :key="f.id"
            class="producto"
            :class="{ 'en-pedido': cantidad(f) > 0 }"
          >
            <div class="info">
              <div class="nombre">{{ f.nombre }}</div>
              <div class="precios" @click="cambiarPrecio(mesa, f)">
                <span :class="{ tachado: precioCustom(f) }">{{ formatoPrecio(f.precio) }}</span>
                <span v-if="precioCustom(f)" class="precio-custom">{{ formatoPrecio(precioCustom(f)) }}</span>
              </div>

              <div v-if="cantidad(f) > 0" class="herramientas">
                <label class="descuento">
                  <ion-icon :icon="pricetagOutline" />
                  <select @change="porcentage($event.target.value, mesa, f)">
                    <option value="" disabled selected>Descuento</option>
                    <option value="0">Sin descuento</option>
                    <option value="10">10%</option>
                    <option value="20">20%</option>
                    <option value="30">30%</option>
                    <option value="40">40%</option>
                    <option value="50">50%</option>
                    <option value="60">60%</option>
                    <option value="70">70%</option>
                    <option value="80">80%</option>
                    <option value="90">90%</option>
                  </select>
                </label>
                <button class="link" @click="cambiarPrecio(mesa, f)">
                  <ion-icon :icon="createOutline" /> Precio
                </button>
              </div>
            </div>

            <div class="stepper" v-if="cantidad(f) > 0">
              <button class="step" @click="setCarritoEliminarF(mesa, f)" aria-label="Quitar uno">
                <ion-icon :icon="cantidad(f) == 1 ? trashOutline : removeOutline" />
              </button>
              <span class="qty">{{ cantidad(f) }}</span>
              <button class="step add" @click="setCarritoAgregarF(mesa, f)" aria-label="Agregar uno">
                <ion-icon :icon="addOutline" />
              </button>
            </div>
            <button v-else class="agregar" @click="setCarritoAgregarF(mesa, f)">
              <ion-icon :icon="addOutline" /> Agregar
            </button>
          </div>
        </div>
      </div>
    </ion-content>

    <ion-footer class="ion-no-border">
      <div class="app-footer-bar">
        <div class="app-footer-inner">
          <div class="grow">
            <div class="app-footer-label">{{ totalUnidades }} {{ totalUnidades == 1 ? 'producto' : 'productos' }} por enviar</div>
            <div class="app-footer-total">{{ formatoPrecio(totalPedido) }}</div>
          </div>
          <ion-button size="large" color="success" :disabled="itemsMesa.length == 0" @click="setCompra(mesa)">
            <ion-icon slot="start" :icon="checkmarkOutline" />
            Aceptar
          </ion-button>
        </div>
      </div>
    </ion-footer>
  </ion-page>
</template>

<script setup>

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
const comanda = useComanda();
let { carrito } = storeToRefs(comanda);
const { setCarritoAgregar, setCarritoEliminar, setCarrito, setCompra, cambiarPrecio, porcentage, crearIdClienteFunction, dirigirCompra, obtenerProductos } = comanda;
import { IonContent, IonHeader, IonFooter, IonPage, IonToolbar, IonButtons, IonSearchbar, IonButton, IonIcon } from '@ionic/vue';
import {
  arrowBackOutline, receiptOutline, searchOutline, fastFoodOutline, pricetagOutline,
  createOutline, addOutline, removeOutline, trashOutline, checkmarkOutline
} from 'ionicons/icons';
import { ref, computed, onMounted } from "vue"
import { useRoute } from 'vue-router'

const productos = ref([])
let carritoGuardado = ref({});
const filter = ref([])
const mesa = ref(0);
const route = useRoute()
const busqueda = ref("");

crearIdClienteFunction();

onMounted(() => {

  mesa.value = route.params.id;
  getProductos();

  if (carrito.length == undefined) {
    carritoGuardado.value = (localStorage.getItem("carrito") != null) ? JSON.parse(localStorage.getItem("carrito")) : {};
    setCarrito(carritoGuardado.value);
  }
  else {
    carritoGuardado.value = carrito;
  }
})

// Productos del carrito de esta mesa (pedido aún no enviado)
const itemsMesa = computed(() => {
  const c = carritoGuardado.value;
  if (!c || !c[mesa.value]) return [];
  return c[mesa.value].filter(item => item != null && item.cantidad > 0);
});

const itemCarrito = (f) => itemsMesa.value.find(item => item.id == f.id);

const cantidad = (f) => {
  const item = itemCarrito(f);
  return item ? item.cantidad : 0;
};

const precioCustom = (f) => {
  const item = itemCarrito(f);
  return item && item.precioCustom ? item.precioCustom : null;
};

const totalUnidades = computed(() => itemsMesa.value.reduce((acc, item) => acc + Number(item.cantidad || 0), 0));

const totalPedido = computed(() => itemsMesa.value.reduce((acc, item) => {
  const precio = item.precioCustom ? Number(item.precioCustom) : Number(item.precio);
  return acc + precio * Number(item.cantidad || 0);
}, 0));

// Con búsqueda se muestran resultados; sin búsqueda, el pedido actual
const listaVisible = computed(() => busqueda.value ? filter.value : itemsMesa.value);

function formatoPrecio(valor) {
  return '$' + Math.round(Number(valor) || 0).toLocaleString('es-CL');
}

const setCarritoAgregarF = (mesa, producto) => {
  let carro = setCarritoAgregar(mesa, producto);
  carritoGuardado.value = carro;
}

const setCarritoEliminarF = (mesa, producto) => {
  let carro = setCarritoEliminar(mesa, producto);
  carritoGuardado.value = carro;
}

const getProductos = async () => {
  try {
    // Usa los productos sincronizados (botón "Sincronizar" en Mesas)
    const data = await obtenerProductos();

    data.forEach((elemento, indice) => {
      productos.value[elemento["id"]] = {
        "id": elemento["id"],
        "nombre": elemento["nombre"],
        "precio": elemento["precio"],
        "activo": elemento["activo"]
      }
    });

  } catch (error) {
    console.error("Error al cargar el archivo JSON:", error);
  }
}

const onSearch = (event) => {
  busqueda.value = (event.target.value || "").trim();
  search(event);
}

const search = (event) => {

  if (event.target.value.toLowerCase().trim() != "") {
    filter.value = [];
    productos.value.forEach((elemento, indice) => {
      if (elemento["nombre"] != undefined) {
        if (elemento["nombre"].normalize('NFD').replace(/[̀-ͯ]/g, "").toLowerCase().includes(event.target.value.normalize('NFD').replace(/[̀-ͯ]/g, "").toLowerCase())) {
          filter.value.push(elemento);
        }
      }
    });
  }
  else {
    filter.value = [];
  }

}

</script>

<style scoped>
.search-toolbar {
  --background: var(--ion-toolbar-background);
  --padding-top: 0;
  --padding-bottom: 4px;
}

.search-toolbar ion-searchbar {
  --background: #ffffff;
  --border-radius: 12px;
  --box-shadow: none;
  padding-top: 0;
}

ion-toolbar ion-button[fill="outline"] {
  --border-color: rgba(255, 255, 255, .5);
  --color: #fff;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .5px;
  color: var(--app-muted);
  margin: 4px 4px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.count {
  background: var(--ion-color-primary);
  color: #fff;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 12px;
}

.lista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.producto {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--app-surface);
  border: 1px solid var(--app-border);
  border-left: 4px solid transparent;
  border-radius: var(--app-radius);
  box-shadow: var(--app-shadow);
  padding: 12px;
}

.producto.en-pedido {
  border-left-color: var(--ion-color-primary);
}

.info {
  flex: 1;
  min-width: 0;
}

.nombre {
  font-weight: 600;
  font-size: 16px;
  line-height: 1.25;
}

.precios {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
  font-weight: 700;
  color: #495057;
  cursor: pointer;
}

.tachado {
  text-decoration: line-through;
  font-weight: 400;
  color: var(--app-muted);
}

.precio-custom {
  background: var(--app-busy-bg);
  color: var(--app-busy);
  padding: 1px 8px;
  border-radius: 6px;
}

.herramientas {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.descuento,
.link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  padding: 4px 8px;
  background: #f8f9fa;
  color: #495057;
  font-family: inherit;
}

.descuento select {
  border: none;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  color: inherit;
  outline: none;
}

.stepper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.step {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--app-border);
  background: #f1f3f5;
  color: #212529;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step.add {
  background: var(--ion-color-primary);
  border-color: var(--ion-color-primary);
  color: #fff;
}

.step:active,
.agregar:active {
  transform: scale(.94);
}

.qty {
  min-width: 26px;
  text-align: center;
  font-size: 18px;
  font-weight: 800;
}

.agregar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: none;
  background: var(--ion-color-primary);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
}
</style>
