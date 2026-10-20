import * as THREE from "../node_modules/three/build/three.module.js";

export class Director {
  constructor(recursos) {
    this.recursos = recursos;//es el catalogo de la clase tramoyista
    this.voxeles = null;
    this.renderizador = null;
    this.escena = null;//es la escena de threeJS
    this.camara = null;
    this.escena_actual = null;//es la clase escena de threatro

    this.cubo_wireframe = null;
    this.instancias = {};
    this.listaInstancias = null;
    this.reloj = null;
  }
  precargar() {
    this.construir_voxeles();
  }

  iniciar() {
    //incio el render
    this.renderizador = new THREE.WebGLRenderer({ antialias: true });
    this.renderizador.setSize(window.innerWidth, window.innerHeight);
    //cargo el canvas
    const contenedor = document.querySelector("#app");
    contenedor.appendChild(this.renderizador.domElement);
    window.addEventListener("resize", () => {
      const ancho = contenedor.clientWidth;
      const alto = contenedor.clientHeight;
      this.camara.aspect = ancho / alto;
      this.camara.updateProjectionMatrix();
      this.renderizador.setSize(ancho, alto);
    }
    );

    //creo la escena
    this.escena = new THREE.Scene();
    this.escena.background = new THREE.Color("#87CEEB");
    this.camara = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    //inicio el reloj
    this.reloj = new THREE.Timer();
    //this.reloj.conect(document);
    //inicio el loop

    if (this.escena_actual) {
      this.escena_actual.iniciar();
    }
    //crear cubo que señala el lugar donde apuntamos
    this.crear_cubo_wireframe();

    this.renderizar();
  }
  renderizar() {

    requestAnimationFrame(
      () => this.renderizar()
    );

    this.reloj.update();

    if (this.escena_actual) {
      this.escena_actual.actualizar();
    }

    this.renderizador.render(
      this.escena,
      this.camara
    );

  }

  agregar_a_la_escena(objeto) {
    this.escena.add(objeto);
  }
  quitar_de_la_escena(objeto) {
    this.escena.remove(objeto);
  }

  agregar_luz_ambiente(color = 0xffffff, intensidad = 0.8) {
    const luz = new THREE.AmbientLight(color, intensidad);
    this.escena.add(luz);
    return luz;
  }
  agregar_reflector(color =  0xfffff8, intensidad = 2, x = 50, z = 50, destinoX = 11, destinoZ = 11) {
    const reflector = new THREE.DirectionalLight(color, intensidad);

    // 📍 Desde dónde brilla
    reflector.position.set(x, 50, z);

    // 🎯 Hacia dónde apunta, por defecto al centro (11,11)
    reflector.target.position.set(destinoX, 1, destinoZ);

    this.escena.add(reflector);
    this.escena.add(reflector.target);

    return reflector;
  }

  construir_voxeles() {
    const geometriaVoxel = new THREE.BoxGeometry(1, 1, 1);
    this.voxeles = [
      { id: 0 }
    ];

    for (let i = 1; i <= 9; i++) {
      const tieneTextura = this.recursos.texturas[i];
      const material = new THREE.MeshToonMaterial({
        map: tieneTextura ? this.recursos.texturas[i] : null,
        color: tieneTextura ? 0xffffff : "red",

        // Opcional: definís cuántos niveles de brillo hay
        gradientMap: null // ← por defecto viene bien
      });
      this.voxeles.push({
        id: i,
        geometria: geometriaVoxel,
        material
      });
    }
  }
  posicion_a_indice(x, y, z) {
    return x + z * 21 + y * 21 * 21;
  }

  cambiar_escena(nueva_escena) {
    this.escena_actual.salir();
    this.escena_actual = new nueva_escena(this);
    this.escena_actual.iniciar();
    console.log("escena cambiada exitosamente");
  }

  crear_cubo_wireframe() {
    const geometria = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
    this.cubo_wireframe = new THREE.Mesh(geometria, material);
    this.escena.add(this.cubo_wireframe);
  }
  posicionar_cubo_wireframe(x, y, z) {
    if (!this.cubo_wireframe) {
      return;
    }
    this.cubo_wireframe.position.set(x, y, z);
  }

  mostrar_cubo_wireframe() {
    this.cubo_wireframe.visible = true;
  }
  ocultar_cubo_wireframe() {
    this.cubo_wireframe.visible = false;
  }
  crear_mundo(datos) {
    const ANCHO = 21;
    const PROFUNDO = 21;
    const ALTO = 7;

    // Limpiar mundo anterior + liberar memoria
    for (const id in this.instancias) {
      const malla = this.instancias[id];
      this.escena.remove(malla);
      malla.geometry.dispose(); // ✅ Limpieza completa
    }
    this.instancias = {};

    // Contar bloques por tipo
    const cantidades = new Array(10).fill(0);
    for (let i = 0; i < datos.length; i++) {
      const id = datos[i];
      if (id === 10) continue;
      if (id > 0) cantidades[id]++;
    }

    // Crear mallas solo para tipos que existen
    for (let id = 1; id <= 9; id++) {
      if (cantidades[id] === 0) continue;

      const voxel = this.voxeles[id];
      this.instancias[id] = new THREE.InstancedMesh(
        voxel.geometria,
        voxel.material,
        cantidades[id]
      );
      this.escena.add(this.instancias[id]);
    }

    // Colocar bloques
    const dummy = new THREE.Object3D();
    dummy.rotation.set(0, 0, 0); // ✅ Una sola vez
    dummy.scale.set(1, 1, 1);    // ✅ Una sola vez

    const indice_actual = new Array(10).fill(0);

    // Recorrido limpio sin cálculos repetidos
    let idx = 0;
    for (let y = 0; y < ALTO; y++) {
      for (let z = 0; z < PROFUNDO; z++) {
        for (let x = 0; x < ANCHO; x++) {
          const id = datos[idx++];
          if (id === 0) continue;
          if (id === 10) continue;

          dummy.position.set(x, y, z);
          dummy.updateMatrix();
          this.instancias[id].setMatrixAt(indice_actual[id], dummy.matrix);
          indice_actual[id]++;
        }
      }
    }

    // Actualizar GPU
    for (let id = 1; id <= 9; id++) {
      if (this.instancias[id]) {
        this.instancias[id].instanceMatrix.needsUpdate = true;
      }
    }
    this.listaInstancias = Object.values(this.instancias);
  }

}
