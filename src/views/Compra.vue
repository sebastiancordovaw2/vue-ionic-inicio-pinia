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
                <ion-col size="5">
                  <ion-badge color="danger">{{ f.data.horaViwe }}</ion-badge><br/>
                  {{ f.data.nombre }}
                </ion-col>
                <ion-col >{{ f.data.cantidad }}</ion-col>
                <ion-col>{{ f.data.precio  }} <br v-if="f.data.precioCustom" /><ion-badge v-if="f.data.precioCustom" color="danger">{{ f.data.precioCustom }}</ion-badge></ion-col>
                <ion-col>{{ f.data.cantidad * ((f.data.precioCustom)?f.data.precioCustom:f.data.precio )}}</ion-col>
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
  
  <script setup>
  import { IonContent, IonHeader, IonPage, IonToolbar, IonSearchbar, IonItem, IonLabel, IonList, IonButton, IonBadge, IonCol, IonGrid, IonRow} from '@ionic/vue';
  import { storeToRefs } from 'pinia';
  import { useComanda } from '../stores/comanda.js';
  import { useRoute } from 'vue-router'
  import { ref, onMounted} from "vue"
  const mesa = ref(0);

  const total = ref(0);

  const route = useRoute()
  const comanda = useComanda();
  let { getMesas, getCompra, setCompraCarro, eliminarCompra , terminarVenta } = comanda;
  
  mesa.value = route.params.id;

  const compraUsuario = ref({});
  const resultadoFinal= ref([]);
  getMesas();
    let v = JSON.parse(localStorage.getItem("compra"));
    if(getCompra()[1][mesa.value]==undefined)
    {
        compraUsuario.value = (v[mesa.value]!=null)?v[mesa.value]:{};
        setCompraCarro(v);
    }
    else
    {
        compraUsuario.value = getCompra()[mesa.value]
    }
    const compraUsuarioArray =  compraUsuario.value;
    for (let index = 0; index <compraUsuarioArray.length; index++) {
        if(compraUsuarioArray[index]!=null)
        {
            
            for (let j = 0; j < compraUsuarioArray[index].length; j++) {
                
                if(compraUsuarioArray[index][j]!=null)
                {
                    resultadoFinal.value.push({data:compraUsuarioArray[index][j],index,j});
                }
            }
        }  

    }

    const resultadoFinalArray = resultadoFinal.value

    for (let index = 0; index < resultadoFinalArray.length; index++) {
         total.value += ((resultadoFinalArray[index].data.precioCustom)?resultadoFinalArray[index].data.precioCustom:resultadoFinalArray[index].data.precio) * resultadoFinalArray[index].data.cantidad;
    }

  </script>
  
  