// Enhanced 3D Background Canvas with Interactive Effects

class BackgroundCanvas {
    constructor(canvasId = 'bg-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.shapes = [];
        this.interactive = true;
        this.mouse = { x: 0, y: 0, radius: 100 };
        this.touch = { x: 0, y: 0, radius: 150, active: false };
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.createShapes();
        this.setupEventListeners();
        this.animate();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        const particleCount = Math.min(100, Math.floor((window.innerWidth * window.innerHeight) / 10000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
    }
    
    createShapes() {
        const shapeCount = Math.min(10, Math.floor((window.innerWidth * window.innerHeight) / 50000));
        
        for (let i = 0; i < shapeCount; i++) {
            this.shapes.push(new Shape(this.canvas.width, this.canvas.height));
        }
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles.forEach(p => p.checkBounds(this.canvas.width, this.canvas.height));
            this.shapes.forEach(s => s.checkBounds(this.canvas.width, this.canvas.height));
        });
        
        // Mouse movement
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -100;
            this.mouse.y = -100;
        });
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
            this.touch.active = true;
            
            // Create ripple effect
            this.createRipple(this.touch.x, this.touch.y);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            this.touch.x = touch.clientX - rect.left;
            this.touch.y = touch.clientY - rect.top;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.touch.active = false;
        });
        
        // Click effect
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.createClickEffect(x, y);
        });
    }
    
    createRipple(x, y) {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const particle = new Particle(this.canvas.width, this.canvas.height);
                particle.x = x;
                particle.y = y;
                particle.size = Math.random() * 4 + 2;
                particle.speedX = (Math.random() - 0.5) * 2;
                particle.speedY = (Math.random() - 0.5) * 2;
                particle.color = `rgba(76, 175, 80, ${Math.random() * 0.3 + 0.1})`;
                this.particles.push(particle);
            }, i * 50);
        }
    }
    
    createClickEffect(x, y) {
        // Create expanding circle
        const circle = {
            x: x,
            y: y,
            radius: 0,
            maxRadius: 100,
            color: 'rgba(76, 175, 80, 0.2)',
            lineWidth: 2,
            growing: true,
            update: function() {
                if (this.growing) {
                    this.radius += 2;
                    if (this.radius >= this.maxRadius) {
                        this.growing = false;
                    }
                }
            },
            draw: function(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.lineWidth;
                ctx.stroke();
            }
        };
        
        // Add to shapes temporarily
        this.shapes.push(circle);
        
        // Remove after animation
        setTimeout(() => {
            const index = this.shapes.indexOf(circle);
            if (index > -1) {
                this.shapes.splice(index, 1);
            }
        }, 1000);
    }
    
    drawBackground() {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(232, 245, 233, 0.05)');
        gradient.addColorStop(1, 'rgba(200, 230, 201, 0.02)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Subtle grid
        this.drawGrid();
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(76, 175, 80, 0.03)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = 1 - (distance / 150);
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(76, 175, 80, ${opacity * 0.1})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    animate() {
        // Clear with slight fade effect for trails
        this.ctx.fillStyle = 'rgba(248, 249, 250, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Update and draw shapes
        this.shapes.forEach(shape => {
            if (shape.update) shape.update();
            if (shape.draw) shape.draw(this.ctx);
        });
        
        // Draw connections
        this.drawConnections();
        
        // Update and draw particles with interaction
        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = particle.x - this.mouse.x;
            const dy = particle.y - this.mouse.y;
            const mouseDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (mouseDistance < this.mouse.radius) {
                particle.x += dx / mouseDistance * 2;
                particle.y += dy / mouseDistance * 2;
            }
            
            // Touch interaction
            if (this.touch.active) {
                const tdx = particle.x - this.touch.x;
                const tdy = particle.y - this.touch.y;
                const touchDistance = Math.sqrt(tdx * tdy + tdy * tdy);
                
                if (touchDistance < this.touch.radius) {
                    particle.x += tdx / touchDistance * 3;
                    particle.y += tdy / touchDistance * 3;
                }
            }
            
            particle.update();
            particle.draw(this.ctx);
        });
        
        // Clean up particles that are out of bounds
        this.particles = this.particles.filter(p => !p.isOutOfBounds(this.canvas.width, this.canvas.height));
        
        // Maintain particle count
        if (this.particles.length < 50) {
            this.particles.push(new Particle(this.canvas.width, this.canvas.height));
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = `rgba(76, 175, 80, ${Math.random() * 0.3 + 0.1})`;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = Math.random() * 20 + 5;
        this.waveFrequency = Math.random() * 0.01 + 0.005;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulseOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        // Wave motion
        this.x += Math.sin(Date.now() * 0.001 * this.waveFrequency + this.waveOffset) * 0.3;
        this.y += Math.cos(Date.now() * 0.001 * this.waveFrequency + this.waveOffset) * 0.3;
        
        // Random movement
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Pulsing effect
        this.size = 1 + Math.sin(Date.now() * this.pulseSpeed + this.pulseOffset) * 2;
        this.opacity = 0.1 + Math.sin(Date.now() * 0.001 + this.waveOffset) * 0.2;
        
        // Wrap around edges
        if (this.x > window.innerWidth + 50) this.x = -50;
        if (this.x < -50) this.x = window.innerWidth + 50;
        if (this.y > window.innerHeight + 50) this.y = -50;
        if (this.y < -50) this.y = window.innerHeight + 50;
    }
    
    draw(ctx) {
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
        
        ctx.globalAlpha = 1;
    }
    
    checkBounds(width, height) {
        if (this.x > width) this.x = width;
        if (this.x < 0) this.x = 0;
        if (this.y > height) this.y = height;
        if (this.y < 0) this.y = 0;
    }
    
    isOutOfBounds(width, height) {
        return this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100;
    }
}

class Shape {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 40 + 10;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.type = Math.floor(Math.random() * 3);
        this.opacity = Math.random() * 0.05 + 0.02;
        this.color = `rgba(76, 175, 80, ${this.opacity})`;
        this.strokeColor = `rgba(56, 142, 60, ${this.opacity * 0.7})`;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Gentle floating motion
        this.x += Math.sin(Date.now() * 0.0005 + this.y * 0.01) * 0.1;
        this.y += Math.cos(Date.now() * 0.0005 + this.x * 0.01) * 0.1;
        
        // Wrap around edges
        if (this.x > window.innerWidth + 100) this.x = -100;
        if (this.x < -100) this.x = window.innerWidth + 100;
        if (this.y > window.innerHeight + 100) this.y = -100;
        if (this.y < -100) this.y = window.innerHeight + 100;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 1;
        
        switch(this.type) {
            case 0: // Circle
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
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
                ctx.fill();
                ctx.stroke();
                break;
                
            case 2: // Square
                ctx.beginPath();
                ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
                ctx.fill();
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    checkBounds(width, height) {
        if (this.x > width) this.x = width;
        if (this.x < 0) this.x = 0;
        if (this.y > height) this.y = height;
        if (this.y < 0) this.y = 0;
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bgCanvas = new BackgroundCanvas('bg-canvas');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BackgroundCanvas, Particle, Shape };
}
