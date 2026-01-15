// Clase Review
class Review {
    constructor(id, name, rating, category, notes, favorite = false, createdAt = new Date()) {
        this.id = id;
        this.name = name;
        this.rating = rating;
        this.category = category.trim();
        this.notes = notes;
        this.favorite = favorite;
        this.createdAt = createdAt;
    }
}

// Storage
const ReviewStorage = {
    STORAGE_KEY: 'reviewApp_reviews',

    saveReviews(reviews) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(reviews));
    },

    loadReviews() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },

    addReview(review) {
        const reviews = this.loadReviews();
        reviews.push(review);
        this.saveReviews(reviews);
        return review;
    },

    updateReview(id, updatedReview) {
        const reviews = this.loadReviews();
        const index = reviews.findIndex(r => r.id === id);
        if (index !== -1) {
            reviews[index] = { ...reviews[index], ...updatedReview };
            this.saveReviews(reviews);
            return reviews[index];
        }
        return null;
    },

    deleteReview(id) {
        let reviews = this.loadReviews();
        reviews = reviews.filter(r => r.id !== id);
        this.saveReviews(reviews);
        return true;
    },

    getReview(id) {
        const reviews = this.loadReviews();
        return reviews.find(r => r.id === id);
    }
};

// Funciones de utilidad
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Generar estrellas
function generateStars(rating, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // Estrellas llenas
    for (let i = 0; i < fullStars; i++) {
        const star = document.createElement('span');
        star.className = 'star active';
        star.textContent = '★';
        container.appendChild(star);
    }

    // Media estrella
    if (hasHalfStar) {
        const star = document.createElement('span');
        star.className = 'star active';
        star.textContent = '★';
        star.style.opacity = '0.7';
        container.appendChild(star);
    }

    // Estrellas vacías
    const emptyStars = 10 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        const star = document.createElement('span');
        star.className = 'star';
        star.textContent = '★';
        container.appendChild(star);
    }
}

// Actualizar display de estrellas
function updateStarsDisplay() {
    const ratingInput = document.getElementById('ratingValue');
    const ratingText = document.getElementById('ratingText');
    const starsDisplay = document.getElementById('starsDisplay');
    
    if (ratingInput && ratingText && starsDisplay) {
        const rating = parseFloat(ratingInput.value);
        ratingText.textContent = rating.toFixed(1);
        generateStars(rating, 'starsDisplay');
    }
}

// Actualizar display de estrellas en edición
function updateEditStarsDisplay() {
    const ratingInput = document.getElementById('editRating');
    const ratingText = document.getElementById('editRatingText');
    const starsDisplay = document.getElementById('editStarsDisplay');
    
    if (ratingInput && ratingText && starsDisplay) {
        const rating = parseFloat(ratingInput.value);
        ratingText.textContent = rating.toFixed(1);
        generateStars(rating, 'editStarsDisplay');
    }
}

// Cargar reseñas
function loadReviews() {
    AppState.reviews = ReviewStorage.loadReviews();
    return AppState.reviews;
}

// Guardar reseña
function saveReview(reviewData) {
    const review = new Review(
        generateId(),
        reviewData.name,
        parseFloat(reviewData.rating),
        reviewData.category,
        reviewData.notes,
        reviewData.favorite || false
    );

    ReviewStorage.addReview(review);
    AppState.reviews.push(review);
    return review;
}

// Actualizar reseña
function updateReview(id, reviewData) {
    const updated = ReviewStorage.updateReview(id, {
        name: reviewData.name,
        rating: parseFloat(reviewData.rating),
        category: reviewData.category,
        notes: reviewData.notes,
        favorite: reviewData.favorite || false
    });

    if (updated) {
        const index = AppState.reviews.findIndex(r => r.id === id);
        if (index !== -1) {
            AppState.reviews[index] = updated;
        }
    }

    return updated;
}

// Eliminar reseña
function deleteReview(id) {
    const success = ReviewStorage.deleteReview(id);
    if (success) {
        AppState.reviews = AppState.reviews.filter(r => r.id !== id);
    }
    return success;
}

