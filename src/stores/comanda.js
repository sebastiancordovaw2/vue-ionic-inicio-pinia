import {defineStore} from 'pinia'
export const useComanda = defineStore("comanda",{
    state:()=>({
        count:1,
        mesas:[]
    }),
    getters:{
        doubleCount:(state)=>{
            return state.count * 2;
        }
    },
    actions:{
        increments(){
            this.count++;
        },
        async getMesas(){
            try{
                const res = await fetch("mesas.json");
                const data = await res.json();
                this.mesas = data;
            }
            catch(error){
                console.log(error);
            }
            
        }
    }
})