function navegar(page) {
  document.querySelector("#myNavigator").pushPage(`${page}.html`);
}

function navegarBack() {
  document.querySelector("#myNavigator").popPage();
}

function login() {
  let username = $("#LogEmail").val();
  let password = $("#LogPassword").val();
  console.log(username, typeof username);
  console.log(password, typeof password);
  if (username === "" || password === "") {
    ons.notification.alert("Debe ingresar usuario y password.", { cancelable: true, title: "" });
  } else {
    $.ajax({
      url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios/session`,
      type: "POST",
      data: JSON.stringify({
        email: username,
        password: password,
      }),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        localStorage.setItem("x-auth", data["data"]["token"]);
        obternerIdUsuario()
        ons.notification.toast("Iniciando Sesion", { timeout: 1000 });
        navegar("inicio");
        cargarCatalogo("");
      },
      error: function (e1, e2, e3) {
        console.log("Error 1...", e1);
        console.log("Error 2...", e2);
        console.log("Error 3...", e3);
      },
      complete: function () {
        console.log("Fin!");
      },
    });
  }
}

function registrar() {
  let email = $("#regEmail").val();
  let password = $("#regPassword").val();
  let name = $("#regNombre").val();
  let surname = $("#regApellido").val();
  let address = $("#regDireccion").val();
  //regular expressions
  let emailReg = new RegExp("^([a-z,A-Z,0-9])+(@{1})+[a-z,A-Z,0-9]+(.{1})+[a-z,A-Z,0-9]{1,}$");
  let passReg = new RegExp("[a-z,A-Z,0-9]{8,}");
  if (email === "" || password === "" || name === "" || surname === "" || address === "") {
    ons.notification.alert("Por favor complete todos los campos.", { cancelable: true, title: "" });
  } else {
    if (!emailReg.test(email) || !passReg.test(password)) {
      if (!emailReg.test(email)) {
        ons.notification.alert("Por favor ingrese unna direccion de correo valida.", { cancelable: true, title: "" });
      }
      if (!passReg.test(password)) {
        ons.notification.alert("La contraseña debe de tener al menos 8 caracteres alfanumericos.", { cancelable: true, title: "" });
      }
    } else {
      console.log(email, password, name, surname, address);
      console.log(typeof email);
      $.ajax({
        url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios`,
        type: "POST",
        data: JSON.stringify({
          nombre: name,
          apellido: surname,
          email: email,
          direccion: address,
          password: password,
        }),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
          console.log(data["error"]);
          ons.notification.alert("Usuario creado correctamente", { cancelable: true, title: "" });
          navegar("login");
        },
        error: function (e1, e2, e3) {
          console.log("Error 1...", e1);
          console.log("Error 2...", e2);
          console.log("Error 3...", e3);
          ons.notification.alert(e1["responseJSON"]["error"], { cancelable: true, title: "" });
        },
        complete: function () {
          console.log("Fin!");
        },
      });
    }
  }
  console.log(emailReg.test(email));
  console.log(passReg.test(password));
  console.log(email, password, name, surname, address);
}

function cerrarSesion() {
  document.querySelector("#myNavigator").resetToPage(`login.html`, {pop: true});
  $("#LogEmail").val("");
  $("#LogPassword").val("");
  localStorage.removeItem("x-auth");
}

function buscar(busqueda) {
  if (busqueda === "") {
    busqueda = $("#txtBusqueda").val();
  }
  cargarCatalogo(busqueda);
}

function cargarCatalogo(buscar) {
  buscar = buscar.toLowerCase()
  $.ajax({
    url: "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos",
    type: "GET",
    headers: { "x-auth": localStorage.getItem("x-auth") },
    dataType: "json",
    success: function (data) {
      let listCatalogo = $("#listCatalogo");
      listCatalogo.html("");
      console.log(data);
      console.log(typeof data["data"]);
      console.log(listCatalogo);
      let favs = obtenerFavoritos()
      data["data"].forEach((elem) => {
        let nombre =  elem.nombre.toLowerCase()
        if (nombre.includes(buscar) || elem.etiquetas.includes(buscar)) {
          console.log("work");
          let tagsElem = [];
          for (let i = 0; i < elem.etiquetas.length; i++) {
            tagsElem.push(`<ons-button modifier="quiet" onclick="buscar('${elem.etiquetas[i]}')">${elem.etiquetas[i]}</ons-button>`);
          }
          listCatalogo.append(`
            <ons-list-item modifier="longdivider" id="${elem._id}" onclick="detalle('${elem._id}')">
              <div class="left">
                <img class="list-item__thumbnail" src="http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${elem.urlImagen}.jpg" />
              </div>
              <div class="center">
                <span class="list-item__title">${elem.nombre}</span>
                <span class="list-item__title">$${elem.precio}</span>
                <span class="list-item__subtitle">${elem.estado}</span>
                <span class="list-item__subtitle">Tags: ${tagsElem}</span>
                <span class="list-item__subtitle">Code: ${elem.codigo}</span>
              </div>
              <div class="right">
                <ons-icon data-id="${elem._id}" icon="fa-heart" class="list-item__icon favIcon" onclick="toggleFav(this)"></ons-icon>
              </div>
            </ons-list-item>`);

            for (let i = 0; i < favs.length; i++) {
              if (favs[i] === elem._id) {
                $(`#${elem._id}`).find(".favIcon").addClass("active")
              }
            }
        }
      });
    },
    error: function (e1, e2, e3) {
      console.log("Error...", e1, e2, e3);
    },
    complete: function () {
      console.log("Fin!");
    },
  });
}

