<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-button color="success" @click="setCompra(mesa)">Mesa {{ mesa }} Aceptar</ion-button>
        <a style="color: white; text-decoration: none;" :href="linkMesa"><ion-button color="dark" >Venta</ion-button></a>
        
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div id="container"> 
        <ion-searchbar @ionInput="search($event)"></ion-searchbar>
        
        <ion-list v-for="(f,k) in filter" :key="f.id">
          <ion-item>
          <ion-grid>
            <ion-row>
              
              <ion-col size="8">
                <ion-label>{{ f.nombre }}</ion-label>
              </ion-col>
              <ion-col><ion-label @click="cambiarPrecio(mesa,f)">{{ f.precio }}</ion-label></ion-col>
              <ion-col>
                <ion-badge style="margin-top: 7px; margin-right: 5px;" v-if="carritoGuardado && carritoGuardado[mesa] && verificarCantidad(f)" color="primary">{{verificarCantidad3(f)}}</ion-badge>
                
                <ion-button @click="setCarritoAgregarF(mesa,f)" color="dark" shape="round">+</ion-button>
                <ion-button v-if="carritoGuardado && carritoGuardado[mesa] && verificarCantidad(f)" @click="setCarritoEliminarF(mesa,f)" color="dark" shape="round">-</ion-button>
              </ion-col>
            </ion-row>
          </ion-grid>

          </ion-item>
      </ion-list>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useComanda } from '../stores/comanda.js';
const comanda = useComanda();
let { carrito } = storeToRefs(comanda);
const { setCarritoAgregar, setCarritoEliminar, setCarrito, setCompra, cambiarPrecio } = comanda;
import {IonContent, IonHeader, IonPage, IonToolbar, IonSearchbar, IonItem, IonLabel, IonList, IonButton, IonBadge, IonCol, IonGrid, IonRow} from '@ionic/vue';
import Papa from "papaparse";
import { ref, onMounted} from "vue"
import { useRoute } from 'vue-router'

const productos = ref([])
let carritoGuardado = ref({});
const filter = ref([])
const mesa = ref(0);
const route = useRoute()
let linkMesa = "";



let verificarCantidad= ref(false);
let verificarCantidad2 = ref(false);
let verificarCantidad3 = ref(0);
 

onMounted(() => {

  mesa.value = route.params.id;
  linkMesa = "/compra/"+mesa.value;
  getProductos();
  if(carrito.length==undefined)
  {
    carritoGuardado.value = (localStorage.getItem("carrito")!=null)?JSON.parse(localStorage.getItem("carrito")):{};
    setCarrito(carritoGuardado.value);
  }
  else
  {
    carritoGuardado.value = carrito;
  }

  verificarCantidad = (f):boolean =>{

    
    for (let index = 0; index < carritoGuardado.value[mesa.value].length; index++) {
      const element = carritoGuardado.value[mesa.value][index];
      if(element.id == f.id)
      {
        if(element.cantidad>0)
        {
          return true;
        }
      }
    }
 }


 verificarCantidad3 = (f):int =>{

    
for (let index = 0; index < carritoGuardado.value[mesa.value].length; index++) {
  const element = carritoGuardado.value[mesa.value][index];
  if(element.id == f.id)
  {
    if(element.cantidad>0)
    {
      return element.cantidad;
    }
  }
}
}
})




const setCarritoAgregarF = (mesa,producto) =>
{
  let carro = setCarritoAgregar(mesa,producto);
  carritoGuardado.value = carro;
}

const setCarritoEliminarF = (mesa,producto) =>
{
  let carro = setCarritoEliminar(mesa,producto);
  carritoGuardado.value = carro;
}
  
const getProductos = () =>
{
    Papa.parse("../../../productos2.csv",{
    download: true,
    encoding: "UTF-8",
    delimiter:";",
      complete:  function (results) {
        for(let i = 0; i<results.data.length; i++){

          if(productos.value[i] == undefined)
          {
            productos.value[i] = new Array();
          }
          productos.value[i]={
            "id":results.data[i][0],
            "categoria":results.data[i][1],
            "subcategoria":results.data[i][2],
            "codigo":results.data[i][3],
            "nombre":results.data[i][4],
            "descripcion":results.data[i][5],
            "precio":results.data[i][6],
            "activo":results.data[i][7]
          }
        }
      },
    });
}
 
const search = (event)=>{
  if(event.target.value.toLowerCase().trim()!="")
  {
    filter.value = [];
    for(let i = 0; i<productos.value.length; i++){
      if(productos.value[i].nombre != undefined)
      {
        if(productos.value[i].nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,"").toLowerCase().includes(event.target.value.normalize('NFD').replace(/[\u0300-\u036f]/g,"").toLowerCase()))
        {
          filter.value.push(productos.value[i]);
        }
      } 
    }
  }
  else{
    filter.value = [];
  }
 
}


</script>

