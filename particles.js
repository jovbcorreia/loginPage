const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

let W, H, dots = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function randomDot() {
  return {
    x:  Math.random() * W,
    y:  Math.random() * H,
    r:  Math.random() * 1.5 + .3,
    vx: (Math.random() - .5) * .3,
    vy: (Math.random() - .5) * .3,
    a:  Math.random()
  };
}

function init() {
  resize();
  dots = Array.from({ length: 120 }, randomDot);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  dots.forEach(d => {
    d.x += d.vx;
    d.y += d.vy;
    d.a += .005;
    if (d.x < 0 || d.x > W) d.vx *= -1;
    if (d.y < 0 || d.y > H) d.vy *= -1;

    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(64,145,108,${.2 + .1 * Math.sin(d.a)})`;
    ctx.fill();
  });

  // Lines between nearby dots
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx   = dots[i].x - dots[j].x;
      const dy   = dots[i].y - dots[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(64,145,108,${.08 * (1 - dist / 120)})`;
        ctx.lineWidth = .5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
init();
draw();
