from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

estado_juego = {
    "tablero": [""] * 9,
    "turno": "X",
    "ganador": None,
    "juego_terminado": False
}

COMBINACIONES_GANADORAS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
]

def verificar_ganador(tablero):
    for combo in COMBINACIONES_GANADORAS:
        a, b, c = combo
        if tablero[a] and tablero[a] == tablero[b] == tablero[c]:
            return tablero[a], combo
    return None, None

def verificar_empate(tablero):
    return all(celda != "" for celda in tablero)

def reiniciar_estado():
    estado_juego["tablero"] = [""] * 9
    estado_juego["turno"] = "X"
    estado_juego["ganador"] = None
    estado_juego["juego_terminado"] = False

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/estado")
def obtener_estado():
    return jsonify(estado_juego)

@app.route("/mover", methods=["POST"])
def hacer_movimiento():
    if estado_juego["juego_terminado"]:
        return jsonify({"error": "El juego ya terminó"}), 400

    datos = request.get_json()
    posicion = datos.get("posicion")

    if posicion is None or not (0 <= posicion <= 8):
        return jsonify({"error": "Posición inválida"}), 400

    if estado_juego["tablero"][posicion] != "":
        return jsonify({"error": "Celda ocupada"}), 400

    estado_juego["tablero"][posicion] = estado_juego["turno"]

    ganador, combo = verificar_ganador(estado_juego["tablero"])
    if ganador:
        estado_juego["ganador"] = ganador
        estado_juego["juego_terminado"] = True
        return jsonify({**estado_juego, "combo_ganador": combo})

    if verificar_empate(estado_juego["tablero"]):
        estado_juego["ganador"] = "Empate"
        estado_juego["juego_terminado"] = True
        return jsonify(estado_juego)

    estado_juego["turno"] = "O" if estado_juego["turno"] == "X" else "X"
    return jsonify(estado_juego)

@app.route("/reiniciar", methods=["POST"])
def reiniciar():
    reiniciar_estado()
    return jsonify(estado_juego)

if __name__ == "__main__":
    app.run(debug=True)