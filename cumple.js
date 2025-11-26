const btn = document.getElementById("btn");
const card = document.querySelector('.card');

// ligero pulso de brillo (mantener)
setInterval(() => {
    if(btn) btn.style.filter = "brightness(1.15)";
    setTimeout(() => { if(btn) btn.style.filter = "brightness(1)" }, 300);
}, 1500);

// crear confetti dentro de la tarjeta al hacer click
function spawnConfetti(count = 40){
    if(!card) return;
    const colors = ['#ff4ea1','#ffd166','#7ee787','#8ac1ff','#ffb3e6','#ffd1a8'];
    const rect = card.getBoundingClientRect();
    for(let i=0;i<count;i++){
        const el = document.createElement('div');
        el.className = 'confetti';
        const w = 8 + Math.floor(Math.random()*10);
        const h = 10 + Math.floor(Math.random()*14);
        el.style.width = w + 'px';
        el.style.height = h + 'px';
        const left = Math.random() * (rect.width * 0.9) + (rect.width * 0.05);
        const top = Math.random() * (rect.height * 0.2) + (rect.height * 0.15);
        el.style.left = left + 'px';
        el.style.top = top + 'px';
        el.style.background = colors[Math.floor(Math.random()*colors.length)];
        // random horizontal drift
        const dx = (Math.random()-0.5) * 180;
        el.style.setProperty('--dx', Math.round(dx) + 'px');
        // random duration
        const dur = 1200 + Math.floor(Math.random()*1000);
        el.style.setProperty('--dur', dur + 'ms');
        card.appendChild(el);
        // remove after animation
        el.addEventListener('animationend', ()=> el.remove());
    }
}

if(btn){
    btn.addEventListener('click', ()=>{
        // pulse animation on click
        btn.animate([{ transform: 'translate(-50%, -50%) scale(1)' },{ transform: 'translate(-50%, -50%) scale(1.06)' },{ transform: 'translate(-50%, -50%) scale(1)' }], { duration: 280, easing: 'ease-out' });
        spawnConfetti(42);
        if(window.spawnFireworks) window.spawnFireworks(6);
        // small sparkles
        for(let s=0;s<6;s++){
            const sp = document.createElement('div');
            sp.className = 'sparkle';
            const left = 30 + Math.random()* (card.clientWidth-60);
            const top = card.clientHeight*0.4 + Math.random()*40 - 20;
            sp.style.left = left + 'px';
            sp.style.top = top + 'px';
            card.appendChild(sp);
            sp.addEventListener('animationend', ()=> sp.remove());
        }
    });
}

