const botaoIniciar = document.getElementById("iniciar");
const botaoReiniciar = document.getElementById("reiniciar");
const perdeu = document.getElementById("perdeu");
const cenario = document.getElementById("cenario");
const nave = document.getElementById("nave");
const vida = document.getElementById("vida");
const pontos = document.getElementById("pontos");
const audioJogo = new Audio("/audios/missaoespaco.mp3");

const larguraCenario = cenario.offsetWidth;
const alturaCenario = cenario.offsetHeight;

const larguraNave = nave.offsetWidth;
const alturaNave = nave.offsetHeight;

const velocidadeNave = 15;
const velocidadeTiro = 20;
const velocidadeNaveInimigas = 6;

let estaAtirando = false;

let tiroAtual = 0;

let vidaAtual = 100;
let pontosAtual = 0;

let checaMoveNaveInimigas;
let checaNaveInimigas;
let checaMoveTiros;
let checaMoveNave;
let checaColisao;
let checaTiros;

let posicaoHorizontal = larguraCenario / 2 - 50;
let posicaoVertical = alturaCenario - alturaNave;
let direcaoHorizontal = 0;
let direcaoVertical = 0;

botaoReiniciar.style.display = "none";
perdeu.style.display = "none";

const teclaPressionada = (tecla) => {
  if (tecla.key === "ArrowRight") {
    direcaoHorizontal = 1;
  } else if (tecla.key === "ArrowLeft") {
    direcaoHorizontal = -1;
  } 
}

const teclaSolta = (tecla) => {
  if (tecla.key === "ArrowRight" || tecla.key === "ArrowLeft") {
    direcaoHorizontal = 0;
  } else if (tecla.key === "ArrowDown" || tecla.key === "ArrowUp") {
    direcaoVertical = 0;
  }
}

const moveNave = () => {
  posicaoHorizontal += direcaoHorizontal * velocidadeNave;
  posicaoVertical += direcaoVertical * velocidadeNave;
  if (posicaoHorizontal < 0) {
    posicaoHorizontal = 0;
  } else if (posicaoHorizontal + larguraNave > larguraCenario) {
    posicaoHorizontal = larguraCenario - larguraNave;
  }
  
  nave.style.left = posicaoHorizontal + "px";

}

const atirar = () => {
  const delayTiro = Date.now();
  const atrasoTiro = delayTiro - tiroAtual;

  if (estaAtirando && atrasoTiro >= 100) {
    tiroAtual = Date.now();
    criaTiros(posicaoHorizontal + 45, posicaoVertical - 10);
  }
}

document.addEventListener("keydown", (tecla) => {
  if (tecla.key === " ") {
    estaAtirando = true;
  }
});

document.addEventListener("keyup", (tecla) => {
  if (tecla.key === " ") {
    estaAtirando = false;
  }
})

const criaTiros = (posicaoLeftTiro, posicaoTopTiro) => {
  const tiro = document.createElement("div");
  tiro.className = "tiro";
  tiro.style.position = "absolute";
  tiro.style.width = "8px";
  tiro.style.height = "12px";
  tiro.style.backgroundColor = "black";
  tiro.style.left = posicaoLeftTiro + "px";
  tiro.style.top = posicaoTopTiro + "px";
  cenario.appendChild(tiro);
  audioTiros();
}

const audioTiros = () => {
  const audioDoTiro = document.createElement("audio");
  audioDoTiro.className = "audiotiro";
  audioDoTiro.setAttribute("src", "/audios/tiro.mp3");
  audioDoTiro.play();
  cenario.appendChild(audioDoTiro);
  audioDoTiro.addEventListener("ended", () => {
    audioDoTiro.remove();
  })
}

const moveTiros = () => {
  const tiros = document.querySelectorAll(".tiro");
  for (let i = 0; i < tiros.length; i++) {
    if (tiros[i]) {
      let posicaoTopTiro = tiros[i].offsetTop;
      posicaoTopTiro -= velocidadeTiro;
      tiros[i].style.top = posicaoTopTiro + "px";
      if (posicaoTopTiro < -10) {
        tiros[i].remove();
      } 
    }
  }
}