// Handler nueva reseña
function handleNewReview(e) {
    e.preventDefault();

    const name = document.getElementById('reviewName').value.trim();
    const rating = document.getElementById('ratingValue').value;
    const category = document.getElementById('reviewCategory').value.trim();
    const notes = document.getElementById('reviewNotes').value.trim();
    const favorite = document.getElementById('reviewFavorite').checked;

    if (!name || !category) {
        alert('Por favor completa todos los campos obligatorios (*)');
        return;
    }

    saveReview({ name, rating, category, notes, favorite });

    // Limpiar formulario
    e.target.reset();
    updateStarsDisplay();
    document.getElementById('reviewName').focus();

    // Mostrar mensaje de éxito
    showNotification('Reseña guardada exitosamente!', 'success');
    updateUI();
}

// Handler editar reseña
function handleEditReview(e) {
    e.preventDefault();

    const id = document.getElementById('editId').value;
    const name = document.getElementById('editName').value.trim();
    const rating = document.getElementById('editRating').value;
    const category = document.getElementById('editCategory').value.trim();
    const notes = document.getElementById('editNotes').value.trim();
    const favorite = document.getElementById('editFavorite').checked;

    if (!name || !category) {
        alert('Por favor completa todos los campos obligatorios (*)');
        return;
    }

    updateReview(id, { name, rating, category, notes, favorite });
    closeEditModalHandler();
    showNotification('Reseña actualizada!', 'success');
    updateUI();
}

// Handler eliminar reseña
function handleDeleteReview() {
    const id = document.getElementById('editId').value;
    
    if (confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
        deleteReview(id);
        closeEditModalHandler();
        showNotification('Reseña eliminada!', 'success');
        updateUI();
    }
}