// ----------- PARTICLE BACKGROUND (bokeh/particles) -----------
(() => {
    const canvas = document.getElementById('bgCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let cw = 0, ch = 0, DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize(){
        cw = window.innerWidth; ch = window.innerHeight;
        canvas.width = Math.round(cw * DPR);
        canvas.height = Math.round(ch * DPR);
        canvas.style.width = cw + 'px';
        canvas.style.height = ch + 'px';
        ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    const particles = [];
    const N = Math.min(80, Math.round((window.innerWidth*window.innerHeight)/90000));

    function rand(min, max){ return Math.random()*(max-min)+min }

    function make(){
        for(let i=0;i<N;i++){
            const r = rand(8, 46) * (Math.random() < 0.12 ? 1.6 : 1);
            particles.push({
                x: Math.random()*cw,
                y: Math.random()*ch,
                r: r,
                vx: rand(-0.04, 0.04) * (r/16),
                vy: rand(-0.06, -0.2) * (r/36),
                hue: 330 + Math.random()*80, // pink -> orange -> bluish
                alpha: rand(0.06, 0.22) * (r/48 + 0.6),
                tw: rand(0.6,1.4)
            });
        }
    }

    function draw(){
        ctx.clearRect(0,0,cw,ch);
        for(const p of particles){
            p.x += p.vx * 60; p.y += p.vy * 60;
            // wrap
            if(p.y < -80) p.y = ch + 40;
            if(p.x < -80) p.x = cw + 40;
            if(p.x > cw + 80) p.x = -40;

            // fluctuate alpha
            const a = p.alpha * (0.7 + 0.3*Math.sin(perf()*p.tw));

            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
            g.addColorStop(0, `hsla(${p.hue}, 95%, 75%, ${a})`);
            g.addColorStop(0.35, `hsla(${p.hue}, 85%, 70%, ${a*0.7})`);
            g.addColorStop(1, `hsla(${p.hue}, 60%, 50%, 0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
        }
    }

    function perf(){ return performance.now()/1000 }

    let rafId = null;
    function loop(){ draw(); rafId = requestAnimationFrame(loop); }

    window.addEventListener('resize', ()=>{ resize(); particles.length=0; make(); });
    resize(); make(); loop();

    // Pause animation when page hidden to save CPU
    document.addEventListener('visibilitychange', ()=>{
        if(document.hidden){ if(rafId) cancelAnimationFrame(rafId); rafId = null; }
        else if(!rafId) loop();
    });
})();

// ----------- FIREWORKS CANVAS (overlay) -----------
(function(){
    const fxCanvas = document.createElement('canvas');
    fxCanvas.id = 'fxCanvas';
    document.body.appendChild(fxCanvas);
    const ctx = fxCanvas.getContext('2d');
    let W = 0, H = 0, DPR = Math.max(1, window.devicePixelRatio || 1);

    function resize(){
        W = window.innerWidth; H = window.innerHeight;
        fxCanvas.width = Math.round(W * DPR);
        fxCanvas.height = Math.round(H * DPR);
        fxCanvas.style.width = W + 'px';
        fxCanvas.style.height = H + 'px';
        ctx.setTransform(DPR,0,0,DPR,0,0);
    }

    const rockets = [];
    const parts = [];
    const gravity = 0.18;

    function rand(min,max){ return Math.random()*(max-min)+min }

    function launchRocket(x){
        // x in px; spawn from bottom
        rockets.push({ x: x, y: H + 20, vx: rand(-1.2,1.2), vy: rand(-9.6,-12.6), color: `hsl(${rand(0,360)},90%,60%)`, life:0 });
    }

    function explode(rx){
        const cx = rx.x; const cy = rx.y;
        const hue = Math.floor(Math.random()*360);
        const count = 20 + Math.floor(Math.random()*40);
        for(let i=0;i<count;i++){
            const speed = rand(1.8,6.4) * (0.8 + Math.random()*0.8);
            const ang = rand(0,Math.PI*2);
            parts.push({ x:cx, y:cy, vx: Math.cos(ang)*speed, vy: Math.sin(ang)*speed, life: 60 + Math.random()*60, decay: 0.015+Math.random()*0.03, hue: hue + rand(-20,20), alpha: 1, size: 1+Math.random()*2 });
        }
    }

    let raf = null;
    function step(){
        ctx.clearRect(0,0,W,H);
        // rockets
        for(let i=rockets.length-1;i>=0;i--){
            const r = rockets[i];
            r.vy += gravity*0.6;
            r.x += r.vx; r.y += r.vy; r.life++;
            // draw rocket as small spark
            ctx.beginPath(); ctx.fillStyle = r.color; ctx.arc(r.x, r.y, 2.2, 0, Math.PI*2); ctx.fill();
            if(r.vy >= -2 || r.life > 90){
                explode(r); rockets.splice(i,1);
            }
        }

        // particles
        ctx.globalCompositeOperation = 'lighter';
        for(let i=parts.length-1;i>=0;i--){
            const p = parts[i];
            p.vy += gravity*0.28;
            p.vx *= 0.998; p.vy *= 0.998;
            p.x += p.vx; p.y += p.vy; p.life--;
            p.alpha -= p.decay;
            if(p.alpha <= 0 || p.life <= 0){ parts.splice(i,1); continue; }
            const g = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*6);
            g.addColorStop(0, `hsla(${p.hue},90%,60%,${Math.min(1,p.alpha)})`);
            g.addColorStop(0.6, `hsla(${p.hue},80%,55%,${Math.min(0.5,p.alpha*0.6)})`);
            g.addColorStop(1, `hsla(${p.hue},60%,45%,0)`);
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(p.x,p.y,p.size*3,0,Math.PI*2); ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        raf = requestAnimationFrame(step);
    }

    function spawnFireworks(count=6){
        const cx = W/2;
        for(let i=0;i<count;i++){
            setTimeout(()=> launchRocket(cx + rand(-160,160)), i*120);
        }
        // stop after a bit if too many
        setTimeout(()=>{
            // let particles die naturally
        }, 2200);
    }

    window.addEventListener('resize', resize);
    resize(); step();

    // expose a global trigger
    window.spawnFireworks = spawnFireworks;
    // optional small burst at load
    setTimeout(()=> spawnFireworks(3), 800);
})();
