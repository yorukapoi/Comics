// Constants and State Management
const state = {
    currentComic: null,
    currentChapter: null,
    chapters: [],
    sortAscending: true,
    observer: null,
    loadedPages: new Set()
};

// DOM Elements
const elements = {
    comicTitle: document.getElementById('comic-title'),
    chapterTitle: document.getElementById('chapter-title'),
    chapterList: document.getElementById('chapter-list'),
    pagesContainer: document.getElementById('pages-container'),
    prevChapter: document.getElementById('prev-chapter'),
    nextChapter: document.getElementById('next-chapter'),
    prevChapterBottom: document.getElementById('prev-chapter-bottom'),
    nextChapterBottom: document.getElementById('next-chapter-bottom'),
    sortChapters: document.getElementById('sort-chapters'),
    showChapters: document.getElementById('show-chapters'),
    sidebar: document.querySelector('.chapter-sidebar')
};

// Initialize Intersection Observer for lazy loading
function initializeObserver() {
    state.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (!state.loadedPages.has(img.dataset.src)) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    state.loadedPages.add(img.dataset.src);
                }
            }
        });
    }, {
        rootMargin: '50px 0px',
        threshold: 0.1
    });
}

// Fetch Comic Data
async function fetchComicData(comicId) {
    try {
        const response = await fetch('comics.json');
        const data = await response.json();
        const comic = data.comics.find(c => c.id === parseInt(comicId));
        if (!comic) throw new Error('Comic not found');
        
        // For each chapter, scan the folder for images
        for (const chapter of comic.chapters) {
            const folderPath = `ChapterFolder/${comic.folder}/${chapter.folder}`;
            try {
                const imageFiles = await scanChapterFolder(folderPath);
                chapter.pages = imageFiles.sort((a, b) => {
                    // Sort numerically by extracting numbers from filenames
                    const numA = parseInt(a.match(/\d+/) || [0]);
                    const numB = parseInt(b.match(/\d+/) || [0]);
                    return numA - numB;
                });
            } catch (error) {
                console.error(`Error scanning chapter folder: ${folderPath}`, error);
                chapter.pages = [];
            }
        }
        
        return comic;
    } catch (error) {
        console.error('Error fetching comic data:', error);
        return null;
    }
}

// Scan chapter folder for images
async function scanChapterFolder(folderPath) {
    try {
        const images = [];
        // We'll check for images with .jpg extension
        // Adjust the number based on how many images you typically have per chapter
        for (let i = 1; i <= 3; i++) {
            const imagePath = `${folderPath}/${i}.jpg`;
            images.push(imagePath);
        }
        return images;
    } catch (error) {
        console.error('Error scanning folder:', error);
        return [];
    }
}

// Load Comic
async function loadComic(comicId) {
    const data = await fetchComicData(comicId);
    if (!data) return;

    state.currentComic = comicId;
    state.chapters = data.chapters;
    elements.comicTitle.textContent = data.title || 'Comic Title';
    
    // Update the page title with just the comic name
    document.title = data.title;
    
    renderChapterList();
    
    // Load the first chapter if none is selected
    if (!state.currentChapter && state.chapters.length > 0) {
        loadChapter(state.chapters[0].id);
    }
}

