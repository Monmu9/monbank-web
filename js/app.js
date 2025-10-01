


window.addEventListener("DOMContentLoaded", function () {
  const spinner = document.getElementById("spinner");
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
  const formContacto = document.getElementById("formContacto");
  const listaConsultas = document.getElementById("listaConsultas");
  
  
  const toggleModo = document.getElementById("toggleModo");
  // Recuperar preferencia guardada de modo
  if (localStorage.getItem("modo") === "oscuro") {
    document.body.classList.add("dark-mode");
    toggleModo.textContent = "Modo claro ☀️";
  }

  toggleModo.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const modoActual = document.body.classList.contains("dark-mode") ? "oscuro" : "claro";
    localStorage.setItem("modo", modoActual);

    toggleModo.textContent = modoActual === "oscuro" ? "Modo claro ☀️" : "Modo oscuro 🌙";
  });


  
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

  // Formulario de contacto
  if (formContacto) {
    formContacto.addEventListener("submit", function (e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const email = document.getElementById("email").value;
      const mensaje = document.getElementById("mensaje").value;

      if (!nombre || !email || !mensaje) {
        alert("Por favor, completa todos los campos.");
        return;
      }

      const nuevaConsulta = {
        fecha: new Date(),
        nombre: nombre,
        email: email,
        mensaje: mensaje
      };

      db.collection("consultas").add(nuevaConsulta)
        .then(() => {
          alert("Consulta enviada correctamente ✅");
          formContacto.reset();
          cargarConsultasDesdeFirebase();
        })
        .catch((error) => {
          console.error("Error al guardar la consulta:", error);
          alert("Hubo un error al enviar la consulta.");
        });
    });
  }

  // Consultas guardadas
  if (listaConsultas) {
    cargarConsultasDesdeFirebase();
  }

  function cargarConsultasDesdeFirebase() {
    db.collection("consultas")
      .orderBy("fecha", "desc")
      .get()
      .then((querySnapshot) => {
        listaConsultas.innerHTML = "";
        querySnapshot.forEach((doc) => {
          const consulta = doc.data();
          const li = document.createElement("li");
          li.innerHTML = `
		  	<strong>${new Date(consulta.fecha.seconds * 1000).toLocaleString()}</strong><br>
            <em>${consulta.nombre} (${consulta.email})</em><br>
            ${consulta.mensaje}
          `;
          li.style.marginBottom = "15px";

          const btnEliminar = document.createElement("button");
          btnEliminar.textContent = "Eliminar";
          btnEliminar.style.marginLeft = "10px";

          btnEliminar.addEventListener("click", function () {
            db.collection("consultas").doc(doc.id).delete()
              .then(() => {
                cargarConsultasDesdeFirebase();
              })
              .catch((error) => {
                console.error("Error al eliminar la consulta:", error);
                alert("Hubo un error al eliminar la consulta.");
              });
          });

          li.appendChild(btnEliminar);
          listaConsultas.appendChild(li);
        });
      });
  }

  // Movimientos
  let movimientos = [];
  let graficoSaldoChart = null;
  cargarMovimientosDesdeFirebase();

  
  
  // Calcula saldos acumulados para la gráfica
  function calcularSaldosAcumulados(movs) {
    let saldo = 0;
    return movs.map(m => {
      const cantidad = parseFloat(m.cantidad);
      saldo += m.tipo === "+" ? cantidad : -cantidad;
      return saldo.toFixed(2);
    });
  }
  
  
  //Muestra movimientos y actualiza la gráfica
  function mostrarMovimientos() {	
    listaMovimientos.innerHTML = "";
    let saldo = 0;

    movimientos.forEach((mov) => {
		// Convertimos el timestamp a fecha legible
		    const fechaLegible = mov.fecha instanceof Date
		      ? mov.fecha.toLocaleString()
		      : new Date(mov.fecha.seconds * 1000).toLocaleString();

		    const li = document.createElement("li");
			li.innerHTML = `
			  <i class="fas ${mov.tipo === '+' ? 'fa-arrow-up text-green' : 'fa-arrow-down text-red'}"></i>
			  <span class="texto-movimiento">${fechaLegible} - €${mov.cantidad} | ${mov.destino}</span>
			`;
		    li.classList.add(mov.tipo === "+" ? "ingreso" : "gasto");

      const btnEliminar = document.createElement("button");
      btnEliminar.textContent = "Eliminar";
      btnEliminar.style.marginLeft = "10px";

      btnEliminar.addEventListener("click", function () {
        db.collection("movimientos").doc(mov.id).delete()
          .then(() => {
            cargarMovimientosDesdeFirebase();
          })
          .catch((error) => {
            console.error("Error al eliminar:", error);
            alert("Hubo un error al eliminar el movimiento.");
          });
      });

      li.appendChild(btnEliminar);
      listaMovimientos.appendChild(li);

      const cantidad = parseFloat(mov.cantidad);
      saldo += mov.tipo === "+" ? cantidad : -cantidad;
    });

    saldoTotal.textContent = `Saldo actual: €${saldo.toFixed(2)}`;
    saldoTotal.classList.add("saldo-animado");
    setTimeout(() => {
      saldoTotal.classList.remove("saldo-animado");
    }, 600);
	
	
	
	
	


	  // Añado gráfica de evolución del saldo
	  const canvas = document.getElementById("graficoSaldo");
	  if (canvas) {
	    const fechas = movimientos.map(m => {
	      return m.fecha instanceof Date
	        ? m.fecha.toLocaleDateString()
	        : new Date(m.fecha.seconds * 1000).toLocaleDateString();
	    });

	    const saldos = calcularSaldosAcumulados(movimientos);

	    console.log("Fechas:", fechas);
	    console.log("Saldos:", saldos);

	    const ctx = canvas.getContext("2d");

	    // Destruir gráfico anterior si existe
	    if (graficoSaldoChart) {
	      graficoSaldoChart.destroy();
	    }
	
	    // Crear nuevo gráfico
	    graficoSaldoChart = new Chart(ctx, {
	      type: 'line',
	      data: {
	        labels: fechas,
	        datasets: [{
	          label: 'Saldo (€)',
	          data: saldos,
	          borderColor: '#3949ab',
	          backgroundColor: 'rgba(57, 73, 171, 0.1)',
	          fill: true,
	          tension: 0.3
	        }]
	      },
	      options: {
	        responsive: true,
	        plugins: {
	          legend: {
	            display: true
	          }
	        },
	        scales: {
	          y: {
	            beginAtZero: true
	          }
	        }
	      }
	    });
	  }
	}

  
  
  // Guardar nueva transferencia
  if (form) {
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
        fecha: new Date(),
        tipo: tipo,
        cantidad: cantidad.toFixed(2),
        destino: destino
      };

      db.collection("movimientos").add({
        usuario: usuario,
        ...nuevoMovimiento
      })
        .then(() => {
          alert("Transferencia simulada correctamente ✅");
          form.reset();
          cargarMovimientosDesdeFirebase();
        })
        .catch((error) => {
          console.error("Error al guardar:", error);
          alert("Hubo un error al guardar el movimiento.");
        });
    });
  }

  function cargarMovimientosDesdeFirebase() {
    db.collection("movimientos")
      .where("usuario", "==", usuario)
      .orderBy("fecha", "desc")
	  .get()
	  .then((querySnapshot) => {
	    movimientos = [];
	    querySnapshot.forEach((doc) => {
	      const mov = doc.data();
	      mov.id = doc.id;
	      movimientos.push(mov);
	    });
	    mostrarMovimientos();
	  })
	  .catch((error) => {
	    console.error("Error al cargar movimientos:", error);
	  });
	  
	} //Esta cierra la función cargarMovimientosDesdeFirebase
	
	
	
	
});//Esta llave cierra el window.addEventListener
  