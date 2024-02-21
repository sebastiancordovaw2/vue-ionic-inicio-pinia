import {defineStore} from 'pinia'
export const useComanda = defineStore("comanda",{
    state:()=>({
        count:1
    }),
    getters:{
        doubleCount:(state)=>{
            return state.count * 2;
        }
    },
    actions:{
        increments(){
            this.count++;
        }
    }
})