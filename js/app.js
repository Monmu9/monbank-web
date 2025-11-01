



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
        fecha: new Date().toISOString(),
        nombre: nombre,
        email: email,
        mensaje: mensaje
      };

      // Guardar en localStorage en lugar de Firebase
      const consultasGuardadas = JSON.parse(localStorage.getItem("consultas_demo")) || [];
      consultasGuardadas.unshift(nuevaConsulta);
      localStorage.setItem("consultas_demo", JSON.stringify(consultasGuardadas));

      alert("Consulta enviada correctamente ✅");
      formContacto.reset();
      cargarConsultas();
    });
  }

  // Consultas guardadas
  if (listaConsultas) {
    cargarConsultas();
  }

  function cargarConsultas() {
    // Cargar consultas desde datos.json y localStorage
    fetch('datos.json')
      .then(response => response.json())
      .then(data => {
        const consultasJSON = data.consultas || [];
        const consultasLocal = JSON.parse(localStorage.getItem("consultas_demo")) || [];
        const todasConsultas = [...consultasLocal, ...consultasJSON];

        // Ordenar por fecha descendente
        todasConsultas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        listaConsultas.innerHTML = "";
        todasConsultas.forEach((consulta, index) => {
          const li = document.createElement("li");
          const fechaObj = new Date(consulta.fecha);
          const fechaFormateada = fechaObj.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });

          li.innerHTML = `
            <strong>${fechaFormateada}</strong><br>
            <em>${consulta.nombre} (${consulta.email})</em><br>
            ${consulta.mensaje}
          `;
          li.style.marginBottom = "15px";

          // Solo permitir eliminar consultas del localStorage
          if (index < consultasLocal.length) {
            const btnEliminar = document.createElement("button");
            btnEliminar.textContent = "Eliminar";
            btnEliminar.style.marginLeft = "10px";

            btnEliminar.addEventListener("click", function () {
              consultasLocal.splice(index, 1);
              localStorage.setItem("consultas_demo", JSON.stringify(consultasLocal));
              cargarConsultas();
            });

            li.appendChild(btnEliminar);
          }

          listaConsultas.appendChild(li);
        });
      })
      .catch(error => {
        console.error("Error al cargar consultas:", error);
        listaConsultas.innerHTML = "<li>Error al cargar las consultas</li>";
      });
  }

  // Movimientos
  let movimientos = [];
  let graficoSaldoChart = null;
  cargarMovimientos();

  
  
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

    movimientos.forEach((mov, index) => {
      // Convertimos el timestamp a fecha legible
      const fechaObj = new Date(mov.fecha);
      const fechaLegible = fechaObj.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const li = document.createElement("li");
      li.innerHTML = `
        <i class="fas ${mov.tipo === '+' ? 'fa-arrow-up text-green' : 'fa-arrow-down text-red'}"></i>
        <span class="texto-movimiento">${fechaLegible} - €${mov.cantidad} | ${mov.destino}</span>
      `;
      li.classList.add(mov.tipo === "+" ? "ingreso" : "gasto");

      // Solo permitir eliminar movimientos creados por el usuario (no los del JSON)
      if (mov.esNuevo) {
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.style.marginLeft = "10px";

        btnEliminar.addEventListener("click", function () {
          const movimientosLocal = JSON.parse(localStorage.getItem("movimientos_demo")) || [];
          const indexEnLocal = movimientosLocal.findIndex(m => 
            m.fecha === mov.fecha && m.cantidad === mov.cantidad && m.destino === mov.destino
          );
          
          if (indexEnLocal !== -1) {
            movimientosLocal.splice(indexEnLocal, 1);
            localStorage.setItem("movimientos_demo", JSON.stringify(movimientosLocal));
            cargarMovimientos();
          }
        });

        li.appendChild(btnEliminar);
      }

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
      // Invertir el orden para la gráfica (de más antiguo a más reciente)
      const movimientosParaGrafica = [...movimientos].reverse();
      
      const fechas = movimientosParaGrafica.map(m => {
        const fechaObj = new Date(m.fecha);
        return fechaObj.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit'
        });
      });

      const saldos = calcularSaldosAcumulados(movimientosParaGrafica);

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
        fecha: new Date().toISOString(),
        tipo: tipo,
        cantidad: cantidad.toFixed(2),
        destino: destino,
        esNuevo: true
      };

      // Guardar en localStorage
      const movimientosLocal = JSON.parse(localStorage.getItem("movimientos_demo")) || [];
      movimientosLocal.unshift(nuevoMovimiento);
      localStorage.setItem("movimientos_demo", JSON.stringify(movimientosLocal));

      alert("Transferencia simulada correctamente ✅");
      form.reset();
      cargarMovimientos();
    });
  }

  function cargarMovimientos() {
    // Cargar movimientos desde datos.json y localStorage
    fetch('datos.json')
      .then(response => response.json())
      .then(data => {
        const movimientosJSON = data.movimientos || [];
        const movimientosLocal = JSON.parse(localStorage.getItem("movimientos_demo")) || [];
        
        // Marcar los nuevos movimientos
        movimientosLocal.forEach(mov => mov.esNuevo = true);
        
        // Combinar y ordenar
        movimientos = [...movimientosLocal, ...movimientosJSON];
        movimientos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        mostrarMovimientos();
      })
      .catch(error => {
        console.error("Error al cargar movimientos:", error);
        listaMovimientos.innerHTML = "<li>Error al cargar los movimientos</li>";
      });
  } //Esta cierra la función cargarMovimientos
	
	
	
	
});//Esta llave cierra el window.addEventListener
  