function obternerIdUsuario() {
  $.ajax({
    url: "http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/usuarios/session",
    type: "GET",
    headers: { "x-auth": localStorage.getItem("x-auth") },
    dataType: "json",
    success: function (data) {
      localStorage.setItem("userId", data["data"]["_id"]);
    },
    error: function (e1, e2, e3) {
      console.log("Error...", e1, e2, e3);
    },
    complete: function () {
      console.log("Fin!");
    },
  });
}

function toggleFav(event) {
  let prodId = $(event).attr("data-id")
  console.log(prodId)
  if ($(event).hasClass("active")) {
    $(event).removeClass("active")
    removerFavorito(prodId)
  } else {
    $(event).addClass("active")
    guardarFavorito(prodId)
  }
}

function guardarFavorito(idFavorito) {
  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  let agregado = false;
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      if (!elem.favoritos.includes(idFavorito)) {
        elem.favoritos.push(idFavorito);
      }
      agregado = true;
    }
  });
  if (!agregado) {
    vecFavs.push({ idUsuario: userId, favoritos: [idFavorito] });
  }
  localStorage.setItem('favoritos', JSON.stringify(vecFavs));
}

function removerFavorito(idFavorito) {
  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      if (elem.favoritos.includes(idFavorito)) {
        let pos = elem.favoritos.indexOf(idFavorito);
        elem.favoritos.splice(pos, 1);
      }
    }
  });
  localStorage.setItem('favoritos', JSON.stringify(vecFavs));
}

function obtenerFavoritos() {
  if (localStorage.getItem('favoritos') === null) {
    localStorage.setItem('favoritos', '[]');
  }
  let userId = localStorage.getItem('userId');
  let vecFavs = JSON.parse(localStorage.getItem('favoritos'));
  let favs = [];
  vecFavs.forEach(function (elem) {
    if (elem.idUsuario === userId) {
      favs = elem.favoritos;
    }
  });
  return favs;
}

function detalle(idProducto) {
  navegar("detalle");
  console.log(idProducto)
  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos/${idProducto}`,
    type: 'GET',
    headers: { "x-auth": localStorage.getItem("x-auth") },
    dataType: 'json',
    success: function (data) {
      let btnComprar
      if (data["data"]["estado"] === "en stock") {
        btnComprar = `<ons-button onclick="hacerPedido('${idProducto}')">Comprar</ons-button>`
      } else {
        btnComprar = '<ons-button disabled="true">Comprar</ons-button>'
      }
      $('#cardProducto').html(`
        <img src="http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/assets/imgs/${data["data"]["urlImagen"]}.jpg" alt="Onsen UI" style="width: 100%">
        <div class="title card__title">
          ${data["data"]["nombre"]}
        </div>
        <div class="content">
          <div>
            Precio: $${data["data"]["precio"]}
          </div>
          <div>
            <p class="list-item__subtitle">Tags: ${data["data"]["etiquetas"].join(", ")}</p>
          </div>
          <div>
            <p class="list-item__subtitle">Code: ${data["data"]["codigo"]}</p>
          </div>
          <div>
            <p class="list-item__subtitle">${data["data"]["estado"]}</p>
          </div>
          <div>
            <p>${data["data"]["descripcion"]}</p>
          </div>
          <div>
            ${btnComprar}
          </div>
        </div>`);
    },
    error: function (e1, e2, e3) {
      console.log('Error...', e1, e2, e3);
    },
    complete: function () {
      console.log('Fin!');
    },
  });
}

function hacerPedido(idProducto) {
  navegar("comprar")
  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/productos/${idProducto}`,
    type: 'GET',
    headers: { "x-auth": localStorage.getItem("x-auth") },
    dataType: 'json',
    success: function (data) {
      $('#pedidoForm').html(`
        <ons-list modifier="inset">
            <ons-list-item>
              <div class="left">
                ${data["data"]["nombre"]}
              </div>
              <div class="right">
                Precio: $${data["data"]["precio"]}
              </div>
            </ons-list-item>
          </ons-list>
          <div>
            <div style="text-align: center; margin-top: 30px;">
              <p>
                <ons-input id="cantidadProducto" modifier="underbar" placeholder="Ingrese una cantidad" float></ons-input>
              </p>
              <ons-select modifier="underbar" id="sucursal">
                <option hidden value="">Seleccione una sucursal</option>
                
              </ons-select>
              <div id="mapContainer">

              </div>
              <p style="margin-top: 30px;">
                <ons-button onclick="comprar('${idProducto}')">Confirmar compra</ons-button>
              </p>
            </div>
          </div>
        `);
    },
    error: function (e1, e2, e3) {
      console.log('Error...', e1, e2, e3);
    },
    complete: function () {
      console.log('Fin!');
    },
  });
  let latitude 
  let longitude 
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(data) {
      latitude = data.coords.latitude
      longitude = data.coords.longitude
    })
    setTimeout(function() {
      mymap = L.map('mapContainer').setView([-34.8977551, -56.1641621], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; Rigoberta Menchú',
          }).addTo(mymap);
      obtenerSucursales(latitude, longitude)
    }, 500)
  } else {
    ons.notification.alert("No se pudo obtener la localizacion del usuario", { cancelable: true, title: "" });
    setTimeout(function() {
      mymap = L.map('mapContainer').setView([-34.8977551, -56.1641621], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; Rigoberta Menchú',
          }).addTo(mymap);
    }, 100)
  }
}

