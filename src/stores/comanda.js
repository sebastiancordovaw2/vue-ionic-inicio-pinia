import {defineStore} from 'pinia'

export const useComanda = defineStore("comanda",{
    state:()=>({
        count:1,
        mesas:[],
        carrito:{},
        compra:{},
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
                let mesaAbiertas={};
                let mesaAbiertasNumero=[];
                    let v = JSON.parse(localStorage.getItem("compra"));
                    if(v!=undefined)
                    {
                    mesaAbiertas = (v!=null)?v:{};
                    }
                    else
                    {
                    mesaAbiertas = {};
                    }
                    
                    mesaAbiertasNumero = Object.keys(mesaAbiertas);

                    

                for (let index = 0; index < this.mesas.length; index++) {
                    for (let x = 0; x < mesaAbiertasNumero.length; x++) {
                        
                        console.log(mesaAbiertasNumero[x], this.mesas[index].id, "abiertas");
                        if(mesaAbiertasNumero[x]==this.mesas[index].id)
                        {
                            this.mesas[index].abierta = true;
                            break;
                        }
                        else{
                            this.mesas[index].abierta = false;
                        }
                    
                    }
                    
                }
            console.log(this.mesas)  
            }
            catch(error){
                console.log(error);
            }
            
        },
        setCarrito(carro)
        {
            this.carrito = carro;
           
        },
        setCompraCarro(compra)
        {
            this.compra = compra; 
        },
        setCarritoAgregar(mesa,producto)
        {
            console.log(this.carrito);

            if(this.carrito[mesa] == undefined)
            {
                this.carrito[mesa] = new Array();
            }

            if(this.carrito[mesa][producto.id] == undefined)
            {
                this.carrito[mesa][producto.id] = new Array();
            }

            if(this.carrito[mesa][producto.id].id == producto.id)
            {
                this.carrito[mesa][producto.id].cantidad = this.carrito[mesa][producto.id].cantidad + 1
            }
            else
            {
                this.carrito[mesa][producto.id] = producto;
                this.carrito[mesa][producto.id].cantidad = 1
            } 

            

            localStorage.setItem("carrito",JSON.stringify(this.carrito));
            return this.carrito;
        },
        setCarritoEliminar(mesa,producto)
        {
            this.carrito[mesa][producto.id].cantidad = this.carrito[mesa][producto.id].cantidad - 1
            if( this.carrito[mesa][producto.id].cantidad == 0)
            {
                delete this.carrito[mesa][producto.id];
            }

            localStorage.setItem("carrito",JSON.stringify(this.carrito));
            return this.carrito;
        },
        setCompra(mesa)
        {
            if(localStorage.getItem("compra"))
            {
                this.compra = JSON.parse(localStorage.getItem("compra"));
            }
            
            let date = new Date();
            const hora = date.getHours()+""+date.getMinutes()+""+date.getSeconds();
            const horaViwe = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
            if(this.carrito[mesa] != undefined)
            {
                for (let index = 0; index < this.carrito[mesa].length; index++) {
                    if(this.carrito[mesa][index] != null)
                    {
                        this.carrito[mesa][index].horaViwe = horaViwe;
                        this.carrito[mesa][index].hora = hora;
                    }
                }

                if(this.compra[mesa] == undefined)
                {
                    if(localStorage.getItem("compra"))
                    {
                        let v = JSON.parse(localStorage.getItem("compra"));
                        if(v[mesa])
                        {
                            this.compra[mesa] =v[mesa];
                        }
                        else{
                            this.compra[mesa] = new Array();
                        }

                    }
                    else{
                        this.compra[mesa] = new Array();
                    }
                    
                }


                if(this.compra[mesa][hora] == undefined)
                {
                    this.compra[mesa][hora] = new Array();
                }

                this.compra[mesa][hora] = this.carrito[mesa];
    
                delete this.carrito[mesa];

                localStorage.setItem("carrito",JSON.stringify(this.carrito));
                localStorage.setItem("compra",JSON.stringify(this.compra));

                window.location.href = '/compra/'+mesa; 
            }
        },
        getCompra()
        {
            return this.compra;
        },
        eliminarCompra(mesa, producto)
        {
            delete this.compra[mesa][producto.hora][producto.id];
            localStorage.setItem("compra", JSON.stringify(this.compra));
            window.location.reload(); 
        },
        terminarVenta(mesa,)
        {
            if (confirm("Press a button!") == true) {
                if(this.compra[mesa] != undefined)
                {
                    delete this.compra[mesa]
                    localStorage.setItem("compra", JSON.stringify(this.compra));
                    window.location.href = '/mesas';
                }
                
              }
            
        }
    },
    
})