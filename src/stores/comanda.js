import {defineStore} from 'pinia'

export const useComanda = defineStore("comanda",{
    state:()=>({
        count:1,
        mesas:(localStorage.getItem("mesas")!=null)?JSON.parse(localStorage.getItem("mesas")):{},
        carrito:{},
        compra:{},
        mesaAbiertas:[],
    }),
    getters:{
        doubleCount:(state)=>{
            return state.count * 2;
        }
        

    },
    actions:{
        crearIdClienteFunction()
        {
            if (localStorage.getItem('IDClienteSession') == undefined) {
                localStorage.setItem('IDClienteSession', crypto.randomUUID())
            }
        },
        increments(){
            this.count++;
        },
        async getMesas(){
        
                try{
                    console.log(this.mesas[localStorage.getItem('IDClienteSession')] , "mesas2");
                    if(this.mesas[localStorage.getItem('IDClienteSession')] == undefined)
                    {
                        this.mesas[localStorage.getItem('IDClienteSession')] = {}
                    }

                    if(!this.mesas[localStorage.getItem('IDClienteSession')].length)
                    {
                        const res = await fetch("https://sebastiancordovaw2.github.io/vue-ionic-inicio-pinia/mesas.json");
                        const data = await res.json();
                        this.mesas[localStorage.getItem('IDClienteSession')] = data;
                    }

                    let mesaAbiertasNumero=[];
                        let v = JSON.parse(localStorage.getItem("compra"));
                        let claves = []
                        if(v!=undefined)
                        {
                           
                            v.forEach((v, index) => {
                                if(v!=null)
                                {
                                    claves.push(index);
                                }
                               
                            });
                        }
                        mesaAbiertasNumero = claves;     
    
                    for (let index = 0; index < this.mesas[localStorage.getItem('IDClienteSession')].length; index++) {
                        for (let x = 0; x < mesaAbiertasNumero.length; x++) {
                            
                            if(mesaAbiertasNumero[x]==this.mesas[localStorage.getItem('IDClienteSession')][index].id)
                            {
                                this.mesas[localStorage.getItem('IDClienteSession')][index].abierta = true;
                                if(mesaAbiertasNumero[x].etiqueta)
                                {
                                    this.mesas[localStorage.getItem('IDClienteSession')][index].etiqueta = mesaAbiertasNumero[x].etiqueta;
                                }
                               
                                break;
                            }
                            else{
                                this.mesas[localStorage.getItem('IDClienteSession')][index].abierta = false;
                            }
                        
                        }
                        
                    }
    
                    localStorage.setItem("mesas",JSON.stringify(this.mesas[localStorage.getItem('IDClienteSession')]));
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
            this.carrito[localStorage.getItem('IDClienteSession')] = carro;
        },
        setCompraCarro(compra)
        {
            this.compra[localStorage.getItem('IDClienteSession')] = compra; 
        },
        setCarritoAgregar(mesa,producto)
        {
            if(this.carrito[localStorage.getItem('IDClienteSession')] == undefined)
            {
                this.carrito[localStorage.getItem('IDClienteSession')] = new Array();
            }
           
            if(this.carrito[localStorage.getItem('IDClienteSession')][mesa] == undefined)
            {
                this.carrito[localStorage.getItem('IDClienteSession')][mesa] = new Array();
            }

            let idABuscar = producto.id;
            let objetoEncontrado = Object.values(this.carrito[localStorage.getItem('IDClienteSession')][mesa]).find(objeto => objeto.id === idABuscar); 
           
            if(!objetoEncontrado)
            {
                producto.cantidad = 1;
                this.carrito[localStorage.getItem('IDClienteSession')][mesa].push(producto);
            }
            else{
                this.carrito[localStorage.getItem('IDClienteSession')][mesa] = this.carrito[localStorage.getItem('IDClienteSession')][mesa].map(objeto => {
                   if(objeto.id == producto.id)
                   {
                     objeto.cantidad +=1;
                   }
                   return objeto;
                  });
            }

            localStorage.setItem("carrito",JSON.stringify(this.carrito[localStorage.getItem('IDClienteSession')]));
            return this.carrito[localStorage.getItem('IDClienteSession')];
        },
        setCarritoEliminar(mesa,producto, index)
        {
            this.carrito[localStorage.getItem('IDClienteSession')][mesa] = this.carrito[localStorage.getItem('IDClienteSession')][mesa].filter((objeto, index) => {
           
            if(objeto.id == producto.id)
            {
                objeto.cantidad -=1;
            }

            if( objeto.cantidad > 0)
            {
                return objeto;
            }
            
           });
           localStorage.setItem("carrito",JSON.stringify(this.carrito[localStorage.getItem('IDClienteSession')]))
           return this.carrito[localStorage.getItem('IDClienteSession')];
        },
        setCompra(mesa)
        {
            if(localStorage.getItem("compra"))
            {
                this.compra[localStorage.getItem('IDClienteSession')] = JSON.parse(localStorage.getItem("compra"));
            }
            else{
                this.compra[localStorage.getItem('IDClienteSession')] = new Array()
            }

            let date = new Date();


            const horas = (date.getHours()<10)?"0".concat(date.getHours()):date.getHours();
            const minutos = (date.getMinutes()<10)?"0".concat(date.getMinutes()):date.getMinutes();
            const horaViwe = horas+":"+minutos

            if(this.carrito[localStorage.getItem('IDClienteSession')][mesa] != undefined)
            {
                for (let index = 0; index < this.carrito[localStorage.getItem('IDClienteSession')][mesa].length; index++) {
                    if(this.carrito[localStorage.getItem('IDClienteSession')][mesa][index] != null)
                    {
                        this.carrito[localStorage.getItem('IDClienteSession')][mesa][index].horaViwe = horaViwe;
                    }
                }

                if(this.compra[localStorage.getItem('IDClienteSession')]==undefined)
                {
                   this.compra[localStorage.getItem('IDClienteSession')] = new Array(); 
                }

                if( this.compra[localStorage.getItem('IDClienteSession')][mesa] == undefined)
                {
                    if(localStorage.getItem("compra"))
                    {
                        let v = JSON.parse(localStorage.getItem("compra"));
                        if(v[mesa])
                        {
                            this.compra[localStorage.getItem('IDClienteSession')][mesa] =v[mesa];
                        }
                        else{

                            this.compra[localStorage.getItem('IDClienteSession')][mesa] = new Array();
                        }
                    }
                    else{
                        this.compra[localStorage.getItem('IDClienteSession')][mesa] = new Array();
                    }
                }

                let cantidad =  Object.keys(this.compra[localStorage.getItem('IDClienteSession')][mesa])[Object.keys(this.compra[localStorage.getItem('IDClienteSession')][mesa]).length - 1];

                if(cantidad == undefined){cantidad = 0}
                
                this.compra[localStorage.getItem('IDClienteSession')][mesa][parseInt(cantidad)+1] = this.carrito[localStorage.getItem('IDClienteSession')][mesa];

                delete this.carrito[localStorage.getItem('IDClienteSession')][mesa];

                localStorage.setItem("carrito",JSON.stringify(this.carrito[localStorage.getItem('IDClienteSession')]));
                localStorage.setItem("compra",JSON.stringify(this.compra[localStorage.getItem('IDClienteSession')]));
                
                console.log(localStorage.getItem("compra"), "esto se compro");

                window.location.href = '/vue-ionic-inicio-pinia/#/compra/'+mesa; 

            }
        },
        getCompra()
        {
            return localStorage.getItem("compra");
        },
        eliminarCompra(mesa, producto)
        {
            if (confirm("Eliminar venta?") == true) {
                delete this.compra[localStorage.getItem('IDClienteSession')][mesa][producto.index][producto.j];
                localStorage.setItem("compra", JSON.stringify(this.compra[localStorage.getItem('IDClienteSession')]));
                window.location.href = '/vue-ionic-inicio-pinia/#/compra/'+mesa;
            }
        },
        terminarVenta(mesa)
        {
            this.getMesas();
            if (confirm("Terminar Venta?") == true) {
                if(this.compra[localStorage.getItem('IDClienteSession')][mesa] != undefined)
                {
                    
                    delete this.compra[localStorage.getItem('IDClienteSession')][mesa]
                    localStorage.setItem("compra", JSON.stringify(this.compra[localStorage.getItem('IDClienteSession')]));

                    this.mesas[localStorage.getItem('IDClienteSession')] = this.mesas[localStorage.getItem('IDClienteSession')].map(objeto => {
                        if(objeto.id == mesa)
                        {
                            objeto.etiqueta = "";
                            objeto.abierta = false;
                        }
                        return objeto;
                    })
                    localStorage.setItem("mesas", JSON.stringify(this.mesas[localStorage.getItem('IDClienteSession')]));
                    window.location.href = '/vue-ionic-inicio-pinia/#/mesas';
                }      
              }
            
        },
        cambiarPrecio(mesa,producto)
        {
            if( this.carrito[localStorage.getItem('IDClienteSession')][mesa])
            {
                const precioInput = prompt("Cambiar Precio");
           
                if(parseInt(precioInput)>0)
                {
                    
                        let encontrado = false;
                        for (let index = 0; index < this.carrito[localStorage.getItem('IDClienteSession')][mesa].length; index++) {
                            
                            if( this.carrito[localStorage.getItem('IDClienteSession')][mesa][index].id == producto.id)
                            {
                                this.carrito[localStorage.getItem('IDClienteSession')][mesa][index].precioCustom = precioInput;
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