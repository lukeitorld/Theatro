export class Camarografo {

    constructor(director, control) {

        this.director = director;
        this.control = control;
        this.x = null;
        this.y = null;
        this.z = null;

        this.yaw = 0;
        this.pitch = 0;


    }

    mover(dx, dy, dz) {

        this.director.camara.position.x += dx;
        this.director.camara.position.y += dy;
        this.director.camara.position.z += dz;
    }

    posicionar(x, y, z) {

        this.director.camara.position.set(x, y, z);
    }

    mirar_hacia(x, y, z) {
        this.director.camara.lookAt(x, y, z);
    }
    mirando_a() {
        const direccion_x = Math.cos(this.pitch) * Math.sin(this.yaw);
        const direccion_y = Math.sin(this.pitch);
        const direccion_z = -Math.cos(this.pitch) * Math.cos(this.yaw);
        const ax = Math.abs(direccion_x);
        const ay = Math.abs(direccion_y);
        const az = Math.abs(direccion_z);
        if (ax > ay && ax > az) {
            return {x: Math.sign(direccion_x),y: 0,z: 0};
        }
        if (ay > ax && ay > az) {
            return {x: 0,y: Math.sign(direccion_y),z: 0};
        }
        return {x: 0,y: 0,z: Math.sign(direccion_z)};
    }
    actualizar_mouse() {
        const sensibilidad = 0.001;

        this.yaw += this.control.movimiento_mouse_x() * sensibilidad;

        this.pitch -= this.control.movimiento_mouse_y() * sensibilidad;

        this.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitch));

        if (this.control.tecla_escape()) {
            this.control.liberar_mouse();
        }
        const direccion_x = Math.cos(this.pitch) * Math.sin(this.yaw);

        const direccion_y = Math.sin(this.pitch);

        const direccion_z = Math.cos(this.pitch) * Math.cos(this.yaw);

        this.mirar_hacia(
            this.director.camara.position.x + direccion_x,
            this.director.camara.position.y + direccion_y,
            this.director.camara.position.z - direccion_z
        );
        this.control.reiniciar_mouse();
    }


}