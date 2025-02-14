<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <a href='/vue-ionic-inicio-pinia/#/mesas/'>Wistubar</a>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
     
      <div id="container"> 
        

        <div class="mesa" v-for="mesa in mesas" :key="mesa.id">
          
          <ion-card v-if="mesa.abierta == false">
            <ion-card-header>
              <ion-card-title>
                <router-link :to=" {path:'/vue-ionic-inicio-pinia/#/mesa/'+mesa.id}">{{ mesa.id }}</router-link>
              </ion-card-title>
            </ion-card-header>
          </ion-card>

          <ion-card  v-if="mesa.abierta == true" style="background-color: red; color: white; position: relative;overflow:visible !important">
            <ion-card-header>
              <ion-card-title>
                <router-link style="color: white; font-size: 13px; top: -14px; position: relative;" :to=" {path:'/vue-ionic-inicio-pinia/#/mesa/'+mesa.id}">{{ mesa.id }} <span v-if="mesa.etiqueta"> - {{ mesa.etiqueta.charAt(0).toUpperCase() }}</span></router-link>
              </ion-card-title>
            </ion-card-header>

           
            <ion-button  :id="mesa.id"  style="position: absolute; bottom: -13px; left: -22px" v-if="mesa.abierta == true && mesa.etiqueta" color="success" shape="round"></ion-button>
            <ion-button @click="cambiarEtiqueta(mesa)"  style="position: absolute; bottom: -13px; right: -22px" v-if="mesa.abierta == true" color="primary" shape="round"></ion-button>
          </ion-card>
          
          <ion-popover v-if="mesa.abierta == true && mesa.etiqueta" :trigger="mesa.id">
             <ion-content class="ion-padding">{{ mesa.etiqueta }}</ion-content>
          </ion-popover>


          <ion-card v-if="mesa.abierta == undefined">
            <ion-card-header>
              <ion-card-title>
                <router-link :to=" {path:'/vue-ionic-inicio-pinia/#/mesa/'+mesa.id}">{{ mesa.id }}</router-link>
              </ion-card-title>
            </ion-card-header>
          </ion-card>
        </div>
      </div>


      
      
    </ion-content>
  </ion-page>
</template>

<script setup>
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonPopover, IonButton  } from '@ionic/vue';

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
import { IonCard, IonCardHeader, IonCardTitle } from '@ionic/vue';
import { ref, onMounted} from "vue"

const comanda = useComanda();
const { count, mesas, doubleCount} = storeToRefs(comanda);
const { increments, getMesas, getCompra, cambiarEtiqueta } = comanda;

const mesaAbiertas = ref({});
const mesaAbiertasNumero = ref({});
const ultimoToque = ref(0); 

const popoverOpen= ref(false);
const event =  ref(null);
// funcion que ejecuta la llamada a las mesas
getMesas();
  
</script>

