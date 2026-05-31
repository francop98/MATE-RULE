'use strict';

/* =========================================================
   catalogo.js — mate-rule
   Carga los productos desde /data/productos.json y los
   renderiza dinámicamente en las páginas de catálogo.
   ========================================================= */


// Ruta base al JSON según la ubicación de la página

function rutaProductos() {
  const path = window.location.pathname;
  if (path.includes('/pages/')) return '../data/productos.json';
  return './data/productos.json';
}


// Grid de mates en index.html

(function initGridMates() {
  const grid = document.getElementById('grid-mates');
  if (!grid) return;

  fetch(rutaProductos())
    .then((res) => {
      if (!res.ok) throw new Error('No se pudo cargar productos.json');
      return res.json();
    })
    .then((productos) => {
      const mates = productos.filter((p) => p.tipo === 'mate');
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
              <p class="tarjeta-mate__desc">${producto.descripcion.substring(0, 55)}…</p>
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

      // Animaciones scroll
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

      // Bind botones "Agregar al carrito"
      grid.querySelectorAll('.tarjeta-mate__agregar').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.dataset.id;
          const producto = mates.find((p) => p.id === id);
          if (producto && window.MateRule) {
            window.MateRule.agregarAlCarrito(producto);
          }
        });
      });
    })
    .catch(() => {
      grid.innerHTML =
        '<p style="text-align:center;color:#7a6a5a;">No se pudieron cargar los productos. Intentá de nuevo más tarde.</p>';
    });
})();


// Página de bombillas

(function initBombillas() {
  const contenedor = document.getElementById('bombillas-lista');
  if (!contenedor) return;

  fetch(rutaProductos())
    .then((res) => res.json())
    .then((productos) => {
      const bombillas = productos.filter((p) => p.tipo === 'bombilla');
      renderizarProductos(contenedor, bombillas);
    })
    .catch(() => {
      contenedor.innerHTML = '<p style="color:#7a6a5a;">No se pudieron cargar las bombillas.</p>';
    });
})();


// Página de yerbas

(function initYerbas() {
  const contenedor = document.getElementById('yerbas-lista');
  if (!contenedor) return;

  fetch(rutaProductos())
    .then((res) => res.json())
    .then((productos) => {
      const yerbas = productos.filter((p) => p.tipo === 'yerba');
      renderizarProductos(contenedor, yerbas);
    })
    .catch(() => {
      contenedor.innerHTML = '<p style="color:#7a6a5a;">No se pudieron cargar las yerbas.</p>';
    });
})();


// Página de accesorios

(function initAccesorios() {
  const contenedor = document.getElementById('accesorios-lista');
  if (!contenedor) return;

  fetch(rutaProductos())
    .then((res) => res.json())
    .then((productos) => {
      const accesorios = productos.filter((p) => p.tipo === 'accesorio');
      renderizarProductos(contenedor, accesorios);
    })
    .catch(() => {
      contenedor.innerHTML = '<p style="color:#7a6a5a;">No se pudieron cargar los accesorios.</p>';
    });
})();


// Botón "Agregar al carrito" en páginas de detalle

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


// Helper: renderizar lista de productos como tarjetas

function renderizarProductos(contenedor, productos) {
  contenedor.innerHTML = '';

  if (!productos.length) {
    contenedor.innerHTML =
      '<p style="color:#7a6a5a;text-align:center;">No hay productos disponibles.</p>';
    return;
  }

  productos.forEach((producto) => {
    const article = document.createElement('article');
    article.className = 'producto-card';
    article.innerHTML = `
      <div class="producto-card__body">
        <h3 class="producto-card__nombre">${producto.nombre}</h3>
        <p class="producto-card__desc">${producto.descripcion}</p>
        <ul class="producto-card__features">
          ${producto.caracteristicas.map((c) => `<li>${c}</li>`).join('')}
        </ul>
        <p class="producto-card__precio">$${producto.precio.toLocaleString('es-AR')}</p>
        <button
          class="producto-card__btn"
          data-id="${producto.id}"
          aria-label="Agregar ${producto.nombre} al carrito">
          + Agregar al carrito
        </button>
      </div>
    `;
    contenedor.appendChild(article);
  });

  contenedor.querySelectorAll('.producto-card__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const producto = productos.find((p) => p.id === id);
      if (producto && window.MateRule) {
        window.MateRule.agregarAlCarrito(producto);
      }
    });
  });
}