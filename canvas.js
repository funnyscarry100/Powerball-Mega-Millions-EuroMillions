// Animated 3D-like Green Background Canvas

const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

// Set canvas dimensions
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize canvas size
resizeCanvas();

// Particles system
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = `rgba(76, 175, 80, ${Math.random() * 0.3 + 0.1})`;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = Math.random() * 30 + 10;
        this.waveFrequency = Math.random() * 0.02 + 0.005;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY + Math.sin((this.x * this.waveFrequency) + this.waveOffset) * 0.5;
        
        // Wave motion
        this.x += Math.sin(Date.now() * 0.001 + this.waveOffset) * 0.2;
        this.y += Math.cos(Date.now() * 0.001 + this.waveOffset) * 0.2;
        
        // Wrap around edges
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.x < -50) this.x = canvas.width + 50;
        if (this.y > canvas.height + 50) this.y = -50;
        if (this.y < -50) this.y = canvas.height + 50;
        
        // Pulsing effect
        this.size = 1 + Math.sin(Date.now() * 0.002 + this.waveOffset) * 2;
        this.opacity = 0.1 + Math.sin(Date.now() * 0.001 + this.waveOffset) * 0.2;
    }
    
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        
        // Glow effect
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(76, 175, 80, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// Create particles
const particles = [];
for (let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

// Connection lines
function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const opacity = 1 - (distance / 150);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(76, 175, 80, ${opacity * 0.1})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }
}

// Gradient background
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, 'rgba(232, 245, 233, 0.1)');
    gradient.addColorStop(1, 'rgba(200, 230, 201, 0.05)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Floating geometric shapes
class Shape {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 40 + 10;
        this.speedX = Math.random() * 0.2 - 0.1;
        this.speedY = Math.random() * 0.2 - 0.1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = Math.random() * 0.02 - 0.01;
        this.type = Math.floor(Math.random() * 3); // 0: circle, 1: triangle, 2: square
        this.opacity = Math.random() * 0.05 + 0.02;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Wrap around edges
        if (this.x > canvas.width + 100) this.x = -100;
        if (this.x < -100) this.x = canvas.width + 100;
        if (this.y > canvas.height + 100) this.y = -100;
        if (this.y < -100) this.y = canvas.height + 100;
        
        // Gentle floating motion
        this.x += Math.sin(Date.now() * 0.0005 + this.y * 0.01) * 0.1;
        this.y += Math.cos(Date.now() * 0.0005 + this.x * 0.01) * 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = 'rgba(76, 175, 80, 0.3)';
        ctx.strokeStyle = 'rgba(56, 142, 60, 0.2)';
        ctx.lineWidth = 1;
        
        switch(this.type) {
            case 0: // Circle
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                break;
            case 1: // Triangle
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                    const angle = (i * Math.PI * 2) / 3;
                    const x = Math.cos(angle) * this.size / 2;
                    const y = Math.sin(angle) * this.size / 2;
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                break;
            case 2: // Square
                ctx.beginPath();
                ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
                break;
        }
        
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

// Create shapes
const shapes = [];
for (let i = 0; i < 8; i++) {
    shapes.push(new Shape());
}

// Animation loop
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw shapes
    shapes.forEach(shape => {
        shape.update();
        shape.draw();
    });
    
    // Draw connections
    drawConnections();
    
    // Update and draw particles
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    
    // Add some subtle grid lines
    drawGrid();
    
    requestAnimationFrame(animate);
}

// Subtle grid lines
function drawGrid() {
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.03)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
});

// Start animation
animate();

// Mouse interaction (optional)
let mouseX = 0;
let mouseY = 0;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Interactive effect: particles move away from cursor
    particles.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            particle.x += dx / distance * 2;
            particle.y += dy / distance * 2;
        }
    });
});

// Touch interaction for mobile
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    
    particles.forEach(particle => {
        const dx = particle.x - mouseX;
        const dy = particle.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            particle.x += dx / distance * 2;
            particle.y += dy / distance * 2;
        }
    });
}, { passive: false });

// Add some interactive click effect
canvas.addEventListener('click', (e) => {
    // Create a ripple effect
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            particles.push(new Particle());
            particles[particles.length - 1].x = e.clientX;
            particles[particles.length - 1].y = e.clientY;
        }, i * 50);
    }
});
