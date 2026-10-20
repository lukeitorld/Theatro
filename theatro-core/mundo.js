export class Mundo {

    constructor(director) {
        this.director = director;
        this.ancho = 21;
        this.profundo = 21;
        this.alto = 7;
        this.datos = new Uint8Array(this.ancho * this.profundo * this.alto);
    }

    posicion_a_indice(x, y, z) {

        return (
            x +
            z * this.ancho +
            y * this.ancho * this.profundo
        );

    }

    esta_dentro(x, y, z) {

        return (
            x >= 0 &&
            x < this.ancho &&

            y >= 0 &&
            y < this.alto &&

            z >= 0 &&
            z < this.profundo
        );

    }

    colocar(id, x, y, z) {

        if (this.obtener(x, y, z) !== 0) {
            //console.log("Posicion: " + "x: " + x + " y: " + y + " z: " + z);
            //console.warn("La posición ya está ocupada");
            return false;
        }
        const indice = this.posicion_a_indice(x, y, z);

        this.datos[indice] = id;
        return true;
    }

    obtener(x, y, z) {

        if (!this.esta_dentro(x, y, z)) {
            return null;
        }

        const indice = this.posicion_a_indice(x, y, z);

        return this.datos[indice];

    }

    quitar(x, y, z) {
        const indice = this.posicion_a_indice(x, y, z);
        this.datos[indice] = 0;
        
        return true;
    }

    limpiar() {
        this.datos.fill(0);
    }
    actualizar() {
        this.director.crear_mundo(this.datos);
    }
    /**
     * Rellena una capa del mundo con un bloque
     * @param {number} id - Identificador del tipo de bloque (1=césped, 2=piedra, etc.)
     * @param {number} y - Altura donde colocar el suelo, por defecto es 1.
     */
    crear_suelo(id, y = 1) {
        for (let z = 0; z < this.profundo; z++) {
            for (let x = 0; x < this.ancho; x++) {
                this.colocar(id, x, y, z);
            }
        }
    }
    /**
     * Crea una sección llena de bloques entre dos puntos del mundo
     * @param {number} id_bloque - Identificador del tipo de bloque (1=césped, 2=piedra, etc.)
     * @param {number} x1 - Posición inicial en el eje X
     * @param {number} y1 - Posición inicial en la altura
     * @param {number} z1 - Posición inicial en el eje Z
     * @param {number} x2 - Posición final en el eje X
     * @param {number} y2 - Posición final en la altura
     * @param {number} z2 - Posición final en el eje Z
     */
    poner_seccion(id, x1, y1, z1, x2, y2, z2) {
        const min_x = Math.min(x1, x2);
        const max_x = Math.max(x1, x2);
        const min_y = Math.min(y1, y2);
        const max_y = Math.max(y1, y2);
        const min_z = Math.min(z1, z2);
        const max_z = Math.max(z1, z2);

        for (let y = min_y; y <= max_y; y++) {
            for (let z = min_z; z <= max_z; z++) {
                for (let x = min_x; x <= max_x; x++) {
                    this.colocar(id, x, y, z);
                }
            }
        }
    }

    guardar() {
        const datos = {
            ancho: this.ancho,
            profundo: this.profundo,
            alto: this.alto,
            bloques: Array.from(this.datos)
        };

        return JSON.stringify(datos);
    }

    cargar(partida) {
        const datos = JSON.parse(partida);

        this.ancho = datos.ancho;
        this.profundo = datos.profundo;
        this.alto = datos.alto;

        this.datos = new Uint8Array(datos.bloques);
    }

}