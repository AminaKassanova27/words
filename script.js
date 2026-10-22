const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const input = document.getElementById("wordInput");
const button = document.getElementById("createBtn");
const textCanvas = document.createElement("canvas");
const textCtx = textCanvas.getContext("2d");
let width;
let height;
let particles = [];
let pulseTime = 0;
let isText = false;
let ambienParticles = [];
const PARTICLE_COUNT = 5000;
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    textCanvas.width = width;
    textCanvas.height = height;
}
resize();
window.addEventListener("resize", resize);
function createCircle() {
    const points = [];
    const radius = Math.min(width, height) * 0.23;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = radius * Math.sqrt(Math.random());
        points.push({
            x: width / 2 + Math.cos(angle) * r,
            y: height / 2 + Math.sin(angle) * r
        });
    }
    return points;
}
function createTextPoints(text) {
    textCanvas.width = width;
    textCanvas.height = height;
    textCtx.clearRect(0, 0, width, height);
    let fontSize = Math.min(width / (text.length * 0.65), 150);
    fontSize = Math.max(fontSize, 20);
    textCtx.font = `bold ${fontSize}px Arial`;
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillStyle = "white";
    textCtx.fillText(text, width / 2, height / 2);
    const image = textCtx.getImageData(
        0, 0, width, height
    );
    const points = [];
    const step = 3;
    for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;
            if (image.data[index + 3] > 128) {
                points.push({ x, y });
            }
        }
    }
    points.sort(() => Math.random() - 0.5);
    const result = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        result.push(
            points[i % points.length] || {
                x: width / 2,
                y: height / 2
            }
        );
    }
    return result;
}
function init() {
    const circle = createCircle();
    particles = circle.map(point => ({
        x: point.x,
        y: point.y,
        targetX: point.x,
        targetY: point.y,
        size: Math.random() * 0.35 + 0.15,
        alpha: Math.random() * 0.4 + 0.6
    }));
    ambienParticles = [];
    for(let i = 0; i < 1000; i++) {
        ambienParticles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 0.3 + 0.1,
            alpha: Math.random() * 0.5 + 0.1,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6
        });
    }
}
function morphTo(points) {
    isText = true;
    particles.forEach((particle, i) => {
        const point = points[i];
        particle.targetX = point.x;
        particle.targetY = point.y;
    });
}
function animate() {
    ctx.clearRect(0, 0, width, height);
    ambienParticles.forEach( p => {
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0) p.x = width;
        if(p.x > width) p.x = 0;
        if(p.y < 0) p.y = height;
        if(p.y > height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 150, 200, ${p.alpha})`;
        ctx.fill();
    });
    pulseTime += 0.025;
    const pulse = isText
    ? 1 + Math.sin(pulseTime) * 0.12
    : 1;
    particles.forEach(particle => {
        particle.x += (particle.targetX - particle.x) * 0.045;
        particle.y += (particle.targetY - particle.y) * 0.045;
        ctx.beginPath();
        ctx.arc(
            width / 2 + (particle.x - width / 2) * pulse,
            height / 2 + (particle.y - height / 2) * pulse,
            particle.size,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = `rgba(255, 80, 170, ${particle.alpha})`;
        ctx.fill();
    });
    requestAnimationFrame(animate);
}
button.addEventListener("click", () => {
    const word = input.value.trim();
    if (!word) return;
    const textPoints = createTextPoints(word);
    morphTo(textPoints);
});
input.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        button.click();
    }
});
init();
animate();