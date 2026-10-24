import { useEffect, useRef } from "react";

const COLORS = ["#e600ff", "#8b00ff", "#164bff", "#00cfff", "#00d6a0", "#ff6b00", "#ffe600"];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smoothstep = (start, end, value) => {
  const amount = clamp((value - start) / (end - start));
  return amount * amount * (3 - 2 * amount);
};

function seededParticles(count) {
  let seed = 3719;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  return Array.from({ length: count }, (_, index) => ({
    x: random(),
    y: random(),
    radius: 0.45 + random() * 1.7,
    speed: 6 + random() * 21,
    depth: 0.3 + random() * 1.6,
    phase: random() * Math.PI * 2,
    color: COLORS[index % COLORS.length],
  }));
}

function drawPortal(ctx, x, y, radius, progress, time, opacity) {
  const turn = progress * Math.PI * 2.4 + time * 0.035;
  const rings = [1, 1.19, 1.4];

  rings.forEach((multiplier, index) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(turn * (index % 2 ? -0.7 : 0.5) + index * 0.7);
    ctx.scale(1, 0.76 + index * 0.045);
    ctx.beginPath();
    ctx.ellipse(0, 0, radius * multiplier, radius * multiplier, 0, 0, Math.PI * 2);

    const color = ctx.createLinearGradient(-radius, -radius, radius, radius);
    color.addColorStop(0, COLORS[(index + 1) % COLORS.length]);
    color.addColorStop(0.48, COLORS[(index + 3) % COLORS.length]);
    color.addColorStop(1, COLORS[(index + 4) % COLORS.length]);
    ctx.globalAlpha = opacity * (index === 0 ? 0.66 : 0.25);
    ctx.strokeStyle = color;
    ctx.lineWidth = index === 0 ? 2.2 : 1.1;
    ctx.shadowColor = COLORS[(index + 3) % COLORS.length];
    ctx.shadowBlur = index === 0 ? 23 : 12;
    ctx.stroke();
    ctx.restore();
  });
}

