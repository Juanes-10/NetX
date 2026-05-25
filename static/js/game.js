const puntaje = { X: 0, O: 0 };

const celdas = document.querySelectorAll(".celda");
const turnoActualEl = document.getElementById("turno-actual");
const mensajeResultadoEl = document.getElementById("mensaje-resultado");
const btnReiniciar = document.getElementById("btn-reiniciar");
const jugadorXEl = document.getElementById("jugador-x");
const jugadorOEl = document.getElementById("jugador-o");
const puntosXEl = document.getElementById("puntos-x");
const puntosOEl = document.getElementById("puntos-o");

function renderizarTablero(estado, comboGanador = null) {
    celdas.forEach((celda, indice) => {
        const valor = estado.tablero[indice];
        celda.textContent = valor;
        celda.className = "celda";

        if (valor) {
            celda.classList.add("ocupada", valor.toLowerCase());
        }

        if (comboGanador && comboGanador.includes(indice)) {
            celda.classList.add("ganadora");
        }
    });

    turnoActualEl.textContent = estado.turno;
    turnoActualEl.style.color = estado.turno === "X"
        ? "var(--color-x)"
        : "var(--color-o)";

    jugadorXEl.classList.toggle("activo", estado.turno === "X" && !estado.juego_terminado);
    jugadorOEl.classList.toggle("activo", estado.turno === "O" && !estado.juego_terminado);

    if (estado.juego_terminado) {
        if (estado.ganador === "Empate") {
            mensajeResultadoEl.textContent = "— Empate —";
            mensajeResultadoEl.style.color = "var(--color-texto)";
        } else {
            mensajeResultadoEl.textContent = `Ganó el Jugador ${estado.ganador}!`;
            mensajeResultadoEl.style.color = "var(--color-exito)";
            puntaje[estado.ganador]++;
            puntosXEl.textContent = puntaje.X;
            puntosOEl.textContent = puntaje.O;
        }
        celdas.forEach(c => c.classList.add("ocupada"));
    } else {
        mensajeResultadoEl.textContent = "";
    }
}

async function hacerMovimiento(posicion) {
    try {
        const respuesta = await fetch("/mover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ posicion: posicion })
        });

        if (!respuesta.ok) return;

        const estado = await respuesta.json();
        renderizarTablero(estado, estado.combo_ganador || null);

    } catch (error) {
        console.error("Error al comunicarse con el servidor:", error);
    }
}

async function reiniciarJuego() {
    try {
        const respuesta = await fetch("/reiniciar", { method: "POST" });
        const estado = await respuesta.json();
        renderizarTablero(estado);
    } catch (error) {
        console.error("Error al reiniciar:", error);
    }
}

async function cargarEstadoInicial() {
    try {
        const respuesta = await fetch("/estado");
        const estado = await respuesta.json();
        renderizarTablero(estado);
    } catch (error) {
        console.error("Error al cargar el estado inicial:", error);
    }
}

celdas.forEach((celda) => {
    celda.addEventListener("click", () => {
        if (celda.classList.contains("ocupada")) return;
        const posicion = parseInt(celda.dataset.posicion);
        hacerMovimiento(posicion);
    });
});

btnReiniciar.addEventListener("click", reiniciarJuego);

cargarEstadoInicial();
