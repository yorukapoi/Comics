document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.stars-container');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function setCanvasSize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    
    // Initial setup
    setCanvasSize();
    container.appendChild(canvas);
    
    // Handle resize
    window.addEventListener('resize', setCanvasSize);
    
    // Star class for better organization
    class Star {
        constructor() {
            this.reset();
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
        }
        
        reset() {
            this.size = 0.5 + Math.random() * 0.5;
            this.opacity = 0.1 + Math.random() * 0.5;
            this.twinkleSpeed = 1.5 + Math.random() * 2;
            this.twinkleProgress = Math.random() * Math.PI * 2;
        }
        
        update(deltaTime) {
            // Update twinkle with more dramatic effect
            this.twinkleProgress += deltaTime * this.twinkleSpeed;
            this.opacity = 0.05 + (Math.sin(this.twinkleProgress) + 1) * 0.4;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(240, 241, 242, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    // Create stars
    const stars = [];
    const numStars = 1500;
    
    // Create cluster points
    const clusterPoints = [];
    const numClusters = Math.floor(numStars * 0.3);
    
    for (let i = 0; i < numClusters; i++) {
        clusterPoints.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        });
    }
    
    // Initialize stars with clustering
    for (let i = 0; i < numStars; i++) {
        const star = new Star();
        
        // 40% chance to be part of a cluster
        if (Math.random() < 0.4 && clusterPoints.length > 0) {
            const cluster = clusterPoints[Math.floor(Math.random() * clusterPoints.length)];
            const offset = 20;
            star.x = cluster.x + (Math.random() * offset * 2 - offset);
            star.y = cluster.y + (Math.random() * offset * 2 - offset);
        }
        
        stars.push(star);
    }
    
    // Animation variables
    let lastTime = performance.now();
    let rotation = 0;
    
    // Main animation loop
    function animate() {
        const currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update rotation
        rotation += deltaTime / 180; // Full rotation every 180 seconds (faster than 240)
        
        // Save canvas state
        ctx.save();
        
        // Move to center and rotate
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        // Update and draw stars
        for (const star of stars) {
            star.update(deltaTime);
            star.draw();
        }
        
        // Restore canvas state
        ctx.restore();
        
        // Request next frame
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}); 