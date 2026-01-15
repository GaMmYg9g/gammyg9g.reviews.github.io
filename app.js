// Estado de la aplicación
const AppState = {
    reviews: [],
    currentPage: 'home',
    currentTheme: localStorage.getItem('theme') || 'light',
    editReviewId: null
};

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
    initEventListeners();
    loadReviews();
    updateUI();
    initServiceWorker();
});

// Inicializar tema
function initTheme() {
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
    updateThemeIcon();
}

// Cambiar tema
function toggleTheme() {
    AppState.currentTheme = AppState.currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', AppState.currentTheme);
    localStorage.setItem('theme', AppState.currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = AppState.currentTheme === 'light' ? '🌙' : '☀️';
    }
}

// Menú
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const closeMenu = document.getElementById('closeMenu');
    const overlay = document.getElementById('overlay');
    const menuItems = document.querySelectorAll('.menu-item');
    const exitBtn = document.getElementById('exitApp');

    menuToggle.addEventListener('click', toggleMenu);
    closeMenu.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    menuItems.forEach(item => {
        if (!item.classList.contains('exit-btn')) {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                changePage(page);
                toggleMenu();
            });
        }
    });

    exitBtn.addEventListener('click', exitApp);
}

function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Cambiar página
function changePage(page) {
    // Actualizar menú activo
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === page) {
            item.classList.add('active');
        }
    });

    // Ocultar todas las páginas
    document.querySelectorAll('.page').forEach(pageEl => {
        pageEl.classList.remove('active');
    });

    // Mostrar página seleccionada
    const targetPage = document.getElementById(`${page}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        AppState.currentPage = page;
        updateUI();
    }
}

// Salir de la app
function exitApp() {
    if (window.navigator && window.navigator.app) {
        window.navigator.app.exitApp();
    } else if (window.close) {
        window.close();
    } else {
        alert('Para cerrar la app, usa el botón de cerrar de tu navegador');
    }
}

// Event listeners
function initEventListeners() {
    // Tema
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Formulario de nueva reseña
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleNewReview);
    }

    // Rating input
    const ratingInput = document.getElementById('ratingValue');
    if (ratingInput) {
        ratingInput.addEventListener('input', updateStarsDisplay);
    }

    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('focus', showSearchResults);
        searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                hideSearchResults();
            }, 200);
        });
    }

    // Sort reviews
    const sortSelect = document.getElementById('sortReviews');
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            if (AppState.currentPage === 'reviews') {
                updateUI();
            }
        });
    }

    // Modal
    const closeEditModal = document.getElementById('closeEditModal');
    if (closeEditModal) {
        closeEditModal.addEventListener('click', closeEditModalHandler);
    }

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditReview);
    }

    const deleteReviewBtn = document.getElementById('deleteReviewBtn');
    if (deleteReviewBtn) {
        deleteReviewBtn.addEventListener('click', handleDeleteReview);
    }
}

// Service Worker
function initServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado con éxito:', registration);
            })
            .catch(error => {
                console.log('Error al registrar Service Worker:', error);
            });
    }
}