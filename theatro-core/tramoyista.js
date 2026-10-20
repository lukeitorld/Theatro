import * as THREE from "../node_modules/three/build/three.module.js";
import { GLTFLoader } from "../node_modules/three/examples/jsm/loaders/GLTFLoader.js";

export class Tramoyista {
  constructor(items = [], texturas = [], modelos = [], sonidos = [], ui_visible = { herramientas: true, bloques: true }) {
    this.interfaz = new Interfaz(ui_visible);
    this.ui_visible = ui_visible;
    this.items = items;
    this.texturas = texturas;
    this.modelos = modelos;
    this.sonidos = sonidos;

    this.cargar_la_interfaz();
  }
  cargar_la_interfaz() {
    // Crear la mirilla del centro
    const mirilla = document.createElement("div");
    mirilla.id = "mirilla";
    const pantalla = document.querySelector("#pantalla");
    pantalla.appendChild(mirilla);

    //cargo los slots para 10 elementos: 3 items + 7 bloques
    this.interfaz.crear_interfaz(this.ui_visible);
    if (this.ui_visible.herramientas) {
      this.interfaz.actualizarRanura(0, this.items[0].ruta, 1);
      this.interfaz.actualizarRanura(1, this.items[1].ruta, 1);
      this.interfaz.actualizarRanura(2, this.items[2].ruta, 1);
    }
    if (this.ui_visible.bloques) {
      for (let i = 0; i < 8; i++) {
        if (!this.texturas[i]) continue
        this.interfaz.actualizarRanura(i + 3, this.texturas[i].ruta, 1);
      }
    }
  }

  async generar_catalogo_de_recursos() {
    const loaderTexturas = new THREE.TextureLoader();
    const recursos = {
      texturas: [null],//reservo la posición 0
      modelos: {},//modeos 3d en formato gtlf
      sonidos: {}
    };

    // TEXTURAS
    for (const textura of this.texturas) {
      const mapa = loaderTexturas.load(textura.ruta);
      mapa.magFilter = THREE.NearestFilter;
      mapa.minFilter = THREE.NearestFilter;
      mapa.generateMipmaps = false;
      recursos.texturas.push(mapa);
    }
    if (recursos.texturas.length < 10) {
      //rellenar con null para evitar errores.
      while (recursos.texturas.length < 10) {
        recursos.texturas.push(null);
      }
    }
    // carga de modelos gltf

    const loaderModelos =
      new GLTFLoader();

    for (const modelo of this.modelos) {

      const objeto = await new Promise(

        (resolve, reject) => {

          loaderModelos.load(modelo.ruta, (gltf) => {

            const objeto = gltf.scene;

            objeto.traverse((hijo) => {
              if (hijo.isMesh) {

                hijo.castShadow = false;

                hijo.receiveShadow = false;

                const materialOriginal = hijo.material;

                hijo.material = new THREE.MeshToonMaterial({

                  map: materialOriginal?.map ?? null,

                  color: materialOriginal?.color
                    ? materialOriginal.color.clone()
                    : new THREE.Color(0xffffff),

                  //transparent: true,

                  alphaTest: 0.5,

                  side: materialOriginal?.side ?? THREE.DoubleSide

                });

              }

            }

            );

            resolve(objeto);

          },
            undefined,
            reject
          );
        }
      );
      recursos.modelos[modelo.nombre] = objeto;

    }
    // SONIDOS
    // pendiente
    return recursos;
  }
}

//----- OTRA CLASE-----//
class Interfaz {
  constructor() {
    this.ranura = null;
    this.icono = null;
    this.texto = null;

  }
  crear_interfaz(ui_visible = { herramientas: true, bloques: true }) {
    // 1️⃣ Obtener el contenedor principal
    const pantalla = document.querySelector("#pantalla");

    // 2️⃣ Crear la barra de inventario
    const barra = document.createElement("div");
    barra.id = "barra-inventario";
    pantalla.appendChild(barra);

    if (ui_visible.herramientas) {
      //generar las 3 ranuras para herramientas
      for (let i = 0; i < 3; i++) {
        const ranura = document.createElement("div");
        ranura.classList.add("ranura");
        ranura.dataset.slot = i;

        const icono = document.createElement("img");
        icono.classList.add("icono");
        icono.loading = "lazy";

        const cantidad = document.createElement("span");
        cantidad.classList.add("cantidad");

        ranura.appendChild(icono);
        ranura.appendChild(cantidad);
        barra.appendChild(ranura);
      }
    }
    if (ui_visible.bloques) {
      for (let i = 3; i < 10; i++) {
        const ranura = document.createElement("div");
        ranura.classList.add("ranura");
        ranura.dataset.slot = i; // ← equivalente a data-slot="i"

        const icono = document.createElement("img");
        icono.classList.add("icono");
        icono.loading = "lazy";

        const cantidad = document.createElement("span");
        cantidad.classList.add("cantidad");

        ranura.appendChild(icono);
        ranura.appendChild(cantidad);
        barra.appendChild(ranura);
      }
    }
  }

  actualizarRanura(indice, rutaIcono, cantidad) {
    this.ranura = document.querySelector(`.ranura[data-slot="${indice}"]`);
    // ⚠️ Si no existe, salimos sin hacer nada
    if (!this.ranura) {
      console.warn(`La ranura ${indice} no existe (está oculta)`);
      return;
    }
    this.icono = this.ranura.querySelector('.icono');
    this.texto = this.ranura.querySelector('.cantidad');

    // Ícono
    this.icono.src = rutaIcono || '';
    this.icono.style.display = rutaIcono ? 'block' : 'none';

    // Cantidad
    this.texto.textContent = cantidad > 1 ? cantidad : '';
  }
}