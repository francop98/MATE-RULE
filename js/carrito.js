'use strict';

const STORAGE_KEY = 'materule_carrito';

function cargarCarrito() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
}


function actualizarBadge() {
  const carrito = cargarCarrito();
  const contador = document.getElementById('carrito-contador');
  if (!contador) return;

  const total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  contador.textContent = total;
  contador.style.display = total > 0 ? 'flex' : 'none';
}

function agregarAlCarrito(producto) {
  const carrito = cargarCarrito();
  const existente = carrito.find((item) => item.id === producto.id);

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  guardarCarrito(carrito);
  actualizarBadge();

  Swal.fire({
    toast: true,
    position: 'bottom-end',
    icon: 'success',
    title: `${producto.nombre} agregado al carrito`,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    customClass: { popup: 'swal-toast-mate' },
  });
}

function renderizarPaginaCarrito() {
  const tbody = document.getElementById('carrito-tbody');
  if (!tbody) return; // No estamos en carrito.html

  const carrito = cargarCarrito();
  const vaciMsg = document.getElementById('carrito-vacio-msg');
  const contenido = document.getElementById('carrito-contenido');
  const subtotalEl = document.getElementById('resumen-subtotal');
  const totalEl = document.getElementById('resumen-total');

  if (carrito.length === 0) {
    vaciMsg.style.display = 'block';
    contenido.style.display = 'none';
    return;
  }

  vaciMsg.style.display = 'none';
  contenido.style.display = 'flex';

  tbody.innerHTML = '';

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td data-label="Producto" class="carrito-tabla__nombre">${item.nombre}</td>
      <td data-label="Precio unitario">$${item.precio.toLocaleString('es-AR')}</td>
      <td data-label="Cantidad">
        <div class="carrito-tabla__cantidad">
          <button class="carrito-btn-cantidad" data-index="${index}" data-accion="restar" aria-label="Restar uno">−</button>
          <span>${item.cantidad}</span>
          <button class="carrito-btn-cantidad" data-index="${index}" data-accion="sumar" aria-label="Sumar uno">+</button>
        </div>
      </td>
      <td data-label="Subtotal">$${subtotal.toLocaleString('es-AR')}</td>
      <td>
        <button class="carrito-btn-eliminar" data-index="${index}" aria-label="Eliminar ${item.nombre}">✕</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Totales
  const totalValor = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  subtotalEl.textContent = `$${totalValor.toLocaleString('es-AR')}`;
  totalEl.textContent = `$${totalValor.toLocaleString('es-AR')}`;

  // Eventos cantidad
  tbody.querySelectorAll('.carrito-btn-cantidad').forEach((btn) => {
    btn.addEventListener('click', () => {
      const carrito = cargarCarrito();
      const idx = parseInt(btn.dataset.index);
      const accion = btn.dataset.accion;

      if (accion === 'sumar') {
        carrito[idx].cantidad++;
      } else if (accion === 'restar') {
        carrito[idx].cantidad--;
        if (carrito[idx].cantidad <= 0) carrito.splice(idx, 1);
      }

      guardarCarrito(carrito);
      actualizarBadge();
      renderizarPaginaCarrito();
    });
  });

  // Eventos eliminar
  tbody.querySelectorAll('.carrito-btn-eliminar').forEach((btn) => {
    btn.addEventListener('click', () => {
      const carrito = cargarCarrito();
      carrito.splice(parseInt(btn.dataset.index), 1);
      guardarCarrito(carrito);
      actualizarBadge();
      renderizarPaginaCarrito();
    });
  });
}


function iniciarCheckout() {
  const carrito = cargarCarrito();

  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Carrito vacío',
      text: 'Agregá productos antes de continuar.',
      confirmButtonColor: '#896941',
    });
    return;
  }

  const resumen = carrito
    .map((i) => `• ${i.nombre} x${i.cantidad}  $${(i.precio * i.cantidad).toLocaleString('es-AR')}`)
    .join('\n');

  const total = carrito.reduce((acc, i) => acc + i.precio * i.cantidad, 0);

  Swal.fire({
    title: 'Confirmar pedido',
    html: `
      <div style="text-align:left;font-size:.9rem;color:#5c3d1e;">
        <pre style="font-family:'Lato',sans-serif;white-space:pre-wrap;margin-bottom:12px;">${resumen}</pre>
        <hr style="border-color:#ede3d4;">
        <p style="margin-top:12px;font-size:1.1rem;font-weight:700;color:#896941;">
          Total: $${total.toLocaleString('es-AR')}
        </p>
        <p style="margin-top:8px;color:#7a6a5a;font-size:.82rem;">
          Al confirmar, te contactaremos por email para coordinar el pago y el envío.
        </p>
      </div>`,
    showCancelButton: true,
    confirmButtonText: 'Confirmar pedido',
    cancelButtonText: 'Seguir comprando',
    confirmButtonColor: '#896941',
    cancelButtonColor: '#7a6a5a',
  }).then((result) => {
    if (result.isConfirmed) {
      guardarCarrito([]);
      actualizarBadge();
      renderizarPaginaCarrito();

      Swal.fire({
        icon: 'success',
        title: '¡Pedido confirmado!',
        html: `
          <p style="color:#7a6a5a;">
            Recibimos tu solicitud. En breve nos comunicamos con vos para coordinar el pago y el envío.<br><br>
            ¡Gracias por elegirnos! 🧉
          </p>`,
        confirmButtonColor: '#896941',
        confirmButtonText: '¡Genial!',
      });
    }
  });
}

(function init() {
  // Badge en todas las páginas
  actualizarBadge();

  // Página carrito.html
  renderizarPaginaCarrito();

  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) btnCheckout.addEventListener('click', iniciarCheckout);
})();


window.MateRule = window.MateRule || {};
window.MateRule.agregarAlCarrito = agregarAlCarrito;