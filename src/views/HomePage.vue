<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
     
      <div id="container"> 
        {{ count }} - 
        {{ doubleCount }}
        <button @click="increments"> boton</button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
const comanda = useComanda();
const { count, doubleCount } = storeToRefs(comanda);
const { increments } =comanda;
</script>