// Abrir modal de edición
function openEditModal(id) {
    const review = ReviewStorage.getReview(id);
    if (!review) return;

    AppState.editReviewId = id;

    document.getElementById('editId').value = review.id;
    document.getElementById('editName').value = review.name;
    document.getElementById('editRating').value = review.rating;
    document.getElementById('editCategory').value = review.category;
    document.getElementById('editNotes').value = review.notes;
    document.getElementById('editFavorite').checked = review.favorite;

    updateEditStarsDisplay();

    const modal = document.getElementById('editModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Cerrar modal de edición
function closeEditModalHandler() {
    const modal = document.getElementById('editModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    AppState.editReviewId = null;
}

// Búsqueda
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    const resultsContainer = document.getElementById('searchResults');

    if (!query) {
        hideSearchResults();
        return;
    }

    const results = AppState.reviews.filter(review => 
        review.name.toLowerCase().includes(query) ||
        review.category.toLowerCase().includes(query)
    );

    showSearchResults(results);
}

function showSearchResults(results = null) {
    const container = document.getElementById('searchResults');
    if (!container) return;

    if (results) {
        container.innerHTML = '';
        
        if (results.length === 0) {
            const noResults = document.createElement('div');
            noResults.className = 'search-result-item';
            noResults.textContent = 'No se encontraron resultados';
            container.appendChild(noResults);
        } else {
            results.slice(0, 10).forEach(review => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <strong>${review.name}</strong>
                    <small>${review.category} - ${review.rating}/10</small>
                `;
                item.addEventListener('click', () => {
                    openEditModal(review.id);
                    hideSearchResults();
                    document.getElementById('searchInput').value = '';
                });
                container.appendChild(item);
            });
        }
    }

    container.classList.add('active');
}

function hideSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.classList.remove('active');
    }
}

// Actualizar UI según página actual
function updateUI() {
    switch (AppState.currentPage) {
        case 'home':
            updateHomePage();
            break;
        case 'reviews':
            updateReviewsPage();
            break;
        case 'top-rated':
            updateTopRatedPage();
            break;
        case 'favorites':
            updateFavoritesPage();
            break;
        case 'categories':
            updateCategoriesPage();
            break;
    }
}

// Página Home
function updateHomePage() {
    updateStarsDisplay();
    updateCategoriesList();
}

function updateCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;

    const categories = [...new Set(AppState.reviews.map(r => r.category))];
    container.innerHTML = '';

    categories.forEach(category => {
        const tag = document.createElement('span');
        tag.className = 'category-tag';
        tag.textContent = category;
        tag.addEventListener('click', () => {
            document.getElementById('reviewCategory').value = category;
        });
        container.appendChild(tag);
    });
}

// Página Todas las reseñas
function updateReviewsPage() {
    const container = document.getElementById('allReviewsGrid');
    if (!container) return;

    let reviews = [...AppState.reviews];
    const sortBy = document.getElementById('sortReviews').value;

    switch (sortBy) {
        case 'newest':
            reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'oldest':
            reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            break;
        case 'highest':
            reviews.sort((a, b) => b.rating - a.rating);
            break;
        case 'lowest':
            reviews.sort((a, b) => a.rating - b.rating);
            break;
        case 'name':
            reviews.sort((a, b) => a.name.localeCompare(b.name));
            break;
    }

    renderReviewsGrid(container, reviews);
}

// Página Mejor puntuadas
function updateTopRatedPage() {
    const container = document.getElementById('topRatedGrid');
    if (!container) return;

    const topRated = AppState.reviews.filter(r => r.rating >= 7);
    topRated.sort((a, b) => b.rating - a.rating);
    
    renderReviewsGrid(container, topRated);
}

// Página Favoritas
function updateFavoritesPage() {
    const container = document.getElementById('favoritesGrid');
    if (!container) return;

    const favorites = AppState.reviews.filter(r => r.favorite);
    favorites.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    renderReviewsGrid(container, favorites);
}

// Página Categorías
function updateCategoriesPage() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    const categoryCounts = AppState.reviews.reduce((acc, review) => {
        acc[review.category] = (acc[review.category] || 0) + 1;
        return acc;
    }, {});

    container.innerHTML = '';

    Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([category, count]) => {
            const chip = document.createElement('div');
            chip.className = 'category-chip';
            chip.innerHTML = `
                ${category}
                <span class="category-count">${count}</span>
            `;
            chip.addEventListener('click', () => {
                changePage('reviews');
                // Aquí podrías implementar filtrado por categoría
            });
            container.appendChild(chip);
        });
}

// Renderizar grid de reseñas
function renderReviewsGrid(container, reviews) {
    container.innerHTML = '';

    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="no-reviews">
                <p>No hay reseñas para mostrar</p>
            </div>
        `;
        return;
    }

    reviews.forEach(review => {
        const card = createReviewCard(review);
        container.appendChild(card);
    });
}

// Crear tarjeta de reseña
function createReviewCard(review) {
    const card = document.createElement('div');
    card.className = 'review-card';
    
    const starsId = `stars-${review.id}`;
    
    card.innerHTML = `
        <div class="review-header">
            <h3 class="review-title">${review.name}</h3>
            <button class="favorite-btn ${review.favorite ? 'active' : ''}" 
                    onclick="toggleFavorite('${review.id}')">
                ${review.favorite ? '❤️' : '🤍'}
            </button>
        </div>
        <span class="review-category">${review.category}</span>
        <div class="review-rating">
            <div class="stars" id="${starsId}"></div>
        </div>
        <p class="review-notes">${review.notes || 'Sin notas adicionales'}</p>
        <div class="review-meta">
            <small>${formatDate(review.createdAt)}</small>
            <small>Puntuación: ${review.rating}/10</small>
        </div>
        <div class="review-actions">
            <button class="edit-btn" onclick="openEditModal('${review.id}')">
                Editar
            </button>
        </div>
    `;

    // Generar estrellas después de crear el card
    setTimeout(() => {
        generateStars(review.rating, starsId);
    }, 0);

    return card;
}

// Toggle favorito
function toggleFavorite(id) {
    const review = ReviewStorage.getReview(id);
    if (review) {
        review.favorite = !review.favorite;
        ReviewStorage.updateReview(id, { favorite: review.favorite });
        
        // Actualizar UI
        updateUI();
        showNotification(review.favorite ? 'Añadido a favoritos' : 'Removido de favoritos', 'info');
    }
}

// Notificaciones
function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6d28d9'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Añadir estilos de animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Inicializar estrellas al cargar
window.addEventListener('load', () => {
    updateStarsDisplay();
    
    // Inicializar también para el modal de edición
    const editRatingInput = document.getElementById('editRating');
    if (editRatingInput) {
        editRatingInput.addEventListener('input', updateEditStarsDisplay);
    }
});