function drawMatrix(ctx, width, height, progress, opacity) {
  if (opacity < 0.01) return;

  const horizonX = width * (width < 700 ? 0.53 : 0.67);
  const horizonY = height * 0.48;
  const bottomY = height * 1.1;
  const radius = width * (width < 700 ? 0.78 : 0.63);
  const lineGradient = ctx.createLinearGradient(0, horizonY, 0, bottomY);
  lineGradient.addColorStop(0, "rgba(0, 207, 255, 0)");
  lineGradient.addColorStop(0.4, "rgba(0, 207, 255, 0.72)");
  lineGradient.addColorStop(1, "rgba(139, 0, 255, 0)");

  ctx.save();
  ctx.globalAlpha = opacity * 0.42;
  ctx.strokeStyle = lineGradient;
  ctx.lineWidth = 0.7;
  for (let index = 0; index <= 22; index += 1) {
    const angle = (index / 22) * Math.PI * 2;
    const x = horizonX + Math.cos(angle) * radius;
    const y = horizonY + Math.sin(angle) * radius * 0.75;
    ctx.beginPath();
    ctx.moveTo(horizonX + Math.cos(angle) * 4, horizonY + Math.sin(angle) * 4);
    ctx.lineTo(x, y + height * 0.26);
    ctx.stroke();
  }

  for (let index = 1; index <= 8; index += 1) {
    const ratio = index / 8;
    const row = ratio * ratio;
    const y = horizonY + row * (bottomY - horizonY);
    const halfWidth = radius * (0.15 + row * 1.08);
    ctx.globalAlpha = opacity * (0.12 + (1 - ratio) * 0.18);
    ctx.beginPath();
    ctx.ellipse(horizonX, y, halfWidth, Math.max(5, row * height * 0.045), 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalAlpha = opacity * 0.5;
  ctx.strokeStyle = "rgba(230, 0, 255, .42)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.ellipse(horizonX, horizonY, radius * (0.27 + progress * 0.08), radius * 0.2, progress * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMeteor(ctx, width, height, centerX, centerY, progress, time) {
  const arrival = smoothstep(0.04, 0.4, progress);
  const opacity = 1 - smoothstep(0.34, 0.49, progress);
  if (opacity < 0.01) return;

  const startX = width * (width < 700 ? 0.96 : 1.02);
  const startY = height * 0.07;
  const x = startX + (centerX - startX) * arrival;
  const y = startY + (centerY - startY) * arrival;
  const radius = Math.min(width < 700 ? 21 : 32, height * 0.045);
  const angle = progress * 5.3 + time * 0.21;

  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.globalAlpha = opacity;

  const tail = ctx.createLinearGradient(x + radius * 0.45, y - radius * 0.3, x + radius * 7, y - radius * 3.1);
  tail.addColorStop(0, "rgba(0, 207, 255, .48)");
  tail.addColorStop(0.45, "rgba(22, 75, 255, .16)");
  tail.addColorStop(1, "rgba(230, 0, 255, 0)");
  ctx.strokeStyle = tail;
  ctx.lineWidth = radius * 0.82;
  ctx.lineCap = "round";
  ctx.shadowColor = "#164bff";
  ctx.shadowBlur = 28;
  ctx.beginPath();
  ctx.moveTo(x + radius * 0.45, y - radius * 0.35);
  ctx.lineTo(x + radius * 7, y - radius * 3.1);
  ctx.stroke();

  ctx.translate(x, y);
  ctx.rotate(angle);
  const rock = ctx.createRadialGradient(-radius * 0.36, -radius * 0.44, radius * 0.08, 0, 0, radius * 1.15);
  rock.addColorStop(0, "#b7eaf7");
  rock.addColorStop(0.18, "#567486");
  rock.addColorStop(0.55, "#29384a");
  rock.addColorStop(1, "#111725");
  ctx.fillStyle = rock;
  ctx.strokeStyle = "rgba(0, 207, 255, .8)";
  ctx.lineWidth = 1.35;
  ctx.shadowColor = "#00cfff";
  ctx.shadowBlur = 18;
  ctx.beginPath();
  const points = 11;
  for (let index = 0; index < points; index += 1) {
    const pointAngle = (index / points) * Math.PI * 2;
    const jagged = 0.72 + ((index * 7) % 5) * 0.065;
    const px = Math.cos(pointAngle) * radius * jagged;
    const py = Math.sin(pointAngle) * radius * jagged;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = opacity * 0.45;
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#101925";
  ctx.beginPath();
  ctx.ellipse(-radius * 0.15, -radius * 0.08, radius * 0.24, radius * 0.15, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export default function ScrollExperience() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const particles = seededParticles(window.innerWidth < 700 ? 74 : 132);
    const logo = new Image();
    logo.src = "/qelvairo-mark.png";

    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let scrollTarget = 0;
    let progress = 0;
    let frame = 0;
    let startedAt = performance.now();
    let paused = document.hidden;

    const updateScrollTarget = () => {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = clamp(window.scrollY / available);
      if (reducedMotion.matches) progress = scrollTarget;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      updateScrollTarget();
    };

    const draw = (now) => {
      frame = 0;
      if (paused) return;

      const motionOff = reducedMotion.matches;
      progress = motionOff ? scrollTarget : progress + (scrollTarget - progress) * 0.105;
      if (Math.abs(scrollTarget - progress) < 0.0005) progress = scrollTarget;
      const time = motionOff ? 0 : (now - startedAt) / 1000;
      const ctx = context;

      ctx.clearRect(0, 0, width, height);

      const atmosphere = ctx.createRadialGradient(width * 0.68, height * 0.48, 0, width * 0.68, height * 0.48, Math.max(width, height) * 0.82);
      atmosphere.addColorStop(0, "rgba(7, 39, 76, .25)");
      atmosphere.addColorStop(0.42, "rgba(8, 13, 32, .09)");
      atmosphere.addColorStop(1, "rgba(3, 4, 10, 0)");
      ctx.fillStyle = atmosphere;
      ctx.fillRect(0, 0, width, height);

      const matrixAmount = smoothstep(0.13, 0.42, progress) * (1 - smoothstep(0.58, 0.88, progress));
      drawMatrix(ctx, width, height, progress, matrixAmount);

      const travel = progress * height * 2.15;
      const gathering = smoothstep(0.015, 0.16, progress) * (1 - smoothstep(0.24, 0.38, progress));
      const drift = smoothstep(0.18, 0.62, progress) - smoothstep(0.73, 0.94, progress);
      const centerX = width * (width < 700 ? 0.55 : 0.72 - drift * 0.13 + smoothstep(0.72, 0.96, progress) * 0.035);
      const centerY = height * (0.49 + Math.sin(progress * Math.PI * 2 + time * 0.12) * 0.035);
      const markSize = Math.min(width * (width < 700 ? 0.39 : 0.28), height * 0.43);

      drawMeteor(ctx, width, height, centerX, centerY, progress, time);

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const particle of particles) {
        let x = particle.x * width + Math.sin(time * 0.22 + particle.phase) * (12 + particle.depth * 9);
        let y = (particle.y * height + travel * particle.depth + time * particle.speed) % (height + 30);
        if (y < 0) y += height + 30;

        const orbitAngle = particle.phase + progress * Math.PI * 3 + time * 0.08;
        const targetX = centerX + Math.cos(orbitAngle) * markSize * (0.51 + particle.depth * 0.15);
        const targetY = centerY + Math.sin(orbitAngle) * markSize * (0.45 + particle.depth * 0.13);
        x += (targetX - x) * gathering;
        y += (targetY - y) * gathering;

        const shimmer = 0.22 + (Math.sin(time * 1.8 + particle.phase) + 1) * 0.18;
        ctx.globalAlpha = shimmer * (0.52 + matrixAmount * 0.3);
        ctx.fillStyle = particle.color;
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 8 + particle.radius * 4;
        ctx.beginPath();
        ctx.arc(x, y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        if (matrixAmount > 0.08 && particle.depth > 1.25) {
          ctx.globalAlpha = matrixAmount * 0.22;
          ctx.fillRect(x, y - 12 - particle.depth * 10, Math.max(0.6, particle.radius * 0.55), 12 + particle.depth * 10);
        }
      }

      const portalRadius = markSize * (0.59 + matrixAmount * 0.1 + Math.sin(time * 0.32 + progress * 5) * 0.025);
      drawPortal(ctx, centerX, centerY, portalRadius, progress, time, 0.44 + matrixAmount * 0.42);

      if (logo.complete && logo.naturalWidth) {
        const turn = progress * Math.PI * 2 + time * 0.055;
        const perspective = 0.16 + Math.pow(Math.abs(Math.cos(turn)), 0.72) * 0.84;
        const visibility = 0.5 + smoothstep(0.04, 0.2, progress) * 0.42;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(Math.sin(progress * Math.PI * 2 + time * 0.06) * 0.035);
        ctx.scale(perspective, 1);
        ctx.globalAlpha = visibility;
        ctx.shadowColor = progress < 0.55 ? "#00cfff" : "#e600ff";
        ctx.shadowBlur = 34 + matrixAmount * 18;
        ctx.drawImage(logo, -markSize / 2, -markSize / 2, markSize, markSize);
        ctx.restore();
      }
      ctx.restore();

      const shouldAnimate = !motionOff || Math.abs(scrollTarget - progress) > 0.0005;
      if (shouldAnimate) frame = requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      updateScrollTarget();
      if (!frame && !paused) frame = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      paused = document.hidden;
      if (!paused && !frame) frame = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resize();
      requestDraw();
    };

    resize();
    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("scroll", requestDraw, { passive: true });
    document.addEventListener("visibilitychange", handleVisibility);
    logo.addEventListener("load", requestDraw);
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", requestDraw);
      document.removeEventListener("visibilitychange", handleVisibility);
      logo.removeEventListener("load", requestDraw);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas className="scroll-experience" ref={canvasRef} aria-hidden="true" />;
}
