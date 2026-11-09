<template>
  <ion-page>
    <ion-header>
      <ion-toolbar class="app-toolbar">
        <div class="brand" slot="start">
          <ion-icon :icon="restaurantOutline" />
          <a href="/mesas/" class="app-title">Wistubar</a>
        </div>
        <div class="resumen" slot="end">
          <span class="chip chip-busy">{{ ocupadas }} ocupadas</span>
          <span class="chip chip-free">{{ libres }} libres</span>
          <button class="btn-sync" :disabled="sincronizando" @click="sincronizar" aria-label="Sincronizar productos">
            <ion-spinner v-if="sincronizando" name="crescent" />
            <ion-icon v-else :icon="syncOutline" />
            <span class="btn-sync-text">Sincronizar</span>
          </button>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="app-container">
        <div class="leyenda">
          <span><i class="dot dot-free"></i> Libre</span>
          <span><i class="dot dot-busy"></i> Ocupada</span>
          <span class="hint">Toca una mesa para tomar el pedido</span>
        </div>

        <div class="grid">
          <div
            v-for="mesa in mesas"
            :key="mesa.id"
            class="mesa-tile"
            :class="mesa.abierta == true ? 'ocupada' : 'libre'"
            role="button"
            @click="abrirMesa(mesa)"
          >
            <div class="mesa-top">
              <span class="mesa-label">Mesa</span>
              <span class="estado">{{ mesa.abierta == true ? 'Ocupada' : 'Libre' }}</span>
            </div>

            <div class="mesa-numero">{{ mesa.id }}</div>

            <div class="mesa-etiqueta" :class="{ vacia: !mesa.etiqueta }">
              <span v-if="mesa.etiqueta" class="texto">{{ mesa.etiqueta }}</span>
              <span v-else class="texto">Sin etiqueta</span>
            </div>

            <button class="btn-etiqueta" @click.stop="abrirEtiqueta(mesa)">
              <ion-icon :icon="pricetagOutline" />
              {{ mesa.etiqueta ? 'Editar etiqueta' : 'Agregar etiqueta' }}
            </button>
          </div>
        </div>
      </div>

      <ion-modal :is-open="modalAbierto" @didPresent="enfocarInput" @didDismiss="cerrarEtiqueta" class="modal-etiqueta">
        <div class="modal-body">
          <div class="modal-header">
            <div>
              <div class="modal-sub">Mesa {{ mesaEditando?.id }}</div>
              <h2>Etiqueta de la mesa</h2>
            </div>
            <button class="cerrar" @click="cerrarEtiqueta" aria-label="Cerrar">
              <ion-icon :icon="closeOutline" />
            </button>
          </div>

          <p class="modal-ayuda">Escribe un nombre para identificar de quién es la mesa.</p>

          <ion-input
            ref="inputEtiqueta"
            v-model="textoEtiqueta"
            class="input-etiqueta"
            fill="outline"
            placeholder="Ej: Mesa de los músicos"
            :maxlength="40"
            :counter="true"
            :clear-input="true"
            @keyup.enter="guardar"
          />

          <div class="modal-acciones">
            <ion-button v-if="mesaEditando?.etiqueta" fill="clear" color="danger" @click="quitar">
              <ion-icon slot="start" :icon="trashOutline" />
              Quitar
            </ion-button>
            <span class="spacer"></span>
            <ion-button fill="outline" color="medium" @click="cerrarEtiqueta">Cancelar</ion-button>
            <ion-button @click="guardar">
              <ion-icon slot="start" :icon="checkmarkOutline" />
              Guardar
            </ion-button>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonContent, IonHeader, IonPage, IonToolbar, IonIcon, IonModal, IonInput, IonButton, IonSpinner,
  toastController, onIonViewWillEnter, onIonViewDidEnter, onIonViewWillLeave
} from '@ionic/vue';
import { restaurantOutline, pricetagOutline, closeOutline, trashOutline, checkmarkOutline, syncOutline } from 'ionicons/icons';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
import { onMounted, computed, ref } from "vue"
import { useRouter } from 'vue-router';

const router = useRouter();
const comanda = useComanda();
const { mesas } = storeToRefs(comanda);
const { getMesas, guardarEtiqueta, crearIdClienteFunction, sincronizarProductos } = comanda;

// --- Sincronizar productos (productos.json) ---
const sincronizando = ref(false);

const avisar = async (message, color) => {
  const toast = await toastController.create({ message, color, duration: 2500, position: 'bottom' });
  await toast.present();
};

const sincronizar = async () => {
  sincronizando.value = true;
  try {
    const productos = await sincronizarProductos();
    await refrescarMesas();
    await avisar(`${productos.length} productos actualizados`, 'success');
  } catch (e) {
    console.error("Error al sincronizar productos:", e);
    await avisar('No se pudo sincronizar. Revisa la conexión.', 'danger');
  } finally {
    sincronizando.value = false;
  }
};

// --- Modal de etiqueta ---
const modalAbierto = ref(false);
const mesaEditando = ref(null);
const textoEtiqueta = ref("");
const inputEtiqueta = ref(null);

const abrirEtiqueta = (mesa) => {
  mesaEditando.value = mesa;
  textoEtiqueta.value = mesa.etiqueta || "";
  modalAbierto.value = true;
};

const cerrarEtiqueta = () => {
  modalAbierto.value = false;
  mesaEditando.value = null;
};

const enfocarInput = () => {
  inputEtiqueta.value?.$el?.setFocus();
};

const guardar = () => {
  if (mesaEditando.value) {
    guardarEtiqueta(mesaEditando.value.id, textoEtiqueta.value);
  }
  cerrarEtiqueta();
};

