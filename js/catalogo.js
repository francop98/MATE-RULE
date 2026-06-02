'use strict';

(function initGridMates() {
  const grid = document.getElementById('grid-mates');
  if (!grid) return;

  fetch('./data/productos.json')
    .then((res) => {
      if (!res.ok) throw new Error('No se pudo cargar productos.json');
      return res.json();
    })
    .then((productos) => {
      const mates = productos.filter((p) => p.tipo === 'mate');
      if (!mates.length) return; // Si no hay datos, deja el HTML estático
      grid.innerHTML = '';

      mates.forEach((producto) => {
        const article = document.createElement('article');
        article.className = 'tarjeta-mate';
        article.innerHTML = `
          <a href="${producto.href}" aria-label="Ver ${producto.nombre}">
            <img
              class="tarjeta-mate__img"
              src="${producto.imagen}"
              alt="${producto.alt}"
              loading="lazy"
              width="300"
              height="220">
            <div class="tarjeta-mate__body">
              <h3 class="tarjeta-mate__nombre">${producto.nombre}</h3>
              <p class="tarjeta-mate__desc">${producto.descripcion.substring(0, 45)}…</p>
            </div>
          </a>
          <button
            class="tarjeta-mate__agregar"
            aria-label="Agregar ${producto.nombre} al carrito"
            data-id="${producto.id}">
            + Agregar al carrito
          </button>
        `;
        grid.appendChild(article);
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      grid.querySelectorAll('.tarjeta-mate').forEach((el) => observer.observe(el));

      grid.querySelectorAll('.tarjeta-mate__agregar').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const producto = mates.find((p) => p.id === btn.dataset.id);
          if (producto && window.MateRule) {
            window.MateRule.agregarAlCarrito(producto);
          }
        });
      });
    })
    .catch(() => {
      // Si falla el fetch, el HTML estático del index queda visible — no hacer nada
    });
})();


(function initDetalleProducto() {
  const btn = document.getElementById('btn-agregar-detalle');
  if (!btn) return;

  const id     = btn.dataset.productId;
  const nombre = btn.dataset.productNombre;
  const precio = parseInt(btn.dataset.productPrecio, 10);

  btn.addEventListener('click', () => {
    if (window.MateRule && id && nombre && precio) {
      window.MateRule.agregarAlCarrito({ id, nombre, precio });
    }
  });
})();