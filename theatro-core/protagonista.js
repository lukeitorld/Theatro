export class Protagonista {

    constructor(nombre, director, control, camarografo, mundo, fisica, x, z) {
        this.nombre = nombre;
        this.director = director;
        this.control = control;
        this.camarografo = camarografo;
        this.mundo = mundo;
        this.fisica = fisica;

        this.velocidad = 0.07;

        this.x = x;
        this.y = 3;
        this.pies = 2;
        this.z = z;

        this.habilitar_salto = true;
        this.velocidad_y = 0;
        this.gravedad = 0.01;
        this.fuerza_salto = 0.2;
        this.en_suelo = false;
        this.contador_raycast = 3;


        this.ancho = 0.8;//area que ocupa a cada lado de su centro
        this.alto = 2;
        this.profundo = 0.8;

        this.modelo = null;//modelo 3D en formato gtlf
        this.iniciar();
    }
    iniciar() {
    }

    actualizar() {
        this.movimiento_wasd();
        this.saltar_y_poner_bloques();
        this.interactuar();
    }
    cada_segundo() {

    }

    hay_suelo() {
        return this.fisica.esta_en_suelo(this.x, this.pies, this.z);
    }

    interactuar() {
        const tecla = this.control.cuando_pulsa_tecla();
        if (tecla === "KeyE") {
            const impacto = this.fisica.lanzar_raycaster_interaccion();
            if (impacto) {
                const objeto = this.director.escena_actual.obtener_objeto_interactuable_por_nombre(impacto.nombre);
                if (objeto) {
                    objeto.al_interactuar();
                    return
                }
            } else {
                //se apuntó al aire
                document.getElementById("dialogo").style.display = "none";
            }
        }

    }

    saltar_y_poner_bloques() {
        if (!this.habilitar_salto) {
            return
        }
        //ESPACIO
        if (this.control.tecla_espacio()) {
            if (this.hay_suelo()) {
                this.velocidad_y = this.fuerza_salto;
                //console.log("saltando")
            }
        }
        // gravedad y salto
        if (this.velocidad_y !== 0 || !this.hay_suelo()) {
            const nuevo_y = this.y + this.velocidad_y;
            // subir o bajar
            this.y = nuevo_y;
            // actualizar alturas del cuerpo
            this.pies = this.y - 1;
            // gravedad
            this.velocidad_y -= this.gravedad;
        }
        if (this.velocidad_y <= 0 && this.hay_suelo()) {
            this.velocidad_y = 0;
            this.y = Math.round(this.y);
            this.pies = Math.round(this.pies);
        }
        // actualizar cámara
        this.camarografo.posicionar(this.x, 0, this.z);
        this.camarografo.director.camara.position.y = this.y;
        // raycast
        const click = this.control.cuando_hace_click();
        if (click == 0) {
            // 🔹 Probar PRIMERO con entidades, después con bloques
            let impacto = this.fisica.lanzar_raycaster_interaccion();

            // Si no apuntó a ninguna entidad, pasa al voxel
            if (!impacto) {
                impacto = this.fisica.lanzar_raycaster_voxel();
            }
            if (!impacto) return

            const ranuraActiva = this.control.ranuraSeleccionada;
            const herramienta = document.getElementById('herramienta-en-mano');

            if (!herramienta) return;

            // Animación SIEMPRE se ve aunque no haya golpeado nada
            herramienta.classList.remove('usando');
            void herramienta.offsetWidth;
            herramienta.classList.add('usando');
            setTimeout(() => {
                herramienta.classList.remove('usando');
            }, 360);

            switch (ranuraActiva) {
                case 0:
                    this.usar_herramienta_1(impacto); // ✅ Puede ser voxel, entidad o null
                    break;
                case 1:
                    this.usar_herramienta_2(impacto);
                    break;
                case 2:
                    this.usar_herramienta_3(impacto);
                    break;
                default:
                    console.log("Ninguna herramienta seleccionada");
            }
        }
        if (click == 2) {
            const impacto = this.fisica.lanzar_raycaster_voxel();
            if (impacto) {
                const x = Math.round(impacto.punto.x + impacto.normal.x * 0.5);
                const y = Math.round(impacto.punto.y + impacto.normal.y * 0.51);
                const z = Math.round(impacto.punto.z + impacto.normal.z * 0.5);
                const distanciaX = Math.abs(this.x - x);
                const distanciaz = Math.abs(this.z - z);
                if (distanciaX < 0.8 && distanciaz < 0.8) return
                const ranuraActiva = this.control.ranuraSeleccionada - 2;
                if (ranuraActiva < 0 || ranuraActiva > 9) return
                this.mundo.colocar(ranuraActiva, x, y, z);
                this.mundo.actualizar();
                //console.log(impacto.normal);
            }
        }
    }
    quitar_bloque_apuntado(impacto) {
        const x = Math.round(impacto.punto.x - impacto.normal.x * 0.5);
        const y = Math.round(impacto.punto.y - impacto.normal.y * 0.5);
        const z = Math.round(impacto.punto.z - impacto.normal.z * 0.5);
        const distanciaX = Math.abs(this.x - x);
        const distanciaz = Math.abs(this.z - z);
        if (distanciaX < 0.8 && distanciaz < 0.8) return
        this.mundo.quitar(x, y, z);

        this.mundo.actualizar();
        console.log("x: " + x + "y: " + y + "z: " + z);

    }
    movimiento_wasd() {
        const yaw = this.camarografo.yaw;
        const adelante_x = Math.sin(yaw);
        const adelante_z = -Math.cos(yaw);
        const derecha_x = Math.cos(yaw);
        const derecha_z = Math.sin(yaw);
        // W
        if (this.control.tecla_w()) {
            const nuevo_x = this.x + adelante_x * this.velocidad;
            const nuevo_z = this.z + adelante_z * this.velocidad;
            if (!this.fisica.hay_colision(nuevo_x, this.pies, this.z)) {
                this.x = nuevo_x;
            }
            if (!this.fisica.hay_colision(this.x, this.pies, nuevo_z)) {
                this.z = nuevo_z;
            }
        }
        // S
        if (this.control.tecla_s()) {
            const nuevo_x = this.x - adelante_x * this.velocidad;
            const nuevo_z = this.z - adelante_z * this.velocidad;
            if (!this.fisica.hay_colision(nuevo_x, this.pies, this.z)) {
                this.x = nuevo_x;
            }
            if (!this.fisica.hay_colision(this.x, this.pies, nuevo_z)) {
                this.z = nuevo_z;
            }
        }
        // A
        if (this.control.tecla_a()) {
            const nuevo_x = this.x - derecha_x * this.velocidad;
            const nuevo_z = this.z - derecha_z * this.velocidad;
            if (!this.fisica.hay_colision(nuevo_x, this.pies, this.z)) {
                this.x = nuevo_x;
            }
            if (!this.fisica.hay_colision(this.x, this.pies, nuevo_z)) {
                this.z = nuevo_z;
            }
        }
        // D
        if (this.control.tecla_d()) {
            const nuevo_x = this.x + derecha_x * this.velocidad;
            const nuevo_z = this.z + derecha_z * this.velocidad;
            if (!this.fisica.hay_colision(nuevo_x, this.pies, this.z)) {
                this.x = nuevo_x;
            }
            if (!this.fisica.hay_colision(this.x, this.pies, nuevo_z)) {
                this.z = nuevo_z;
            }
        }
    }

    usar_herramienta_1(impacto) {

    }
    usar_herramienta_2(impacto) {
        //console.log("usaste la herramienta 2")
    }
    usar_herramienta_3(impacto) {
        //console.log("usaste la herramienta 3")
    }

}