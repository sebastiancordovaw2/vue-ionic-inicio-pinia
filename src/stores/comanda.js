import {defineStore} from 'pinia'

export const useComanda = defineStore("comanda",{
    state:()=>({
        count:1,
        mesas:(localStorage.getItem("mesas")!=null)?JSON.parse(localStorage.getItem("mesas")):{},
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

                    if(!this.mesas.length)
                    {
                        const res = await fetch("https://sebastiancordovaw2.github.io/vue-ionic-inicio-pinia/mesas.json");
                        const data = await res.json();
                        this.mesas = data;
                    }

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
                            
                            
                            if(mesaAbiertasNumero[x]==this.mesas[index].id)
                            {
                                this.mesas[index].abierta = true;
                                if(mesaAbiertasNumero[x].etiqueta)
                                {
                                    this.mesas[index].etiqueta = mesaAbiertasNumero[x].etiqueta;
                                }
                               
                                break;
                            }
                            else{
                                this.mesas[index].abierta = false;
                            }
                        
                        }
                        
                    }
    
                    localStorage.setItem("mesas",JSON.stringify(this.mesas));
                }
                catch(error){
                    console.log(error);
                }
            
            
            
        },
        cambiarEtiqueta(mesa){
            const etiqueta = prompt("Colocal etiqueta");
            if(etiqueta.trim())
            {
                this.mesas = this.mesas.map(objeto => {
                    if(objeto.id == mesa.id)
                    {
                         objeto.etiqueta = etiqueta.trim()
                    }
                    return objeto;
                });
            }

            localStorage.setItem("mesas",JSON.stringify(this.mesas));
           
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
           
            if(this.carrito[mesa] == undefined)
            {
                this.carrito[mesa] = new Array();
            }

            let idABuscar = producto.id;
            let objetoEncontrado = Object.values(this.carrito[mesa]).find(objeto => objeto.id === idABuscar); 
           
            if(!objetoEncontrado)
            {
                producto.cantidad = 1;
                this.carrito[mesa].push(producto);
            }
            else{
                this.carrito[mesa] = this.carrito[mesa].map(objeto => {
                   if(objeto.id == producto.id)
                   {
                     objeto.cantidad +=1;
                   }
                   return objeto;
                  });
            }

            console.log(this.carrito[mesa]);
        
            localStorage.setItem("carrito",JSON.stringify(this.carrito));
            return this.carrito;
        },
        setCarritoEliminar(mesa,producto, index)
        {
            this.carrito[mesa] = this.carrito[mesa].filter((objeto, index) => {
           
            if(objeto.id == producto.id)
            {
                objeto.cantidad -=1;
            }

            if( objeto.cantidad > 0)
            {
                return objeto;
            }
            
           });
           localStorage.setItem("carrito",JSON.stringify(this.carrito))
           return this.carrito;
        },
        setCompra(mesa)
        {
            if(localStorage.getItem("compra"))
            {
                this.compra = JSON.parse(localStorage.getItem("compra"));
            }

            let date = new Date();


            const horas = (date.getHours()<10)?"0".concat(date.getHours()):date.getHours();
            const minutos = (date.getMinutes()<10)?"0".concat(date.getMinutes()):date.getMinutes();
            const horaViwe = horas+":"+minutos

            if(this.carrito[mesa] != undefined)
            {
                for (let index = 0; index < this.carrito[mesa].length; index++) {
                    if(this.carrito[mesa][index] != null)
                    {
                        this.carrito[mesa][index].horaViwe = horaViwe;
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

                let cantidad =  Object.keys(this.compra[mesa])[Object.keys(this.compra[mesa]).length - 1];

                if(cantidad == undefined){cantidad = 0}
                
                this.compra[mesa][parseInt(cantidad)+1] = this.carrito[mesa];

                delete this.carrito[mesa];

                localStorage.setItem("carrito",JSON.stringify(this.carrito));
                localStorage.setItem("compra",JSON.stringify(this.compra));

                window.location.href = '/vue-ionic-inicio-pinia/#/compra/'+mesa; 

            }
        },
        getCompra()
        {
            return this.compra;
        },
        eliminarCompra(mesa, producto)
        {
            if (confirm("Eleiminar venta?!") == true) {
                delete this.compra[mesa][producto.index][producto.j];
                localStorage.setItem("compra", JSON.stringify(this.compra));
                window.location.href = '/vue-ionic-inicio-pinia/#/compra/'+mesa;
            }
        },
        terminarVenta(mesa)
        {
            if (confirm("Press a button!") == true) {
                if(this.compra[mesa] != undefined)
                {
                    delete this.compra[mesa]
                    localStorage.setItem("compra", JSON.stringify(this.compra));

                    this.mesas = this.mesas.map(objeto => {
                        if(objeto.id == mesa)
                        {
                            objeto.etiqueta = "";
                            objeto.abierta = false;
                        }
                        return objeto;
                    })
                    localStorage.setItem("mesas", JSON.stringify(this.mesas));
                    window.location.href = '/vue-ionic-inicio-pinia/#/mesas';
                }
                
              }
            
        },
        cambiarPrecio(mesa,producto)
        {
            if( this.carrito[mesa])
            {
            const precioInput = prompt("Cambiar Precio");
           
                if(parseInt(precioInput)>0)
                {
                    
                        let encontrado = false;
                        for (let index = 0; index < this.carrito[mesa].length; index++) {
                            
                            if( this.carrito[mesa][index].id == producto.id)
                            {
                                this.carrito[mesa][index].precioCustom = precioInput;
                                encontrado = true;
                                break;
                            }
                            else
                            {
                                encontrado = false;
                            }
                        }

                        if(!encontrado)
                        {
                            alert("Agrega el producto");
                        }
                    }
                    
                    
                }else{
                    alert("Agrega el producto"); 
                }           
        }
    },
    
})