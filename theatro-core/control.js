export class Control {
    constructor() {
        this.teclas = {};
        this.tecla_pulsada = null; // Guarda la tecla que acaba de presionarse

        this.mouse_x = 0;
        this.mouse_y = 0;
        this.boton_izquierdo = false;
        this.boton_derecho = false;
        this.boton_central = false;

        //ruedita del raton
        this.ranuraSeleccionada = 0; // Empieza en la primera
        this.cantidadRanuras = 10;

        this.clic_pendiente = null;

        this.delta_mouse_x = 0;
        this.delta_mouse_y = 0;
        this.mouse_bloqueado = false;

        window.addEventListener("keydown", (evento) => {
            if (!this.teclas[evento.code]) { // Solo si NO estaba ya presionada
                this.tecla_pulsada = evento.code; // ✅ Marcar como recién pulsada
            }
            this.teclas[evento.code] = true;
        });

        // Al SOLTAR → marcar como liberada
        window.addEventListener("keyup", (evento) => {
            this.teclas[evento.code] = false;
        });
        window.addEventListener("mouseup",
            (evento) => {
                if (evento.button === 0) {
                    this.boton_izquierdo = false;
                }
                if (evento.button === 1) {
                    this.boton_central = false;
                }
                if (evento.button === 2) {
                    this.boton_derecho = false;
                }
                this.clic_pendiente = evento.button;
            }
        );
        window.addEventListener("mousedown",
            (evento) => {

                if (evento.button === 0) {
                    this.boton_izquierdo = true;
                }
                if (evento.button === 1) {
                    this.boton_central = true;
                }
                if (evento.button === 2) {
                    this.boton_derecho = true;
                }
            }
        );
        document.addEventListener(
            "pointerlockchange",
            () => {
                this.mouse_bloqueado = document.pointerLockElement !== null;
            }
        );

        window.addEventListener(
            "mousemove",
            (evento) => {
                this.mouse_x = evento.clientX;
                this.mouse_y = evento.clientY;

                if (!this.mouse_bloqueado) {
                    return;
                }

                this.delta_mouse_x +=
                    evento.movementX;

                this.delta_mouse_y +=
                    evento.movementY;

            }
        );
        window.addEventListener(
            "click",
            () => {
                this.capturar_mouse();
            }
        );
        window.addEventListener('wheel', (e) => {
            // ⚠️ Sacamos el preventDefault() de aquí
            if (e.deltaY < 0) {
                this.ranuraSeleccionada--;
                if (this.ranuraSeleccionada < 0) {
                    this.ranuraSeleccionada = this.cantidadRanuras - 1;
                }
            } else {
                this.ranuraSeleccionada++;
                if (this.ranuraSeleccionada >= this.cantidadRanuras) {
                    this.ranuraSeleccionada = 0;
                }
            }

            this.actualizarSeleccion();
        }, { passive: false }); // ✅ Clave: permitir cancelar el evento

        // ✅ Mostrar la primera seleccionada al inicio
        this.actualizarSeleccion();
    }

    actualizarSeleccion() {
        // Quitar resaltado de TODAS
        for (let i = 0; i < this.cantidadRanuras; i++) {
            const ranura = document.querySelector(`.ranura[data-slot="${i}"]`);
            if (ranura) ranura.classList.remove('seleccionada');
        }

        // Agregar resaltado a la ACTUAL
        const activa = document.querySelector(`.ranura[data-slot="${this.ranuraSeleccionada}"]`);
        if (activa) {
            activa.classList.add('seleccionada');
            this.mostrar_en_mano();
        }
    }
    mostrar_en_mano() {
        // 1️⃣ Buscar la ranura que está seleccionada ahora
        const ranuraActiva = document.querySelector(
            `.ranura[data-slot="${this.ranuraSeleccionada}"]`
        );

        if (!ranuraActiva || this.ranuraSeleccionada > 2) {
            // Si no se encuentra, limpiar la imagen
            const enMano = document.getElementById('herramienta-en-mano');
            if (enMano) enMano.src = '';
            return;
        }

        // 2️⃣ Tomar la imagen de esa ranura (la primera etiqueta <img> dentro)
        const iconoDeLaRanura = ranuraActiva.querySelector('.icono');

        // 3️⃣ Asignarla al elemento "en mano"
        const herramientaEnMano = document.getElementById('herramienta-en-mano');
        if (herramientaEnMano && iconoDeLaRanura) {
            herramientaEnMano.src = iconoDeLaRanura.src;
            // Opcional: mantener el mismo alt/título si querés
            herramientaEnMano.alt = iconoDeLaRanura.alt || '';
        }
    }
    cuando_pulsa_tecla() {
        const tecla = this.tecla_pulsada;
        this.tecla_pulsada = null; // Se borra al leer → no se repite ✅
        return tecla; // Devuelve el código o null si no hubo nada
    }

    presionada(codigo) {
        return this.teclas[codigo];
    }
    cuando_hace_click() {
        const valor = this.clic_pendiente;
        //console.log(valor);
        // 🧹 Se lee y se borra automáticamente → UNA SOLA VEZ
        this.clic_pendiente = null;
        return valor;
    }
    capturar_mouse() {
        const canvas = document.querySelector("canvas");
        canvas.requestPointerLock();
    }
    liberar_mouse() {
        document.exitPointerLock();
    }
    movimiento_mouse_x() {
        return this.delta_mouse_x;
    }
    movimiento_mouse_y() {
        return this.delta_mouse_y;
    }

    mouse_x() {
        return this.mouse_x;
    }

    mouse_y() {
        return this.mouse_y;
    }
    reiniciar_mouse() {
        this.delta_mouse_x = 0;
        this.delta_mouse_y = 0;
    }
    clic_izquierdo() {
        return this.boton_izquierdo;
    }

    clic_derecho() {
        return this.boton_derecho;
    }

    clic_central() {
        return this.boton_central;
    }

    tecla_w() {
        return this.presionada("KeyW");
    }

    tecla_a() {
        return this.presionada("KeyA");
    }

    tecla_s() {
        return this.presionada("KeyS");
    }

    tecla_d() {
        return this.presionada("KeyD");
    }

    tecla_h() {
        return this.presionada("KeyH");
    }

    tecla_arriba() {
        return this.presionada("ArrowUp");
    }

    tecla_abajo() {
        return this.presionada("ArrowDown");
    }

    tecla_izquierda() {
        return this.presionada("ArrowLeft");
    }

    tecla_derecha() {
        return this.presionada("ArrowRight");
    }

    tecla_espacio() {
        return this.presionada("Space");
    }

    tecla_escape() {
        return this.presionada("Escape");
    }
}
