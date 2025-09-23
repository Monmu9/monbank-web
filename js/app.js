


window.addEventListener("DOMContentLoaded", function() {
	const spinner = document.getElementById("spinner");
	//Lo siguiente hará que simule la carga de la web en 1.5 segundos
	setTimeout(() => {
		spinner.style.display = "none";
		document.body.classList.remove("oculto");
	}, 1500);

  const usuario = localStorage.getItem("usuarioLogueado");
  const bienvenida = document.getElementById("bienvenida");
  const botonCerrar = document.getElementById("cerrarSesion");
  const listaMovimientos = document.getElementById("listaMovimientos");
  const saldoTotal = document.getElementById("saldoTotal");
  const form = document.getElementById("formTransferencia");
 
  

  if (!usuario) {
	window.location.href = "login.html";
	return;
	}
	
    bienvenida.textContent = `Bienvenida, ${usuario}`;
	bienvenida.classList.add("fade-in");
	
	botonCerrar.addEventListener("click", function () {
	    localStorage.removeItem("usuarioLogueado");
	    window.location.href = "login.html";
	  });
	
	

	  
	  
// Cargar movimientos guardados
	  let movimientos = JSON.parse(localStorage.getItem("movimientos")) || [];
	  mostrarMovimientos();
	  
	  
// Cargar consultas guardadas
	  const listaConsultas = document.getElementById("listaConsultas");
	  const consultas = JSON.parse(localStorage.getItem("consultas")) || [];

	  if (listaConsultas) {
	    mostrarConsultas();
	  }

	  function mostrarConsultas() {
	    listaConsultas.innerHTML = "";

	    consultas.forEach((consulta) => {
	      const li = document.createElement("li");
	      li.innerHTML = `
	        <strong>${consulta.fecha}</strong><br>
	        <em>${consulta.nombre} (${consulta.email})</em><br>
	        ${consulta.mensaje}
	      `;
	      li.style.marginBottom = "15px";
	      listaConsultas.appendChild(li);
	    });
	  }

	  

	  function mostrarMovimientos() {
	    listaMovimientos.innerHTML = "";
		
		let saldo = 0;
		
	    movimientos.forEach((mov, index) => {
	      const li = document.createElement("li");
		  li.innerHTML = `
		    <i class="fas ${mov.tipo === '+' ? 'fa-arrow-up text-green' : 'fa-arrow-down text-red'}"></i>
		    ${mov.fecha} - €${mov.cantidad} | ${mov.destino}
		  `;

		  li.classList.add(mov.tipo === "+" ? "ingreso" : "gasto");
	      
		  const btnEliminar = document.createElement("button");
		  btnEliminar.textContent = "Eliminar";
		  btnEliminar.style.marginLeft = "10px";
		  btnEliminar.addEventListener("click", function () {
			movimientos.splice(index, 1); //Elimina el movimiento por índice
			localStorage.setItem("movimientos", JSON.stringify(movimientos));
			mostrarMovimientos(); //Vuelve a renderizar la lista
		  });
	  
		  
		    li.appendChild(btnEliminar);
		      listaMovimientos.appendChild(li);
			  
		// Calcular saldo
		const cantidad = parseFloat(mov.cantidad);
		saldo += mov.tipo === "+" ? cantidad : -cantidad;
		    });
			
		
		saldoTotal.textContent = `Saldo actual: €${saldo.toFixed(2)}`;
		  saldoTotal.classList.add("saldo-animado");

		  setTimeout(() => {
		    saldoTotal.classList.remove("saldo-animado");
		  }, 600);
		  


	  
	  
	  
// Guardar nueva transferencia
	    form.addEventListener("submit", function (e) {
	      e.preventDefault();
		  
	      const destino = document.getElementById("destino").value;
	      const cantidad = parseFloat(document.getElementById("cantidad").value);
		  const tipo = document.getElementById("tipoOperacion").value;

	      if (!destino || isNaN(cantidad) || cantidad <= 0) {
	        alert("Por favor, introduce datos válidos.");
	        return;
	      }
	
		  
		  const nuevoMovimiento = {
		        fecha: new Date().toLocaleDateString(),
		        tipo: tipo,
		        cantidad: cantidad.toFixed(2),
		        destino: destino
		      };

		      movimientos.unshift(nuevoMovimiento); // Añadir al principio
		      localStorage.setItem("movimientos", JSON.stringify(movimientos));
		      mostrarMovimientos();

		      form.reset();
		      alert("Transferencia simulada correctamente ✅");
		    });
			}
		  });
		  
		  
		  
		  
		  
		  


// Esto ultimo sirve para controlar si un usuario está logueado o no usando el almacenamiento del localStorage

// window.addEventListener("DOMContentLoaded", function() { --- Espera a que todo el HTML de la pagina se haya cargfado (el DOM) y entonces ejecuta la función
// 	const usuario = localStorage.getItem("usuarioLogueado"); --- busca en localStorage si exite un valor con la clave "usuarioLogueado". Ese valor se guarda en la variable usuario.
// const bienvenida = document.getElementById("bienvenida"); --- obtiene el elemento HTML con el id "bienvenida"
// const botonCerrar = document.getElementById("cerrarSesion"); --- busca en el DOM (doc HTML) el elemento que tebnga de atributo id="cerrarSesion" y guarda una referencia a ese elemento en la constante botonCerrar. Es decir, conecta el JavaScript con un boton del HTML