const quitar = () => {
  if (mesaEditando.value) {
    guardarEtiqueta(mesaEditando.value.id, "");
  }
  cerrarEtiqueta();
};

const lista = computed(() => Array.isArray(mesas.value) ? mesas.value : Object.values(mesas.value || {}));
const ocupadas = computed(() => lista.value.filter(m => m.abierta == true).length);
const libres = computed(() => lista.value.length - ocupadas.value);

const abrirMesa = (mesa) => {
  router.push({ path: '/mesa/' + mesa.id });
};

// Actualiza el estado de las mesas sin recargar la página.
// getMesas() calcula qué mesas están abiertas (según la compra guardada)
// y devuelve la lista; aquí la pasamos al store para que la vista reaccione.
const refrescarMesas = async () => {
  const actualizadas = await getMesas();
  if (Array.isArray(actualizadas)) {
    comanda.$patch({ mesas: actualizadas });
  }
};

// Cambios hechos en otra pestaña/ventana del mismo navegador
const onStorage = (e) => {
  if (e.key === null || e.key === 'compra' || e.key === 'mesas') refrescarMesas();
};

// Al volver a la app (cambio de pestaña, desbloqueo del teléfono, etc.)
const onVisible = () => {
  if (document.visibilityState === 'visible') refrescarMesas();
};

onMounted(() => {
  crearIdClienteFunction();
  refrescarMesas();
})

// Cada vez que se vuelve a esta pantalla (Ionic la mantiene en caché)
onIonViewWillEnter(refrescarMesas);

onIonViewDidEnter(() => {
  window.addEventListener('storage', onStorage);
  document.addEventListener('visibilitychange', onVisible);
});

onIonViewWillLeave(() => {
  window.removeEventListener('storage', onStorage);
  document.removeEventListener('visibilitychange', onVisible);
});
</script>

<style scoped>
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 8px;
  font-size: 20px;
}

.brand ion-icon {
  color: var(--ion-color-primary);
  font-size: 24px;
}

.brand a {
  color: #fff;
  text-decoration: none;
}

.resumen {
  display: flex;
  gap: 6px;
  padding-right: 8px;
}

.chip {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.chip-busy {
  background: rgba(224, 49, 49, .2);
  color: #ffa8a8;
}

.chip-free {
  background: rgba(47, 158, 68, .2);
  color: #8ce99a;
}

.leyenda {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: var(--app-muted);
  margin: 4px 4px 12px;
}

.leyenda span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.leyenda .hint {
  margin-left: auto;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.dot-free { background: var(--app-free); }
.dot-busy { background: var(--app-busy); }

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.mesa-tile {
  position: relative;
  background: var(--app-surface);
  border: 2px solid #c3eccb;
  border-radius: 18px;
  box-shadow: var(--app-shadow);
  padding: 12px;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: transform .08s ease, box-shadow .15s ease;
}

.mesa-tile:active {
  transform: scale(.98);
}

.mesa-tile.ocupada {
  background: var(--app-busy);
  border-color: var(--app-busy);
  color: #fff;
}

.mesa-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.mesa-label {
  opacity: .75;
}

.estado {
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}

.libre .estado {
  color: var(--app-free);
  background: var(--app-free-bg);
}

.ocupada .estado {
  background: rgba(255, 255, 255, .22);
}

.mesa-numero {
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mesa-etiqueta {
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 10px;
  background: #fff4e6;
  color: #d9480f;
}

.ocupada .mesa-etiqueta {
  background: #fff;
  color: var(--app-busy);
}

.mesa-etiqueta .texto {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.mesa-etiqueta.vacia {
  background: transparent;
  color: var(--app-muted);
  font-weight: 400;
  font-style: italic;
  font-size: 14px;
}

.ocupada .mesa-etiqueta.vacia {
  color: rgba(255, 255, 255, .8);
}

.btn-etiqueta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--app-border);
  background: #f8f9fa;
  color: #343a40;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
}

.ocupada .btn-etiqueta {
  background: rgba(0, 0, 0, .18);
  border-color: rgba(255, 255, 255, .35);
  color: #fff;
}

.btn-etiqueta:active {
  transform: scale(.97);
}

/* Modal */
.modal-body {
  padding: 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header h2 {
  margin: 2px 0 0;
  font-size: 20px;
  font-weight: 800;
}

.modal-sub {
  font-size: 13px;
  font-weight: 700;
  color: var(--ion-color-primary);
  text-transform: uppercase;
  letter-spacing: .5px;
}

.cerrar {
  border: none;
  background: #f1f3f5;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
}

.modal-ayuda {
  color: var(--app-muted);
  font-size: 14px;
  margin: 10px 0 14px;
}

.input-etiqueta {
  --border-radius: 12px;
  font-size: 17px;
}

.modal-acciones {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
}

.modal-acciones .spacer {
  flex: 1;
}

.btn-sync {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .4);
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
}

.btn-sync ion-icon {
  font-size: 18px;
}

.btn-sync ion-spinner {
  width: 18px;
  height: 18px;
  color: #fff;
}

.btn-sync:disabled {
  opacity: .7;
}

.btn-sync:active {
  transform: scale(.96);
}

@media (max-width: 560px) {
  .resumen .chip-free { display: none; }
}

@media (max-width: 480px) {
  .btn-sync-text { display: none; }
  .btn-sync { padding: 0 8px; }
  .leyenda .hint { display: none; }
  .resumen .chip-free { display: none; }
}
</style>

<style>
/* Tamaño del modal (fuera de scoped porque ion-modal se monta fuera del componente) */
ion-modal.modal-etiqueta {
  --width: min(92vw, 440px);
  --height: auto;
  --border-radius: 18px;
}
</style>