const naveInimigas = () => {
  const inimigo = document.createElement("div");
  inimigo.className = "inimigo";
  inimigo.style.position = "absolute";
  inimigo.setAttribute("data-vida", 5);
  inimigo.style.width = "100px";
  inimigo.style.height = "100px";
  inimigo.style.backgroundImage = "url(/imagens/ufo.png)";
  inimigo.style.backgroundPosition = "center";
  inimigo.style.backgroundRepeat = "no-repeat";
  inimigo.style.backgroundSize = "contain";
  inimigo.style.left = Math.floor(Math.random() * (larguraCenario - larguraNave)) + "px";
  inimigo.style.top = "-100px";
  cenario.appendChild(inimigo);
}

const moveNaveInimigas = () => {
  const naveInimigas = document.querySelectorAll(".inimigo");
  for (let i = 0; i < naveInimigas.length; i++) {
    if (naveInimigas[i]) {
      let posicaoTopNaveInimiga = naveInimigas[i].offsetTop;
      let posicaoLeftNaveInimiga = naveInimigas[i].offsetLeft;
      posicaoTopNaveInimiga += velocidadeNaveInimigas;
      naveInimigas[i].style.top = posicaoTopNaveInimiga + "px";
      if (posicaoTopNaveInimiga > alturaCenario) {
        vidaAtual -= 5;
        vida.textContent = `Cidade: ${vidaAtual}%`;
        explosaoNaveInimigaDestruida(posicaoLeftNaveInimiga);
        if (vidaAtual <= 0) {
          gameOver();
        }
        naveInimigas[i].remove();
      } 
    }
  }
}

const colisao = () => {
  const todasNavesInimigas = document.querySelectorAll(".inimigo");
  const todosTiros = document.querySelectorAll(".tiro");
  todasNavesInimigas.forEach((naveInimiga) => {
    todosTiros.forEach((tiro) => {
      const colisaoNaveInimiga = naveInimiga.getBoundingClientRect();
      const colisaoTiro = tiro.getBoundingClientRect();
      const posicaoNaveInimigaLeft = naveInimiga.offsetLeft;
      const posicaoNaveInimigaTop = naveInimiga.offsetTop;
      let vidaAtualNaveInimiga = parseInt(naveInimiga.getAttribute("data-vida"));
      if (
        colisaoNaveInimiga.left < colisaoTiro.right &&
        colisaoNaveInimiga.right > colisaoTiro.left &&
        colisaoNaveInimiga.top < colisaoTiro.bottom &&
        colisaoNaveInimiga.bottom > colisaoTiro.top
      ) {
        vidaAtualNaveInimiga--;
        tiro.remove();
        if (vidaAtualNaveInimiga === 0) {
          pontosAtual += 1;
          pontos.textContent = `Naves abatidas: ${pontosAtual}`;
          naveInimiga.remove();
          naveInimigaDestruida(posicaoNaveInimigaLeft, posicaoNaveInimigaTop);
        } else {
          naveInimiga.setAttribute("data-vida", vidaAtualNaveInimiga);
        }
      }
    })
  })
}

const naveInimigaDestruida = (posicaoLeftNaveInimiga, posicaoTopNaveInimiga) => {
  const naveInimigaDestruida = document.createElement("div");
  naveInimigaDestruida.className = "naveinimigadestruida";
  naveInimigaDestruida.style.position = "absolute";
  naveInimigaDestruida.style.width = "100px";
  naveInimigaDestruida.style.height = "100px";
  naveInimigaDestruida.style.backgroundImage = "url(/imagens/eliminado.gif)";
  naveInimigaDestruida.style.backgroundPosition = "center";
  naveInimigaDestruida.style.backgroundRepeat = "no-repeat";
  naveInimigaDestruida.style.backgroundSize = "contain";
  naveInimigaDestruida.style.left = posicaoLeftNaveInimiga + "px";
  naveInimigaDestruida.style.top = posicaoTopNaveInimiga + "px";
  cenario.appendChild(naveInimigaDestruida);
  audioExplosoes();
  setTimeout(() => {cenario.removeChild(naveInimigaDestruida);}, 1000);
}

