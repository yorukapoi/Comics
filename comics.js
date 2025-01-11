// Comic data
const comics = [
    {
        id: 1,
        title: "Phantasmal Ardor",
        thumbnail: "images/phantasmalardor.jpg",
        genres: ["Romance", "Fantasy", "Drama", "Enemies to Lovers"]
    },
    {
        id: 2,
        title: "Precarious Alley",
        thumbnail: "images/placeholder.jpg",
        genres: ["Supernatural", "Action", "Fantasy", "Shounen"]
    },
    {
        id: 3,
        title: "Pages of Enchainment",
        thumbnail: "images/pagesofencahinment.jpg",
        genres: ["Isekai", "Romance", "Harem", "Josei"]
    },
    {
        id: 4,
        title: "Yesterday's Echo",
        thumbnail: "images/placeholder.jpg",
        genres: ["BL", "Drama", "Omegaverse", "Fantasy"]
    },
    {
        id: 5,
        title: "Kuzman and Figaro",
        thumbnail: "images/placeholder.jpg",
        genres: ["Slice of life", "Comedy", "Oneshots", "Fantasy"]
    }
];

// Function to create comic cards
function createComicCards() {
    console.log('Creating comic cards...');
    const grid = document.querySelector('.comics-grid');
    
    if (!grid) {
        console.error('Comics grid not found!');
        return;
    }

    // Clear existing cards
    grid.innerHTML = '';
    console.log('Grid cleared, adding cards...');

    comics.forEach((comic, index) => {
        const card = document.createElement('div');
        card.className = 'comic-card';
        
        card.innerHTML = `
            <div class="comic-thumbnail">
                <img src="${comic.thumbnail}" alt="${comic.title}">
                <div class="comic-overlay">
                    <a href="reader.html?comic=${comic.id}" class="read-button">Read Now</a>
                    <div class="genre-tags">
                        ${comic.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div class="comic-info">
                <h2>${comic.title}</h2>
            </div>
        `;
        
        grid.appendChild(card);
        console.log(`Added card ${index + 1}: ${comic.title}`);
    });

    console.log('All cards created, total:', comics.length);
    return Array.from(document.querySelectorAll('.comic-card'));
}

// Mobile Carousel Functionality
function initMobileCarousel() {
    console.log('Initializing mobile carousel...');
    
    const grid = document.querySelector('.comics-grid');
    if (!grid) {
        console.error('Grid not found!');
        return;
    }

    let cards = Array.from(document.querySelectorAll('.comic-card'));
    if (cards.length === 0) {
        console.log('No cards found, creating them...');
        cards = createComicCards();
    }

    console.log('Found cards:', cards.length);

    let currentIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    function setupMobileView() {
        console.log('Setting up mobile view');
        grid.style.height = '100%';
        grid.style.overflow = 'hidden';

        // Remove any existing indicators
        const existingIndicators = document.querySelector('.carousel-indicators');
        if (existingIndicators) {
            existingIndicators.remove();
        }

        // Create indicators
        const indicators = document.createElement('div');
        indicators.className = 'carousel-indicators';
        cards.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.className = `indicator ${index === 0 ? 'active' : ''}`;
            indicators.appendChild(dot);
        });
        document.querySelector('.comics-container').appendChild(indicators);

        updateCards();
    }

    function setupDesktopView() {
        console.log('Setting up desktop view');
        grid.style.height = '';
        grid.style.overflow = '';
        
        cards.forEach(card => {
            card.className = 'comic-card';
            card.style.transform = '';
            card.style.opacity = '';
            card.style.position = '';
        });

        const indicators = document.querySelector('.carousel-indicators');
        if (indicators) {
            indicators.remove();
        }
    }

    function updateCards() {
        console.log('Updating cards, current index:', currentIndex);
        cards.forEach((card, index) => {
            card.className = 'comic-card';
            card.style.position = 'absolute';
            
            if (index === currentIndex) {
                card.classList.add('active');
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === cards.length - 1)) {
                card.classList.add('previous');
            } else if (index === currentIndex + 1 || (currentIndex === cards.length - 1 && index === 0)) {
                card.classList.add('next');
            }
        });

        // Update indicators
        const indicators = document.querySelectorAll('.indicator');
        indicators.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        currentX = startX;
    }

    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        cards.forEach((card, index) => {
            const offset = (index - currentIndex) * 100;
            const dragOffset = (diff / window.innerWidth) * 100;
            card.style.transform = `translateX(calc(${offset + dragOffset}% - 50%)) scale(${index === currentIndex ? 1 : 0.8})`;
        });
    }

    function handleTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        const threshold = window.innerWidth * 0.2;

        if (Math.abs(diff) > threshold) {
            if (diff > 0 && currentIndex > 0) {
                currentIndex--;
            } else if (diff < 0 && currentIndex < cards.length - 1) {
                currentIndex++;
            }
        }

        cards.forEach(card => {
            card.style.transform = '';
        });
        updateCards();
    }

    // Initial setup based on screen size
    if (window.innerWidth <= 768) {
        setupMobileView();
    } else {
        setupDesktopView();
    }

    // Add event listeners
    grid.addEventListener('touchstart', handleTouchStart, { passive: false });
    grid.addEventListener('touchmove', handleTouchMove, { passive: false });
    grid.addEventListener('touchend', handleTouchEnd);

    // Handle window resize
    window.addEventListener('resize', () => {
        console.log('Window resized:', window.innerWidth);
        if (window.innerWidth <= 768) {
            setupMobileView();
        } else {
            setupDesktopView();
        }
    });
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing comics page...');
    createComicCards();
    initMobileCarousel();
}); 