
// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/entradas')
        .then(response => response.json())
        .then(data => {
            const carousel = document.getElementById('carousel');
            data.forEach((entrada, index) => {
                const slide = document.createElement('div');
                slide.classList.add('carousel-deslizar');
                if (index === 0) slide.classList.add('active'); // Añadir clase 'active' a la primera diapositiva

                slide.innerHTML = `
                <div class="carousel-contenedor">
                    <div class="contenedor">
                        <div class="seccionTexto">
                        <h1>CONECTAR LAB CHACO</h1>
                            <h2>${entrada.titulo}</h2>
                            <p>${entrada.comentario}</p>
                        </div>
                         <div class="seccionImagen">
                            <img src="/uploads/${entrada.imagen}" alt="${entrada.titulo}">
                        </div>
                    </div>
                </div>
                `;
                carousel.appendChild(slide);
            });
        })
        .catch(error => console.error('Error al cargar las entradas:', error));
});
function nextSlide() {
    showSlide(currentSlide + 1);
}

/**
 * Muestra la diapositiva anterior.
 */
function prevSlide() {
    showSlide(currentSlide - 1);
}

// Cambio automático de diapositiva cada 3 segundos
setInterval(() => {
    nextSlide();
}, 3000);