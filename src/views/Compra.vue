<template>
    <ion-page>
        <ion-header>
            <ion-toolbar class="app-toolbar">
                <ion-buttons slot="start">
                    <ion-button href="#/mesas/" aria-label="Ir a las mesas">
                        <ion-icon slot="icon-only" :icon="arrowBackOutline" />
                    </ion-button>
                </ion-buttons>
                <div class="app-title">
                    Mesa {{ mesa }}
                    <small>Cuenta de la mesa</small>
                </div>
                <ion-buttons slot="end">
                    <ion-button fill="outline" color="success" @click="irAMesa">
                        <ion-icon slot="start" :icon="addOutline" />
                        Agregar
                    </ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="app-container">

                <div v-if="resultadoFinal.length == 0" class="app-empty">
                    <ion-icon :icon="receiptOutline" />
                    <strong>Esta mesa no tiene consumos</strong><br />
                    Toca “Agregar” para tomar un pedido
                </div>

                <div v-for="grupo in grupos" :key="grupo.index" class="grupo">
                    <div class="grupo-titulo">
                        <span>Pedido {{ grupo.numero }}</span>
                        <span v-if="grupo.hora" class="hora">
                            <ion-icon :icon="timeOutline" /> {{ grupo.hora }}
                        </span>
                    </div>

                    <div class="tarjeta">
                        <div v-for="f in grupo.items" :key="`${f.index}-${f.j}`" class="linea">
                            <div class="info">
                                <div class="nombre">{{ f.data.nombre }}</div>
                                <div class="precio-unit">
                                    <span :class="{ tachado: f.data.precioCustom }">{{ formatoPrecio(f.data.precio)
                                        }}</span>
                                    <span v-if="f.data.precioCustom" class="precio-custom">{{
                                        formatoPrecio(f.data.precioCustom) }}</span>
                                    <span class="c-unidad">c/u</span>
                                </div>
                            </div>

                            <div class="acciones">
                                <div class="stepper">
                                    <button class="step" @click="eliminarCompraProducto(mesa, f)"
                                        aria-label="Quitar uno">
                                        <ion-icon :icon="removeOutline" />
                                    </button>
                                    <span class="qty">{{ f.data.cantidad }}</span>
                                    <button class="step" @click="agregarCompraProducto(mesa, f)"
                                        aria-label="Agregar uno">
                                        <ion-icon :icon="addOutline" />
                                    </button>
                                </div>
                                <div class="subtotal">
                                    {{ formatoPrecio(f.data.cantidad * (f.data.precioCustom || f.data.precio)) }}
                                </div>
                                <button class="eliminar" @click="eliminarCompra(mesa, f)" aria-label="Eliminar">
                                    <ion-icon :icon="trashOutline" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="resultadoFinal.length > 0" class="tarjeta resumen">
                    <div class="fila">
                        <span>Total original</span>
                        <span>{{ formatoPrecio(total) }}</span>
                    </div>
                    <div class="fila">
                        <span>Propina (10%)</span>
                        <span>{{ formatoPrecio(propina) }}</span>
                    </div>
                    <div class="fila total">
                        <span>Total a pagar</span>
                        <span>{{ formatoPrecio(totalPagar) }}</span>
                    </div>
                </div>

            </div>
        </ion-content>

        <ion-footer class="ion-no-border">
            <div class="app-footer-bar">
                <div class="app-footer-inner">
                    <ion-button size="large" expand="block" class="btn-terminar" @click="terminarVenta(mesa)"
                        color="danger">
                        <ion-icon slot="start" :icon="checkmarkDoneOutline" />
                        Terminar venta
                    </ion-button>
                </div>
            </div>
        </ion-footer>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonHeader,
    IonFooter,
    IonPage,
    IonToolbar,
    IonButtons,
    IonButton,
    IonIcon
} from '@ionic/vue';
import {
    arrowBackOutline, addOutline, removeOutline, trashOutline,
    receiptOutline, timeOutline, checkmarkDoneOutline
} from 'ionicons/icons';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
import { useRoute } from 'vue-router';
import { ref, computed, watch } from 'vue';

const mesa = ref(0);

const route = useRoute();
const comanda = useComanda();

const {
    getMesas,
    getCompra,
    setCompraCarro,
    eliminarCompra,
    eliminarCompraProducto,
    agregarCompraProducto,
    terminarVenta,
    crearIdClienteFunction
} = comanda;

