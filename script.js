const bloom = document.getElementById("bloom");
const wrapper = document.getElementById("wrapper");

function rand(min, max){ return Math.random() * (max - min) + min; }
function rint(min, max){ return Math.floor(rand(min, max + 1)); }

const palettes = [
  ['#ff7e9c','#ffb1c6','#ff5078'],
  ['#ffd28a','#ffe2b3','#ffad42'],
  ['#d9b3ff','#f3e4ff','#a77aff'],
  ['#9ff0d0','#7be6c2','#2cc49a']
];

function clearBlooms(){ bloom.innerHTML = ""; }

function createFlower(xPercent, yPercent){
    const f = document.createElement("div");
    f.className = "flower";
    const size = rand(90, 130);

    f.style.left = xPercent + "%";
    f.style.bottom = yPercent + "%";
    f.style.width = size + "px";
    f.style.height = size + "px";

    const petalCount = 7;
    const palette = palettes[rint(0, palettes.length-1)];

    for(let i=0; i<petalCount; i++){
        const p = document.createElement("div");
        p.className = "petal";

        p.style.width = size * 0.9 + "px";
        p.style.height = size * 1.2 + "px";

        const angle = (360/petalCount) * i;
        p.style.transform =
            `translate(-50%,-50%) rotate(${angle}deg) translateY(-38%)`;

        p.style.background =
            `radial-gradient(circle at 40% 30%, ${palette[1]}, ${palette[0]})`;

        f.appendChild(p);
    }

    const c = document.createElement("div");
    c.className = "center";
    f.appendChild(c);

    const stem = document.createElement("div");
    stem.className="stem";
    stem.style.height = size * 0.9 + "px";
    f.appendChild(stem);

    return f;
}

function generateBouquet(){
    clearBlooms();
    const positions = [
        [50,70],[40,63],[60,63],
        [33,52],[50,50],[67,52],
        [42,40],[57,40]
    ];

    positions.forEach(pos=>{
        bloom.appendChild(createFlower(pos[0], pos[1]));
    });
}

generateBouquet();

document.getElementById("regen").onclick = generateBouquet;
