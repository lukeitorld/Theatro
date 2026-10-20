import { Camarografo } from "./camarografo.js";
import { Mundo } from "./mundo.js";
import { Control } from "./control.js";
import { Fisica } from "./fisica.js";
import { Utileria } from "./utileria.js";
import { Actor } from "./actor.js";


export class Escena {

    constructor(director) {
        const control = new Control();

        this.director = director;
        this._acumulado = 0;
        this.camarografo = this.camarografo = new Camarografo(director, control);
        this.mundo = new Mundo(director);
        this.fisica = new Fisica(director, this.mundo);

        this.actores = [];//incluye NPC y protagonista
        this.utilerias = [];
        this.control = control;
        this.ui = {
            visible: true,
            superior_izquierdo: document.querySelector("#superior_izquierdo"),
            superior_derecho: document.querySelector("#superior_derecho")
        }
        this.luz_ambiental = null;
        this.sol = null;
    }

    cargar() {
        this.luz_ambiental = this.director.agregar_luz_ambiente();
        //Parámetros: color = 0xffffff, intensidad = 1.3, x = 0, z = 0, destinoX = 11, destinoZ = 11
        this.sol = this.director.agregar_reflector();
    }

    iniciar() {
        this.cargar();
        this.iniciar_actores();
        if (!this.ui.visible) {
            this.ocultar_ui_superiores();
        }
    }
    actualizar() {
        const delta = this.director.reloj.getDelta();

        this._acumulado += delta;

        if (this._acumulado >= 1) {
            this.cada_segundos();
            this._acumulado -= 1;

        }
        this.actualizar_actores();
        this.camarografo.actualizar_mouse();
    }

    cada_segundos() {
        for (const actor of this.actores) {
            actor.cada_segundo();
        }
    }

    ocultar_ui_superiores() {
        document.querySelector("#superior_izquierdo").style.display = "none";
        document.querySelector("#superior_derecho").style.display = "none";
    }
    mostrar_ui_superiores() {
        document.querySelector("#superior_izquierdo").style.display = "block";
        document.querySelector("#superior_derecho").style.display = "block";
    }


    iniciar_actores() {
        for (const actor of this.actores) {
            actor.iniciar();
        }
    }
    actualizar_actores() {
        for (const actor of this.actores) {
            actor.actualizar();
        }
    }
    //son los mensajes que recibe de los actores
    enviar_mensaje(msj) {
        this.cuando_llega_un_mensaje(msj);
    }
    cuando_llega_un_mensaje(msj) {
        //este método usa el usuario para configurar el comportamiento al recibir un mensaje del actor
    }
    cargar_protagonista(ClaseJugador, x, z) {
        const protagonista = new ClaseJugador("jugador", this.director, this.control, this.camarografo, this.mundo, this.fisica, x, z);
        this.actores.push(protagonista);
    }
    agregar_actor(ClaseActor) {
        const actor = new ClaseActor(this.director, this.mundo, this);
        const modelo = this.director.recursos.modelos[actor.nombreModelo].clone();
        //modelo.position.set(actor.x, actor.y, actor.z);

        modelo.scale.set(actor.escala, actor.escala, actor.escala);

        modelo.userData.tipo = "actor";
        modelo.userData.nombre = actor.nombre;
        actor.modelo = modelo;
        this.actores.push(actor);
        //this.director.agregar_a_la_escena(modelo);
        this.director.agregar_a_la_escena(actor.modelo);
        if (actor.iniciar) {
            actor.iniciar();
        }
        actor.crear_caja_de_colision();
    }
    //nombre, modelo, x = 0, y = 0, z = 0, ancho = 1, alto = 1, profundidad = 1, escala = 0.5, director, mundo
    crear_utileria(nombre, nombreModelo, x, y, z, ancho, alto, profundidad, escala = 1, rotacion = [0, 0, 0]) {
        const modelo = this.director.recursos.modelos[nombreModelo].clone();
        modelo.position.set(x, y, z);
        modelo.scale.set(escala, escala, escala);

        // ✅ Convertir grados → radianes y aplicar rotación
        const [gradosX, gradosY, gradosZ] = rotacion;
        const aRad = (grados) => grados * Math.PI / 180; // Conversión rápida

        modelo.rotation.set(
            aRad(gradosX),  // Girar sobre el eje X
            aRad(gradosY),  // Girar sobre el eje Y
            aRad(gradosZ)   // Girar sobre el eje Z
        );

        modelo.userData.tipo = "utileria";
        modelo.userData.nombre = nombre;

        const objeto = new Utileria(nombre, modelo, x, y, z, ancho, alto, profundidad, escala, this.director, this.mundo);
        this.utilerias.push(objeto);
        objeto.crear_caja_de_colision();
        this.director.agregar_a_la_escena(objeto.modelo);
    }

    eliminar_actor(nombre) {
        // 1. Buscar el actor en la lista
        const indice = this.actores.findIndex(actor => actor.nombre === nombre);

        // Si no existe, avisamos y salimos
        if (indice === -1) {
            console.warn(`Actor "${nombre}" no encontrado`);
            return false;
        }

        // 2. Sacarlo de la lista
        const actor = this.actores[indice];
        this.actores.splice(indice, 1);

        // 3. Quitar su modelo de la escena
        if (actor.modelo) {
            this.director.quitar_de_la_escena(actor.modelo);
            // ✅ Opcional: liberar memoria si no lo vas a volver a usar
            actor.modelo.geometry?.dispose();
            if (Array.isArray(actor.modelo.material)) {
                actor.modelo.material.forEach(m => m.dispose());
            } else {
                actor.modelo.material?.dispose();
            }
        }

        console.log(`Actor "${nombre}" eliminado ✅`);
        return true;
    }
    salir() {
        // Juntar actores y utilerías
        const todos = [...this.actores, ...this.utilerias];

        for (const elemento of todos) {
            if (elemento.modelo) {
                this.director.quitar_de_la_escena(elemento.modelo);
            }
        }

        // Vaciar cada uno
        this.actores = [];
        this.utilerias = [];

        console.log("✅ Limpiados:", todos.length, "elementos");
    }

    obtener_objeto_interactuable_por_nombre(nombre) {
        for (const actor of this.actores) {
            if (actor.nombre === nombre) {
                return actor;
            }
        }
        // Si llega acá es que no lo encontró
        console.warn(`Actor "${nombre}" no encontrado`);
        return null;
    }

}