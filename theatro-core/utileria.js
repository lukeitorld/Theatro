export class Utileria {
    constructor(nombre, modelo, x = 0, y = 0, z = 0, ancho = 1, alto = 1, profundidad = 1, escala = 0.5, director, mundo) {
        this.nombre = nombre;
        // ✅ Asignación DIRECTA, SIN pasar por el setter todavía
        this._modelo = modelo;
        this.director = director;
        this.mundo = mundo;

        this.ancho = ancho;
        this.alto = alto;
        this.profundidad = profundidad;

        this.escala = escala;

        this._x = x;
        this._y = y-0.5;
        this._z = z;

        this.caja = null;

        // ✅ Ahora sí, si vino un modelo, sincronizamos la posición
        if (this._modelo) {
            this._modelo.position.set(x, y, z);
        }
    }

    crear_caja_de_colision() {
        // 📍 El centro (base del objeto)
        const centroX = Math.round(this.x);
        const centroY = Math.round(this.y); // = 1 en el suelo
        const centroZ = Math.round(this.z);

        // 📏 Mitades para expandir desde el centro
        const mitadX = Math.floor(this.ancho / 2);
        const mitadZ = Math.floor(this.profundidad / 2);
        const altura = this.alto; // desde el suelo hacia arriba

        // 🔁 Recorrer TODO el volumen de la caja
        for (let dx = -mitadX; dx <= mitadX; dx++) {
            for (let dz = -mitadZ; dz <= mitadZ; dz++) {
                for (let dy = 0; dy < altura; dy++) { // desde el suelo hacia arriba
                    const x = centroX + dx;
                    const y = centroY + dy;
                    const z = centroZ + dz;

                    this.mundo.colocar(10, x, y, z);
                }
            }
        }
    }
    // ✅ Devuelve la lista de todas las coordenadas que ocupa la caja

    borrar_caja_colision() {
        // 📍 El centro (base del objeto)
        const centroX = Math.round(this.x);
        const centroY = Math.round(this.y); // = 1 en el suelo
        const centroZ = Math.round(this.z);

        // 📏 Mitades para expandir desde el centro
        const mitadX = Math.floor(this.ancho / 2);
        const mitadZ = Math.floor(this.profundidad / 2);
        const altura = Math.ceil(this.alto); // desde el suelo hacia arriba

        // 🔁 Recorrer TODO el volumen de la caja
        for (let dx = -mitadX; dx <= mitadX; dx++) {
            for (let dz = -mitadZ; dz <= mitadZ; dz++) {
                for (let dy = 0; dy < altura; dy++) { // desde el suelo hacia arriba
                    const x = centroX + dx;
                    const y = centroY + dy;
                    const z = centroZ + dz;

                    this.mundo.quitar(x, y, z);
                }
            }
        }
    }

    // 🎯 El setter recién se usa DESPUÉS cuando asignás desde afuera
    set modelo(objeto3D) {
        this._modelo = objeto3D;
        if (this._modelo) {
            this._modelo.position.set(this._x, this._y, this._z);
        }
    }

    get modelo() {
        return this._modelo;
    }

    set x(valor) {
        this.borrar_caja_colision();
        this._x = valor;
        this.crear_caja_de_colision();
        if (this._modelo) this._modelo.position.x = valor;
    }
    get x() { return this._x; }

    set y(valor) {
        this.borrar_caja_colision();
        this._y = valor;
        this.crear_caja_de_colision();
        if (this._modelo) this._modelo.position.y = valor;
    }
    get y() { return this._y; }

    set z(valor) {
        this.borrar_caja_colision();
        this._z = valor;
        this.crear_caja_de_colision();
        if (this._modelo) this._modelo.position.z = valor;
    }
    get z() { return this._z; }

}