mesa.value = route.params.id;

const compraUsuario = ref({});
const resultadoFinal = ref([]);

crearIdClienteFunction();
getMesas();

const v = JSON.parse(localStorage.getItem('compra') || '{}');

if (getCompra()[1][mesa.value] === undefined) {
    compraUsuario.value = v[mesa.value] != null
        ? v[mesa.value]
        : {};

    setCompraCarro(v);
} else {
    compraUsuario.value = getCompra()[mesa.value];
}

const compraUsuarioArray = compraUsuario.value;

for (let index = 0; index < compraUsuarioArray.length; index++) {
    if (compraUsuarioArray[index] != null) {
        for (let j = 0; j < compraUsuarioArray[index].length; j++) {
            if (compraUsuarioArray[index][j] != null) {
                resultadoFinal.value.push({
                    data: compraUsuarioArray[index][j],
                    index,
                    j
                });
            }
        }
    }
}

// Agrupa las líneas por pedido enviado (cada "Aceptar" crea un pedido nuevo).
const grupos = computed(() => {
    const mapa = new Map();
    resultadoFinal.value.forEach((item) => {
        if (!mapa.has(item.index)) {
            mapa.set(item.index, { index: item.index, hora: item.data.horaViwe, items: [] });
        }
        mapa.get(item.index).items.push(item);
    });
    return Array.from(mapa.values()).map((g, i) => ({ ...g, numero: i + 1 }));
});

const irAMesa = () => {
    window.location.href = '/#/mesa/' + mesa.value;
    window.location.reload(true);
};

// Calcula el total original sin modificarlo.
const total = computed(() => {
    return resultadoFinal.value.reduce((acumulado, item) => {
        const producto = item.data;
        const precio = producto.precioCustom != null
            && producto.precioCustom !== ''
            ? Number(producto.precioCustom)
            : Number(producto.precio);

        return acumulado + precio * Number(producto.cantidad || 0);
    }, 0);
});

// La propina se calcula sobre el total original.
const propina = computed(() => {
    return Math.round(total.value * 0.10);
});

// Total final incluyendo propina.
const totalPagar = computed(() => {
    return Math.round(total.value) + propina.value;
});

function formatoPrecio(valor) {
    return '$' + Math.round(valor).toLocaleString('es-CL');
}
</script>

<style scoped>
.btn-terminar {
    flex: 1;
    margin: 0;
}

ion-toolbar ion-button[fill="outline"] {
    --border-color: rgba(255, 255, 255, .5);
    --color: #fff;
}

.grupo {
    margin-bottom: 16px;
}

.grupo-titulo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .5px;
    color: var(--app-muted);
    margin: 4px 4px 8px;
}

.hora {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: #fff4e6;
    color: var(--ion-color-primary);
    border-radius: 999px;
    padding: 2px 10px;
}

.tarjeta {
    background: var(--app-surface);
    border: 1px solid var(--app-border);
    border-radius: var(--app-radius);
    box-shadow: var(--app-shadow);
    overflow: hidden;
}

.linea {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 12px;
    padding: 12px;
}

.linea+.linea {
    border-top: 1px solid var(--app-border);
}

.info {
    flex: 1 1 180px;
    min-width: 0;
}

.nombre {
    font-weight: 600;
    font-size: 16px;
}

.precio-unit {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--app-muted);
    margin-top: 2px;
}

.tachado {
    text-decoration: line-through;
}

.precio-custom {
    background: var(--app-busy-bg);
    color: var(--app-busy);
    font-weight: 700;
    padding: 0 6px;
    border-radius: 6px;
}

.acciones {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
}

.stepper {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f1f3f5;
    border-radius: 999px;
    padding: 3px;
}

.step {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: #fff;
    color: #212529;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, .1);
}

.step:active,
.eliminar:active {
    transform: scale(.92);
}

.qty {
    min-width: 24px;
    text-align: center;
    font-weight: 800;
}

.subtotal {
    min-width: 80px;
    text-align: right;
    font-weight: 700;
}

.eliminar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: none;
    background: var(--app-busy-bg);
    color: var(--app-busy);
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.resumen {
    padding: 4px 16px;
}

.fila {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    color: #495057;
}

.fila+.fila {
    border-top: 1px dashed var(--app-border);
}

.fila.total {
    font-size: 18px;
    font-weight: 800;
    color: var(--ion-text-color);
}
</style>
