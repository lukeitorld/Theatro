# Theatro v 0.1

Motor de Juegos 3D Minimalista inspirado en Bitsy y Pilas Engine.

## Características

- API completamente en español
- Basado en ThreeJS
- Enfoque educativo
- Metáfora teatral para la construcción de juegos
- Código ligero y fácil de leer
- Ideal para enseñanza y prototipos

## Instalación
- Requiere [Three.js](https://github.com/mrdoob/three.js/)
- 

## Ejemplo Mínimo
```js
//Los items son las imágenes de las herramientas que se cargan a la barra inferior
const items = [
    { nombre: "azada", ruta: "./assets/imagenes/azada.png" },
    { nombre: "pala", ruta: "./assets/imagenes/pala.png" },
    { nombre: "hacha", ruta: "./assets/imagenes/hacha.png" }
]

//Las texturas son imágenes que "pintan" los bloques del mundo
const texturas = [
    { nombre: "cesped", ruta: "./assets/imagenes/cesped.png" },//se toma como el bloque de id=1
    { nombre: "piedra", ruta: "./assets/imagenes/piedra.png" },//id=2
    { nombre: "arena", ruta: "./assets/imagenes/arena.png" },//id=3
    { nombre: "tablon", ruta: "./assets/imagenes/tablon.png" },//id=4
    { nombre: "ladrillo", ruta: "./assets/imagenes/ladrillo.png" },//id=5
    { nombre: "tronco", ruta: "./assets/imagenes/tronco.png" },//id=6
    { nombre: "agua", ruta: "./assets/imagenes/agua.png" },//id=7
]

//Los modelos 3D que se pueden cargar a la escena. Solo se acepta el formato gltf
const modelos = [
    { nombre: "arbol", ruta: "./assets/modelos3D/arbol3D.gltf" },
    { nombre: "flor", ruta: "./assets/modelos3D/flor.gltf" },
    { nombre: "personajeA", ruta: "./assets/modelos3D/personaje_prueba.gltf" }
]

//Procesa los recursos en algo que threeJS puede usar y los pasa al Director
const tramoyista = new Tramoyista(items, texturas, modelos, null, { herramientas: true, bloques: true });

class Jugador extends Protagonista {
    constructor(nombre, director, control, camarografo, mundo, fisica, x, z) {
        super(nombre, director, control, camarografo, mundo, fisica, x, z);
    }
    iniciar() {
        super.iniciar();
        this.x = 5;
        this.z = 5;
    }
    actualizar() {
        super.actualizar();
    }
    cada_segundo() {

    }
    // ✅ Puedes reescribir solo el que necesites
    usar_herramienta_1(impacto) {
        // "impacto" tiene todo lo que devuelve el raycaster:
        // .distancia, .punto, .normal, .instancia, .objeto

        console.log("⛏️ Picaste en:", impacto.punto);
        // console.log("Bloque afectado Nº:", impacto.instancia);

        // // Tu lógica: romper bloque, restar vida, etc.
        // this.mundo.quitar(/* tus coordenadas */);
    }

    usar_herramienta_2(impacto) {
        //super.usar_herramienta_2(impacto);
        console.log("🔨 Usaste la herramienta 2");
        this.quitar_bloque_apuntado(impacto);
    }

    usar_herramienta_3(impacto) {
        // Si no escribes nada aquí → se usa el vacío de la clase Protagonista
        console.log("🪓 Herramienta 3");
    }
}

class Juanito extends Actor {
    constructor(director, mundo, escena) {
        //super(nombre, nombre_de_modelo, x,y,z, dialogos, escala)
        super("Juanito", "personajeA", 8, 2, 3, [],1,2,1,0.05, director, mundo, escena);
        this.segundos = 0;
    }
    iniciar() {
        //se llama una vez cuando se carga la escena
    }
    actualizar() {
        //se llama en cada frame
    }
    al_interactuar() {
        //se llama cuando el protagonista le apunta con el cursor y presiona la tecla E.
        this.decir("Soy juanito.");
    }

    cada_segundo() {
        //lo siguiente a Juanito 1 bloque por segundo
        this.segundos += 1;
        if (this.segundos > 3) {
            this.escena.enviar_mensaje("hola mundo");
        }
        
    }
}
class Pruebas extends Escena {
    constructor(director) {
        super(director);
    }
    iniciar() {
        super.iniciar();
        this.mundo.crear_suelo(1, 1);
        this.mundo.poner_seccion(2,
            0, 1, 0,
            0, 7, 20);
        this.mundo.poner_seccion(2,
            0, 1, 0,
            20, 7, 0);
        this.mundo.poner_seccion(2,
            20, 1, 0,
            20, 7, 20);
        this.mundo.poner_seccion(2,
            0, 1, 20,
            20, 7, 20);
        this.mundo.actualizar();
        this.crear_utileria("arbol 1", "arbol", 5, 1, 3,1,3,1,0.1);
        this.crear_utileria("tulipan", "flor", 7, 2, 7,1,1,1, 0.01, [90, 0, 0]);
        this.agregar_actor(Juanito);
        this.ui.superior_izquierdo.innerHTML = `
            💰 Dinero: 120
            🌱 Semillas: 12
            `;

        this.ui.superior_derecho.innerHTML = `
            📅 Día 3
            🕒 14:25
            `;
        this.cargar_protagonista(Jugador, 1, 1);
    }
    actualizar() {
        super.actualizar();
        if (this.control.tecla_h()) {
            this.director.cambiar_escena(OtraEscena);
        }
    }
    cada_segundo() {
        //this.eliminar_actor("Juanito");
    }
    cuando_llega_un_mensaje(msj) {
        if (msj == "hola mundo") {
            console.log("siuuu");
        }
    }
}

class OtraEscena extends Escena {
    constructor(director) {
        super(director);
    }
    iniciar() {
        super.iniciar();
        this.mundo.crear_suelo(4, 1);
        this.mundo.poner_seccion(5,
            0, 1, 0,
            0, 7, 20);
        this.mundo.poner_seccion(5,
            0, 1, 0,
            20, 7, 0);
        this.mundo.poner_seccion(5,
            20, 1, 0,
            20, 7, 20);
        this.mundo.poner_seccion(5,
            0, 1, 20,
            20, 7, 20);
        this.mundo.actualizar();
        this.ui.superior_izquierdo.innerHTML = `
            💰 Dinero: 120
            🌱 Semillas: 12
            `;

        this.ui.superior_derecho.innerHTML = `
            📅 Día 5
            🕒 14:25
            `;
        this.cargar_protagonista(Jugador, 1, 1);
    }
    cada_segundo() {
    }
}


window.onload = async function () {
    const recursos = await tramoyista.generar_catalogo_de_recursos();
    const director = new Director(recursos);
    const pruebas = new Pruebas(director);
    director.precargar();
    director.escena_actual = pruebas;
    director.iniciar();
}

```
## Documentación

## Roadmap

## Contribuir

## Licencia
