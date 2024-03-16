<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Wistubar</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
     
      <div id="container"> 
        

        <div class="mesa" v-for="mesa in mesas" :key="mesa.id">
          
          <ion-card v-if="mesa.abierta == false">
            <ion-card-header>
              <ion-card-title>
                <router-link :to=" {path:'/mesa/'+mesa.id}">{{ mesa.id }}</router-link>
              </ion-card-title>
            </ion-card-header>
          </ion-card>

          <ion-card v-if="mesa.abierta == true" style="background-color: red; color: white;">
            <ion-card-header>
              <ion-card-title>
                <router-link style="color: white;" :to=" {path:'/mesa/'+mesa.id}">{{ mesa.id }}</router-link>
              </ion-card-title>
            </ion-card-header>
          </ion-card>

          <ion-card v-if="mesa.abierta == undefined">
            <ion-card-header>
              <ion-card-title>
                <router-link :to=" {path:'/mesa/'+mesa.id}">{{ mesa.id }}</router-link>
              </ion-card-title>
            </ion-card-header>
          </ion-card>
          
        </div>
        {{ count }} - 
        {{ doubleCount }}
        <button @click="increments"> boton</button>

        <div class="text-red-600 font-mono text-3xl font-bold">Tailwind CSS en Vue 3</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
import { IonCard, IonCardHeader, IonCardTitle } from '@ionic/vue';
import { ref, onMounted} from "vue"

const comanda = useComanda();
const { count, mesas, doubleCount } = storeToRefs(comanda);
const { increments, getMesas, getCompra } = comanda;

const mesaAbiertas = ref({});
const mesaAbiertasNumero = ref({});
// funcion que ejecuta la llamada a las mesas
getMesas();



 
 

</script>

