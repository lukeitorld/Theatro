import { Utileria } from "./utileria.js";
export class Actor extends Utileria {

    constructor(nombre, nombreModelo, x, y, z, dialogos = [], ancho = 1, alto = 1, profundidad = 1, escala, director, mundo, escena) {
        super(nombre, null, x, y, z, ancho, alto, profundidad,escala, director);
        this.nombreModelo = nombreModelo;
        this.dialogos = dialogos;
        this.mundo = mundo;
        this.escena = escena;

    }
    decir(texto) {
        const dialogo = document.getElementById("dialogo");
        dialogo.style.display = "block";
        dialogo.innerText = texto;
        //console.log("ya hablo");
    }
    ocultar_dialogo() {
        document.getElementById("dialogo").style.display = "none";
    }
    al_interactuar(dialogo_numero = 0) {
        const dialogo = this.dialogos[dialogo_numero];
        this.decir(dialogo);
    }
    actualizar() {

    }
    cada_segundo() {

    }
}
