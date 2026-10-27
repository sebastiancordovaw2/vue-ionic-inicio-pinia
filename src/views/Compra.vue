<template>
    <ion-page>
        <ion-header :translucent="true">
            <ion-toolbar>
                <ion-title>Mesa {{ mesa }}</ion-title>

                <ion-button @click="terminarVenta(mesa)" color="danger">
                    Terminar Venta
                </ion-button>

                <ion-button color="default">
                    <a href="#/mesas/">Ir a las mesas</a>
                </ion-button>
            </ion-toolbar>
        </ion-header>

        <ion-content :fullscreen="true">
            <div id="container">

                <ion-list v-for="f in resultadoFinal" :key="`${f.index}-${f.j}`">
                    <ion-item>
                        <ion-grid>
                            <ion-row>
                                <ion-col size="5">
                                    <ion-badge color="danger">
                                        {{ f.data.horaViwe }}
                                    </ion-badge>
                                    <br />
                                    {{ f.data.nombre }}
                                </ion-col>

                                <ion-col>
                                    {{ f.data.cantidad }}
                                </ion-col>

                                <ion-col>
                                    {{ f.data.precio }}
                                    <br v-if="f.data.precioCustom" />

                                    <ion-badge v-if="f.data.precioCustom" color="danger">
                                        {{ f.data.precioCustom }}
                                    </ion-badge>
                                </ion-col>

                                <ion-col>
                                    {{
                                        f.data.cantidad *
                                        (f.data.precioCustom || f.data.precio)
                                    }}
                                </ion-col>

                                <ion-col>
                                    <ion-button @click="eliminarCompraProducto(mesa, f)" color="dark" shape="round">
                                        -
                                    </ion-button>

                                    <ion-button @click="agregarCompraProducto(mesa, f)" color="dark" shape="round">
                                        +
                                    </ion-button>

                                    <ion-button @click="eliminarCompra(mesa, f)" color="danger" shape="round">
                                        Eliminar
                                    </ion-button>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-item>
                </ion-list>

                <ion-list v-if="resultadoFinal.length > 0">
                    <ion-item>
                        <ion-grid>
                            <ion-row>
                                <ion-col>
                                    Rebaja del

                                    <select :value="rebaja" @change="porcentage($event.target.value)">
                                        <option v-for="porcentaje in [0, 10, 20, 30, 40, 50, 60, 70, 80, 90]"
                                            :key="porcentaje" :value="porcentaje">
                                            {{ porcentaje }}%
                                        </option>
                                    </select>
                                </ion-col>
                            </ion-row>

                            <ion-row>
                                <ion-col>
                                    Total original: {{ formatoPrecio(total) }}
                                </ion-col>
                            </ion-row>

                            <ion-row>
                                <ion-col>
                                    Descuento:
                                    {{ formatoPrecio(total - totalRebajado) }}
                                </ion-col>
                            </ion-row>

                            <ion-row>
                                <ion-col>
                                    <strong>
                                        Total rebajado:
                                        {{ formatoPrecio(totalRebajado) }}
                                    </strong>
                                </ion-col>
                            </ion-row>

                            <ion-row>
                                <ion-col>
                                    Propina (10%):
                                    {{ formatoPrecio(propina) }}
                                </ion-col>
                            </ion-row>

                            <ion-row>
                                <ion-col>
                                    <strong>
                                        Total a pagar:
                                        {{ formatoPrecio(totalPagar) }}
                                    </strong>
                                </ion-col>
                            </ion-row>
                        </ion-grid>
                    </ion-item>
                </ion-list>

            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import {
    IonContent,
    IonHeader,
    IonPage,
    IonToolbar,
    IonTitle,
    IonItem,
    IonList,
    IonButton,
    IonBadge,
    IonCol,
    IonGrid,
    IonRow
} from '@ionic/vue';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
import { useRoute } from 'vue-router';
import { ref, computed, watch } from 'vue';

const mesa = ref(0);
const rebaja = ref(0);

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

// Calcula el total con descuento.
const totalRebajado = computed(() => {
    return total.value * (1 - Number(rebaja.value) / 100);
});

// La propina se calcula sobre el total rebajado.
const propina = computed(() => {
    return Math.round(totalRebajado.value * 0.10);
});

// Total final incluyendo propina.
const totalPagar = computed(() => {
    return Math.round(totalRebajado.value) + propina.value;
});

function porcentage(valor) {
    rebaja.value = Number(valor);
}

function formatoPrecio(valor) {
    return '$' + Math.round(valor).toLocaleString('es-CL');
}
</script>
