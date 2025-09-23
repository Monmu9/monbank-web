

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const usuario = document.getElementById("usuario").value;
  const clave = document.getElementById("clave").value;

  // Usuario y contraseña simulados
  if (usuario === "Montse" && clave === "1234") {
    localStorage.setItem("usuarioLogueado", usuario);
    window.location.href = "index.html";
  } else {
	  document.getElementById("mensaje").textContent = "Usuario o contraseña incorrectos ❌";
	}
});


// document.getElementById("loginForm").addEventListener("submit", function(e) --- busca el formulario con el id "loginForm" y le agrega un evento "submit"
// { e.preventDefault(); --- evita que el formulario se envie de forma real (no recarga la pagina ni manda datos al servidor)
	
// const usuario = document.getElementById("usuario").value; --- coge lo que el usuario escribio en los campos de entrada (input) con id(usuario) y id(clave). 
// Lo guarda en las variables usuario y clave
