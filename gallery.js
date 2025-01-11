document.addEventListener('DOMContentLoaded', function() {
    const bannerContent = document.querySelector('.banner-content');
    
    // Add scroll handler for banner content
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const opacity = 1 - (scrollPosition / 500);
        const moveY = -50 - (scrollPosition / 10);
        
        if (opacity >= 0) {
            bannerContent.style.opacity = opacity;
            bannerContent.style.transform = `translate(-50%, ${moveY}%)`;
        }
    });

    // Create simplified fullscreen modal
    const modal = document.createElement('div');
    modal.className = 'fullscreen-modal';
    modal.innerHTML = `
        <button class="modal-close">&times;</button>
        <img src="" alt="">
    `;
    document.body.appendChild(modal);

    // Setup Intersection Observer for fade-in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Load artwork data from JSON
    fetch('artworks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Set banner
            const banner = document.getElementById('galleryBanner');
            banner.style.backgroundImage = `url(${data.banner.image})`;
            document.getElementById('galleryTitle').textContent = data.banner.title;

            // Populate gallery grid
            const galleryGrid = document.getElementById('galleryGrid');
            data.artworks.forEach(artwork => {
                const artworkElement = document.createElement('div');
                artworkElement.className = 'artwork';
                
                const img = new Image();
                img.src = artwork.image;
                img.alt = artwork.title;
                img.loading = 'lazy';
                
                // Handle fullscreen view
                artworkElement.addEventListener('click', () => {
                    const modalImg = modal.querySelector('img');
                    modalImg.src = artwork.image;
                    modal.classList.add('active');
                });

                artworkElement.appendChild(img);
                galleryGrid.appendChild(artworkElement);

                // Observe for fade-in
                observer.observe(artworkElement);
            });
        })
        .catch(error => console.error('Error loading gallery:', error));

    // Close modal functionality
    const closeModal = () => modal.classList.remove('active');
    modal.querySelector('.modal-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });
    modal.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}); 