import React, { useEffect, useRef } from 'react';

// Lightweight canvas confetti — no external deps
export default function Celebration({ duration = 3500 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    const el = ref.current;
    if (!el) return;
    el.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width = el.clientWidth * dpr;
      canvas.height = el.clientHeight * dpr;
      canvas.style.width = `${el.clientWidth}px`;
      canvas.style.height = `${el.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    window.addEventListener('resize', resize);

    const pieces = [];
    const colors = ['#06b6d4', '#8b5cf6', '#3b82f6', '#f97316', '#ef4444', '#10b981'];
    const num = 80;
    for (let i = 0; i < num; i++) {
      pieces.push({
        x: el.clientWidth / 2,
        y: el.clientHeight / 3,
        r: Math.random() * 6 + 4,
        dx: (Math.random() - 0.5) * 8,
        dy: (Math.random() - 2) * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI,
        drot: (Math.random() - 0.5) * 0.2,
      });
    }

    let start = performance.now();
    function frame(t) {
      const elapsed = t - start;
      ctx.clearRect(0, 0, el.clientWidth, el.clientHeight);
      pieces.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.dy += 0.25; // gravity
        p.rot += p.drot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        ctx.restore();
      });

      if (elapsed < duration) requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, el.clientWidth, el.clientHeight);
    }

    requestAnimationFrame(frame);

    // short celebratory 'blast' sound: layered noise + low boom + high click
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ac = new AudioCtx();
      const now = ac.currentTime;

      // create a short white-noise burst
      const bufferSize = ac.sampleRate * 1.0; // 1s buffer
      const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ac.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ac.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = 1200;
      noiseFilter.Q.value = 0.8;

      const noiseGain = ac.createGain();
      noiseGain.gain.setValueAtTime(0.0001, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.5, now + 0.01);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ac.destination);

      // low 'boom' oscillator
      const boom = ac.createOscillator();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(100, now);
      const boomGain = ac.createGain();
      boomGain.gain.setValueAtTime(0.0001, now);
      boomGain.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
      boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      boom.connect(boomGain);
      boomGain.connect(ac.destination);

      // sharp high click for attack
      const click = ac.createOscillator();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1600, now);
      const clickGain = ac.createGain();
      clickGain.gain.setValueAtTime(0.0001, now);
      clickGain.gain.exponentialRampToValueAtTime(0.6, now + 0.002);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      click.connect(clickGain);
      clickGain.connect(ac.destination);

      // start/stop
      noise.start(now);
      boom.start(now);
      click.start(now);

      noise.stop(now + 0.7);
      click.stop(now + 0.1);
      boom.stop(now + 0.9);
    } catch (e) {
      // ignore if audio blocked or unavailable
    }

    return () => {
      window.removeEventListener('resize', resize);
      try { el.removeChild(canvas); } catch {}
    };
  }, [duration]);

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 z-50" />
  );
}