const explosaoNaveInimigaDestruida = (posicaoLeftNaveInimiga) => {
  const explosaoNaveInimiga = document.createElement("div");
  explosaoNaveInimiga.className = "explosaonaveinimiga";
  explosaoNaveInimiga.style.position = "absolute";
  explosaoNaveInimiga.style.width = "100px";
  explosaoNaveInimiga.style.height = "100px";
  explosaoNaveInimiga.style.backgroundImage = "url(/imagens/explosao.gif)";
  explosaoNaveInimiga.style.backgroundPosition = "center";
  explosaoNaveInimiga.style.backgroundRepeat = "no-repeat";
  explosaoNaveInimiga.style.backgroundSize = "contain";
  explosaoNaveInimiga.style.left = posicaoLeftNaveInimiga + "px";
  explosaoNaveInimiga.style.top = (alturaCenario - 100) + "px";
  cenario.appendChild(explosaoNaveInimiga);
  audioExplosoes();
  setTimeout(() => {cenario.removeChild(explosaoNaveInimiga);}, 1000);
}

const audioExplosoes = () => {
  const audioExplosaoNaveInimiga = document.createElement("audio");
  audioExplosaoNaveInimiga.className = "audioexplosoes";
  audioExplosaoNaveInimiga.setAttribute("src", "/audios/destruido.mp3");
  audioExplosaoNaveInimiga.play();
  cenario.appendChild(audioExplosaoNaveInimiga);
  audioExplosaoNaveInimiga.addEventListener("ended", () => {
    audioExplosaoNaveInimiga.remove();
  })
}

const gameOver = () => {
  document.removeEventListener("keydown", teclaPressionada);
  document.removeEventListener("keyup", teclaSolta);
  clearInterval(checaMoveNaveInimigas);
  clearInterval(checaNaveInimigas);
  clearInterval(checaMoveTiros);
  clearInterval(checaMoveNave);
  clearInterval(checaColisao);
  perdeu.style.display = "block";
  botaoReiniciar.style.display = "block";
  cenario.appendChild(perdeu);
  cenario.removeChild(nave);
  const navesInimigas = document.querySelectorAll(".inimigo");
  navesInimigas.forEach((inimigos) => {
    inimigos.remove();
  });
  const todosTiros = document.querySelectorAll(".tiro");
  todosTiros.forEach((tiro) => {
    cenario.removeChild(tiro);
  });
}

const iniciarJogo = () => {
  document.addEventListener("keydown", teclaPressionada);
  document.addEventListener("keyup", teclaSolta);
  checaMoveNave = setInterval(moveNave, 20);
  checaMoveTiros = setInterval(moveTiros, 40);
  checaMoveNaveInimigas = setInterval(moveNaveInimigas, 50);
  checaColisao = setInterval(colisao, 10);
  checaNaveInimigas = setInterval(naveInimigas, 1000);
  checaTiros = setInterval(atirar, 10);
  botaoIniciar.style.display = "none";
  
  audioJogo.loop = true;
  audioJogo.play();
}

const reiniciarJogo = () => {
  document.addEventListener("keydown", teclaPressionada);
  document.addEventListener("keyup", teclaSolta);
  botaoReiniciar.style.display = "none";
  perdeu.style.display = "none";
  cenario.appendChild(nave);
  tiroAtual = 0;
  vidaAtual = 100;
  pontosAtual = 0;
  vida.textContent = `Cidade: ${vidaAtual}%`;
  pontos.textContent = `Naves abatidas: ${pontosAtual}`;
  posicaoHorizontal = larguraCenario / 2 - 50;
  posicaoVertical = alturaCenario - alturaNave;
  checaMoveNave = setInterval(moveNave, 20);
  checaMoveTiros = setInterval(moveTiros, 40);
  checaMoveNaveInimigas = setInterval(moveNaveInimigas, 50);
  checaColisao = setInterval(colisao, 10);
  checaNaveInimigas = setInterval(naveInimigas, 1000);
  checaTiros = setInterval(atirar, 10);
  botaoIniciar.style.display = "none";
  const todosTiros = document.querySelectorAll(".tiro");
  todosTiros.forEach((tiro) => {
    cenario.removeChild(tiro);
  });
  
  audioJogo.loop = true;
  audioJogo.play();
}