// Render Chapter List
function renderChapterList() {
    const chapters = [...state.chapters];
    if (!state.sortAscending) {
        chapters.reverse();
    }

    elements.chapterList.innerHTML = '';
    chapters.forEach(chapter => {
        const chapterElement = document.createElement('div');
        chapterElement.className = `chapter-item ${state.currentChapter === chapter.id ? 'active' : ''}`;
        chapterElement.innerHTML = `
            <h3>${chapter.title}</h3>
            <span class="chapter-date">${new Date(chapter.release_date).toLocaleDateString()}</span>
        `;
        chapterElement.addEventListener('click', () => {
            loadChapter(chapter.id);
            // Close sidebar on mobile when chapter is selected
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
        elements.chapterList.appendChild(chapterElement);
    });
}

// Load Chapter
async function loadChapter(chapterId) {
    const chapter = state.chapters.find(ch => ch.id === chapterId);
    if (!chapter) return;

    state.currentChapter = chapterId;
    elements.chapterTitle.textContent = chapter.title;
    
    // Clear existing pages
    elements.pagesContainer.innerHTML = '';
    state.loadedPages.clear();

    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    elements.pagesContainer.appendChild(loadingIndicator);

    // Create and append pages
    let hasLoadedAnyImages = false;
    const promises = chapter.pages.map((pageUrl, index) => {
        return new Promise((resolve) => {
            const pageContainer = document.createElement('div');
            pageContainer.className = 'comic-page';
            
            const img = document.createElement('img');
            // Don't use dataset.src anymore, directly set the src
            img.alt = `Page ${index + 1}`;
            
            // Add error handling for missing images
            img.onerror = () => {
                console.warn(`Failed to load image: ${pageUrl}`);
                pageContainer.remove(); // Remove container if image fails to load
                resolve(false);
            };
            
            img.onload = () => {
                hasLoadedAnyImages = true;
                pageContainer.classList.add('loaded');
                resolve(true);
            };
            
            // Set the source after adding event listeners
            img.src = pageUrl;
            pageContainer.appendChild(img);
            elements.pagesContainer.appendChild(pageContainer);
        });
    });

    // Wait for all images to either load or fail
    await Promise.all(promises);
    
    // Remove loading indicator
    loadingIndicator.remove();

    // Show message if no images loaded
    if (!hasLoadedAnyImages) {
        const message = document.createElement('div');
        message.className = 'no-images-message';
        message.textContent = 'No images found for this chapter.';
        elements.pagesContainer.appendChild(message);
    }

    // Update navigation buttons
    updateNavigationButtons();
    // Update chapter list to show active chapter
    renderChapterList();
    
    // Scroll to top with smooth behavior on mobile
    if (window.innerWidth <= 768) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo(0, 0);
    }
}

// Update Navigation Buttons
function updateNavigationButtons() {
    const currentIndex = state.chapters.findIndex(ch => ch.id === state.currentChapter);
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === state.chapters.length - 1;

    elements.prevChapter.disabled = isFirst;
    elements.prevChapterBottom.disabled = isFirst;
    elements.nextChapter.disabled = isLast;
    elements.nextChapterBottom.disabled = isLast;
}

// Navigation Functions
function navigateChapter(direction) {
    const currentIndex = state.chapters.findIndex(ch => ch.id === state.currentChapter);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < state.chapters.length) {
        loadChapter(state.chapters[newIndex].id);
    }
}

// Mobile Sidebar Toggle
function toggleSidebar() {
    elements.sidebar.classList.toggle('active');
    
    // Create or remove overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('active');

    // Toggle body scroll
    document.body.style.overflow = elements.sidebar.classList.contains('active') ? 'hidden' : '';
}

// Event Listeners
function initializeEventListeners() {
    elements.prevChapter.addEventListener('click', () => navigateChapter(-1));
    elements.nextChapter.addEventListener('click', () => navigateChapter(1));
    elements.prevChapterBottom.addEventListener('click', () => navigateChapter(-1));
    elements.nextChapterBottom.addEventListener('click', () => navigateChapter(1));
    
    elements.sortChapters.addEventListener('click', () => {
        state.sortAscending = !state.sortAscending;
        renderChapterList();
    });

    elements.showChapters.addEventListener('click', toggleSidebar);

    // Handle keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            navigateChapter(-1);
        } else if (e.key === 'ArrowRight') {
            navigateChapter(1);
        } else if (e.key === 'Escape' && window.innerWidth <= 768) {
            // Close sidebar on ESC key on mobile
            if (elements.sidebar.classList.contains('active')) {
                toggleSidebar();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            // Reset mobile-specific styles when returning to desktop
            document.body.style.overflow = '';
            if (elements.sidebar.classList.contains('active')) {
                elements.sidebar.classList.remove('active');
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) {
                    overlay.classList.remove('active');
                }
            }
        }
    });
}

// Initialize
function initialize() {
    initializeObserver();
    initializeEventListeners();
    
    // Get comic ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const comicId = urlParams.get('comic');
    
    if (comicId) {
        loadComic(comicId);
    } else {
        console.error('No comic ID provided');
        elements.comicTitle.textContent = 'Error: No comic selected';
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', initialize); 