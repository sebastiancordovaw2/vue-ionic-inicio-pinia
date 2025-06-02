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

                localStorage.setItem('IDClienteSession', crypto.randomUUID()+'-'+Date.now())
            }
        },
        increments(){
            this.count++;
        },
        dirigirCompra(mesa)  
        {
            window.location.href = '/#/compra/'+mesa; 
            window.location.reload(true);
        },
        async getMesas(){
        
            try {
                // Paso 1: Obtener mesas del localStorage o del servidor
                let mesas = JSON.parse(localStorage.getItem('mesas'));
                if (!mesas) {
                    const res = await fetch("https://comanda-wistubar.netlify.app//mesas.json");
                    mesas = await res.json();
                }

                // Paso 2: Obtener las mesas abiertas desde la compra
                let compra = JSON.parse(localStorage.getItem("compra")) || [];
                let mesasAbiertasIds = [];

                compra.forEach((item, index) => {
                    if (item != null) {
                        mesasAbiertasIds.push(index);
                    }
                });

                // Paso 3: Marcar mesas como abiertas y aplicar etiquetas si existen
                mesas.forEach((mesa) => {
                    const indexCompra = mesasAbiertasIds.findIndex(id => id == mesa.id);
                    if (indexCompra !== -1) {
                        mesa.abierta = true;
                        if (compra[indexCompra]?.etiqueta) {
                            mesa.etiqueta = compra[indexCompra].etiqueta;
                            // Llama a tu función si es necesario (comentado por ser opcional)
                            // this.cambiarEtiqueta(mesa.id);
                        }
                    } else {
                        mesa.abierta = false;
                    }
                });

                // Paso 4: Guardar en localStorage actualizado
                localStorage.setItem("mesas", JSON.stringify(mesas));

                // Si estás en un componente y quieres guardar el resultado:
                // this.mesas = mesas;

                console.log("Mesas actualizadas:", mesas);
                return mesas; // opcional si necesitas usarla después

            } catch (error) {
                console.error("Error al cargar y actualizar mesas:", error);
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
            if(this.carrito == undefined)
            {
                this.carrito = new Array();
            }
           
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
            else{
                this.compra = new Array()
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

                if(this.compra==undefined)
                {
                   this.compra = new Array(); 
                }

                if( this.compra[mesa] == undefined)
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
                
                console.log(localStorage.getItem("compra"), "esto se compro");

                window.location.href = '/#/compra/'+mesa; 
                window.location.reload(true);

            }
        },
        getCompra()
        {
            return localStorage.getItem("compra");
        },
        eliminarCompra(mesa, producto)
        {
            if (confirm("Eliminar venta?") === true) 
            {
                delete this.compra[mesa][producto.index][producto.j];
                localStorage.setItem("compra", JSON.stringify(this.compra));
                window.location.reload(true);
                 
            }
        },
        eliminarCompraProducto(mesa, producto)
        {
          
            for(let i =0;i<[this.compra[mesa][producto.index][producto.j]].length; i++){
                    
                let cantidad = [this.compra[mesa][producto.index][producto.j]][i].cantidad;
                if(cantidad <=1)
                {
                     this.eliminarCompra(mesa, producto);
                     break;
                }
                [this.compra[mesa][producto.index][producto.j]][i].cantidad -=1
            };

            localStorage.setItem("compra",JSON.stringify(this.compra));
             window.location.reload(true);
           
        },
        agregarCompraProducto (mesa, producto)
        {
          
            for(let i =0;i<[this.compra[mesa][producto.index][producto.j]].length; i++){
                    
               let cantidad = [this.compra[mesa][producto.index][producto.j]][i].cantidad += 1;
            }
            localStorage.setItem("compra",JSON.stringify(this.compra));
            window.location.reload(true);
           
        },
        terminarVenta(mesa)
        {
            this.getMesas();
            if (confirm("Terminar Venta?") == true) {
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
                    window.location.href = '/#/mesas';
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