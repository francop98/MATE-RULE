'use strict';

/* =========================================================
   main.js — mate-rule
   Requiere: SweetAlert2 (cargado en el HTML antes de este script)
   ========================================================= */


// Ruta base al JSON según la ubicación de la página

function rutaProductos() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../data/productos.json';
  return './data/productos.json';
}


// Animaciones de entrada con IntersectionObserver

(function initScrollAnimations() {
  const elementos = document.querySelectorAll(
    '.tarjeta-mate, .paso, .tarjeta-curar, .producto-detalle'
  );
  if (!elementos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  elementos.forEach((el) => observer.observe(el));
})();


// Validación del formulario de contacto

(function initFormulario() {
  const form = document.getElementById('formContacto');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const nombre  = document.getElementById('nombre');
    const email   = document.getElementById('email');
    const mensaje = document.getElementById('mensaje');

    let valido = true;

    document.querySelectorAll('.error-msg').forEach((el) => el.remove());
    document.querySelectorAll('.campo-error').forEach((el) =>
      el.classList.remove('campo-error')
    );

    if (!nombre.value.trim() || nombre.value.trim().length < 2) {
      mostrarError(nombre, 'Ingresá tu nombre completo.');
      valido = false;
    }

    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(email.value.trim())) {
      mostrarError(email, 'Ingresá un correo electrónico válido.');
      valido = false;
    }

    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) {
      mostrarError(mensaje, 'El mensaje debe tener al menos 10 caracteres.');
      valido = false;
    }

    if (valido) mostrarExito(form);
  });

  function mostrarError(campo, texto) {
    campo.classList.add('campo-error');
    const msg = document.createElement('p');
    msg.className = 'error-msg';
    msg.textContent = texto;
    msg.style.cssText = 'color:#c0392b;font-size:.82rem;margin-top:4px;';
    campo.parentNode.appendChild(msg);
    campo.focus();
  }

  function mostrarExito(form) {
    form.innerHTML = `
      <div style="text-align:center;padding:40px 20px;">
        <p style="font-size:3rem;margin-bottom:16px;">✉️</p>
        <h3 style="font-family:'Playfair Display',serif;color:#5c3d1e;">¡Mensaje enviado!</h3>
        <p style="color:#7a6a5a;margin-top:8px;">Te respondemos a la brevedad. ¡Gracias por escribirnos!</p>
      </div>`;
  }
})();


// Búsqueda funcional sobre productos

(function initBusqueda() {
  const forms = document.querySelectorAll('form[role="search"]');
  if (!forms.length) return;

  fetch(rutaProductos())
    .then((res) => {
      if (!res.ok) throw new Error('fetch falló');
      return res.json();
    })
    .then((productos) => bindBusqueda(forms, productos))
    .catch(() => {
      // silencioso: la búsqueda simplemente no funciona si no hay JSON
    });

  function bindBusqueda(forms, productos) {
    forms.forEach((form) => {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = form.querySelector('input[type="search"]');
        const query = input ? input.value.trim().toLowerCase() : '';
        if (!query || query.length < 2) return;

        const resultados = productos.filter(
          (p) =>
            p.nombre.toLowerCase().includes(query) ||
            p.tipo.toLowerCase().includes(query) ||
            p.descripcion.toLowerCase().includes(query)
        );

        mostrarResultados(resultados, query);
        if (input) input.value = '';
      });
    });
  }

  function mostrarResultados(resultados, query) {
    if (!resultados.length) {
      Swal.fire({
        icon: 'info',
        title: 'Sin resultados',
        text: `No encontramos productos para "${query}".`,
        confirmButtonColor: '#896941',
      });
      return;
    }

    const lista = resultados
      .map(
        (p) => `
        <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #ede3d4;">
          <div style="text-align:left;">
            <strong style="color:#5c3d1e;font-family:'Playfair Display',serif;">${p.nombre}</strong>
            <p style="margin:2px 0 0;font-size:.85rem;color:#7a6a5a;">
              ${p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)} — $${p.precio.toLocaleString('es-AR')}
            </p>
          </div>
        </div>`
      )
      .join('');

    Swal.fire({
      title: `Resultados para "${query}"`,
      html: `<div style="max-height:300px;overflow-y:auto;">${lista}</div>`,
      confirmButtonColor: '#896941',
      confirmButtonText: 'Cerrar',
    });
  }
})();


// Marca el nav-link activo según la URL actual

(function setActiveNav() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    if (href && href === path && !link.classList.contains('dropdown-toggle')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
})();