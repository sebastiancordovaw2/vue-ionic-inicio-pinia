<template>
    <ion-page>
      <ion-header :translucent="true">
        <ion-toolbar>
          <ion-title>Mesa {{mesa}}</ion-title>
          <ion-button @click="terminarVenta(mesa)" color="danger">Terminar Venta</ion-button>
        </ion-toolbar>
      </ion-header>
  
      <ion-content :fullscreen="true">
       
        <div id="container"> 

        <ion-list v-for="f in resultadoFinal" :key="f.id">
          <ion-item>
            <ion-grid>
                <ion-row>
                <ion-col size="5">{{ f.nombre }}</ion-col>
                <ion-col >{{ f.cantidad }}</ion-col>
                <ion-col>{{ f.precio }}</ion-col>
                <ion-col>{{ f.cantidad*f.precio }}</ion-col>
                <ion-col><ion-button @click="eliminarCompra(mesa,f)" color="danger" shape="round">-</ion-button></ion-col>
                </ion-row>
            </ion-grid>

            </ion-item>
        </ion-list>



        <ion-list v-if="total>0">
          <ion-item>
            <ion-grid>
                <ion-row>
                    <ion-col>Total {{ total }}</ion-col>
                </ion-row>
                <ion-row>
                    <ion-col> Propina {{ total * 0.1 }}</ion-col>
                </ion-row>
                <ion-row>
                    <ion-col>Total a pagar {{ (total * 0.1) +  total}}</ion-col>
                </ion-row>
            </ion-grid>

            </ion-item>
        </ion-list>


          

        </div>
      </ion-content>
    </ion-page>
  </template>
  
  <script setup lang="ts">
  import { IonContent, IonHeader, IonPage, IonToolbar, IonSearchbar, IonItem, IonLabel, IonList, IonButton, IonBadge, IonCol, IonGrid, IonRow} from '@ionic/vue';
  import { storeToRefs } from 'pinia';
  import { useComanda } from '../stores/comanda.js';
  import { useRoute } from 'vue-router'
  import { ref, onMounted} from "vue"
  const mesa = ref(0);

  const total = ref(0);

  const route = useRoute()
  const comanda = useComanda();
  let { getCompra, setCompraCarro, eliminarCompra , terminarVenta } = comanda;
  
  mesa.value = route.params.id;

  const compraUsuario = ref({});
  const resultadoFinal= ref([]);

    let v = JSON.parse(localStorage.getItem("compra"));
    if(getCompra()[mesa.value]==undefined)
    {
        compraUsuario.value = (v[mesa.value]!=null)?v[mesa.value]:{};
        setCompraCarro(v);
    }
    else
    {
        compraUsuario.value = getCompra()[mesa.value]
    }

    for (let index = 0; index < compraUsuario.value.length; index++) {
        if(compraUsuario.value[index]!=null)
        {
            
            for (let j = 0; j < compraUsuario.value[index].length; j++) {
                
                if(compraUsuario.value[index][j]!=null)
                {
                    resultadoFinal.value.push(compraUsuario.value[index][j]);
                }
            }
        } 
        
        
        

    }

    for (let index = 0; index < resultadoFinal.value.length; index++) {
         total.value += resultadoFinal.value[index].precio * resultadoFinal.value[index].cantidad;
    }

    console.log(total, "el total");

    console.log(resultadoFinal.value, "resultado final");
  </script>
  
  