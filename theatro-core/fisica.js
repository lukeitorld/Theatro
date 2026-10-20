import * as THREE from "../node_modules/three/build/three.module.js";
//es un módulo aparte por si se precisa cambiarlo por un motor de física completo
export class Fisica {

    constructor(director, mundo) {

        this.director = director;
        this.mundo = mundo;

        this.raycaster = new THREE.Raycaster();
    }
    iniciar() {

    }

    lanzar_raycaster_voxel() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.director.camara);
        //this.raycaster.near = 2;  // Ignorar lo que esté a menos
        this.raycaster.far = 4;  // Ignorar lo que esté a más

        const impactos = this.raycaster.intersectObjects(this.director.listaInstancias, false);

        if (impactos.length === 0) {
            return null;
        }

        const impacto = impactos[0];
        return {
            distancia: impacto.distance,
            punto: {
                x: impacto.point.x,
                y: impacto.point.y,
                z: impacto.point.z
            },
            normal: {
                x: impacto.face.normal.x,
                y: impacto.face.normal.y,
                z: impacto.face.normal.z
            },
            instancia: impacto.instanceId,
            objeto: impacto.object
        };
    }
    lanzar_raycaster_interaccion() {

        this.raycaster.setFromCamera(
            { x: 0, y: 0 },
            this.director.camara
        );

        this.raycaster.near = 1;
        this.raycaster.far = 4;

        const candidatos = this.director.escena.children.filter(objeto => !this.director.listaInstancias.includes(objeto));

        const impactos = this.raycaster.intersectObjects(candidatos, true);

        if (impactos.length === 0) {
            return null;
        }

        const impacto = impactos[0];
        let objeto = impacto.object;
        while (objeto.parent && !objeto.userData?.tipo) {
            objeto = objeto.parent;
        }

        return {
            distancia: impacto.distance,
            punto: { x: impacto.point.x, y: impacto.point.y, z: impacto.point.z },
            objeto: impacto.object,
            tipo: objeto.userData?.tipo ?? null,
            nombre: objeto.userData?.nombre ?? null,
        };

    }

    obtener_bloque_apuntado() {
        this.raycaster.setFromCamera({ x: 0, y: 0 }, this.director.camara);
    }

    crear_caja(x, y, z, ancho = 0.8, alto = 2, profundo = 0.8) {

        return new THREE.Box3(new THREE.Vector3(x - ancho / 2, y, z - profundo / 2),
            new THREE.Vector3(x + ancho / 2, y + alto, z + profundo / 2)
        );

    }
    vector_3d() {
        return new THREE.Vector3();
    }
    obtener_dimension_modelo(modelo) {
        const caja =new THREE.Box3().setFromObject(modelo);

        const dimension = new THREE.Vector3();

        caja.getSize(dimension);

        return [
            dimension.x,
            dimension.y,
            dimension.z
        ];

    }

    esta_en_suelo(x, y, z) {
        return this.hay_colision(x, y - 0.5, z);
    }

    hay_colision(x, y, z, ancho = 0.8, alto = 2, profundo = 0.8) {
        // 1. Caja del jugador — UNA SOLA VEZ
        const jugador = this.crear_caja(x, y, z, ancho, alto, profundo);

        // 2. Calcular SOLO el rango cercano al jugador
        //    ¿qué bloques pueden tocarlo? ±2 bloques en cada dirección
        const minX = Math.max(0, Math.floor(x - ancho - 1));
        const maxX = Math.min(this.mundo.ancho - 1, Math.ceil(x + ancho + 1));

        const minY = Math.max(0, Math.floor(y - 1));
        const maxY = Math.min(this.mundo.alto - 1, Math.ceil(y + alto + 1));

        const minZ = Math.max(0, Math.floor(z - profundo - 1));
        const maxZ = Math.min(this.mundo.profundo - 1, Math.ceil(z + profundo + 1));

        // 3. Recorrer SOLO ese rango ✅
        for (let vy = minY; vy <= maxY; vy++) {
            for (let vz = minZ; vz <= maxZ; vz++) {
                for (let vx = minX; vx <= maxX; vx++) {

                    const bloque = this.mundo.obtener(vx, vy, vz);
                    if (bloque === 0) continue;

                    // 4. Caja del bloque SIN crear objeto nuevo cada vez
                    // Bloque en (vx, vy, vz) = centro en ese punto, tamaño 1×1×1
                    const caja_bloque = new THREE.Box3(
                        new THREE.Vector3(vx - 0.5, vy - 0.5, vz - 0.5),
                        new THREE.Vector3(vx + 0.5, vy + 0.5, vz + 0.5)
                    );

                    if (jugador.intersectsBox(caja_bloque)) {
                        return true; // ¡chocó!
                    }
                }
            }
        }

        return false; // nada chocó
    }

}