function obtenerSucursales(posLat, posLong) {
  let posSucursales = [{latuitud: -34.9028068, longitud: -56.178735}, {latuitud: -34.9235667, longitud: -56.159599}, {latuitud: -34.9023555, longitud: -56.1344774}, {latuitud: -34.8901316, longitud: -56.1869972}, {latuitud: -34.9063424, longitud: -56.1957097}];
  let marcadores = []
  iconUser = L.icon({iconUrl: "../css/images/marker-user.png", iconSize: (20, 40), popupAnchor: [0, -10]})
  markerUsuario = L.marker([posLat, posLong], {icon: iconUser}).addTo(mymap).bindPopup(`<b>Este eres tu</b>`)
  $.ajax({
    url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/sucursales`,
    type: 'GET',
    headers: { "x-auth": localStorage.getItem("x-auth") },
    dataType: 'json',
    success: function (data) {
      console.log(data)
      for (let i = 0; i < data["data"].length; i++) {
        $('#sucursal select').append(`
          <option value="${data["data"][i]["_id"]}">${data["data"][i]["nombre"]}</option>
        `)
        let distancia = distance(posSucursales[i].latuitud, posSucursales[i].longitud, posLat, posLong, "K")
        console.log(distancia)
        console.log(marcadores[i])
        marcadores.push(L.marker([posSucursales[i].latuitud, posSucursales[i].longitud]).addTo(mymap).bindPopup(`<b>${data["data"][i]["nombre"]}</b><br>${distancia} Km`))
        console.log(marcadores[i])
      }
    },
    error: function (e1, e2, e3) {
      console.log('Error...', e1, e2, e3);
    },
    complete: function () {
      console.log('Fin!');
    },
  });
}

function comprar(idProducto) {
  let cantidad = Number($("#cantidadProducto").val())
  let idSucursal = $('#sucursal select').val()
  if (cantidad <= 0 || isNaN(cantidad) || idSucursal === "") {
    if (cantidad <= 0 || isNaN(cantidad)) {
      ons.notification.alert("Ingrese una cantidad valida", { cancelable: true, title: "" });
    }
    if (idSucursal === "") {
      ons.notification.alert("Seleccione una sucursal", { cancelable: true, title: "" });
    }
  } else {
    $.ajax({
      url: `http://ec2-54-210-28-85.compute-1.amazonaws.com:3000/api/pedidos`,
      type: "POST",
      headers: { "x-auth": localStorage.getItem("x-auth") },
      data: JSON.stringify({
        cantidad: cantidad,
        idProducto: idProducto,
        idSucursal: idSucursal
      }),
      contentType: "application/json",
      dataType: "json",
      success: function (data) {
        console.log(data)
      },
      error: function (e1, e2, e3) {
        console.log("Error 1...", e1);
        console.log("Error 2...", e2);
        console.log("Error 3...", e3);
      },
      complete: function () {
        console.log("Fin!");
      },
    });
  }
}

function distance(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return Math.round(dist);
	}
}