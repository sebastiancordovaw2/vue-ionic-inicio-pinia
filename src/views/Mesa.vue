<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Blank</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
     
      <div id="container"> 
        
        <ion-searchbar @ionInput="search($event)"></ion-searchbar>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
const comanda = useComanda();

import { IonSearchbar } from '@ionic/vue';

const search = (event) =>
{
 console.log(event.target.value.toLowerCase());
}
</script>

