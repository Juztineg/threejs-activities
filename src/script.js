import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import GUI from 'lil-gui'

/**
 * Base setup
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

/**
 * Texture and material
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')
const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

/**
 * Sphere
 */
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32)
const sphere = new THREE.Mesh(sphereGeometry, material)
scene.add(sphere)

/**
 * Wireframe
 */
const wireMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
const wireSphere = new THREE.Mesh(sphereGeometry, wireMaterial)
wireSphere.visible = false
scene.add(wireSphere)

/**
 * 3D Text
 */
let text = null
const fontLoader = new FontLoader()
fontLoader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeometry = new TextGeometry('Hello Three.js', {
        font: font,
        size: 0.5,
        height: 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    })
    textGeometry.center()
    text = new THREE.Mesh(textGeometry, material)
    text.position.y = 2
    scene.add(text)
})

/**
 * GUI Controls
 */
const gui = new GUI()
const sphereFolder = gui.addFolder('Sphere Controls')

// Shared position controls
const positionControls = {
    x: sphere.position.x,
    y: sphere.position.y,
    z: sphere.position.z
}

sphereFolder.add(positionControls, 'x', -3, 3, 0.01).name('Position X').onChange((val) => {
    sphere.position.x = val
    wireSphere.position.x = val
})
sphereFolder.add(positionControls, 'y', -3, 3, 0.01).name('Position Y').onChange((val) => {
    sphere.position.y = val
    wireSphere.position.y = val
})
sphereFolder.add(positionControls, 'z', -3, 3, 0.01).name('Position Z').onChange((val) => {
    sphere.position.z = val
    wireSphere.position.z = val
})
sphereFolder.add(sphere, 'visible').name('Show Sphere')

// Matcap color
sphereFolder.addColor({ color: material.color.getHex() }, 'color')
    .name('Matcap Color')
    .onChange((val) => material.color.set(val))

// Wireframe toggle + color
const wireSettings = { wireframe: false, wireColor: '#ffffff' }
sphereFolder.add(wireSettings, 'wireframe').name('Show Wireframe').onChange((val) => {
    wireSphere.visible = val
    sphere.visible = !val
})
sphereFolder.addColor(wireSettings, 'wireColor').name('Wireframe Color').onChange((val) => {
    wireMaterial.color.set(val)
})

// Rotation speeds
const rotationSettings = {
    sphereSpeed: 0.3,
    textSpeed: 0.5
}
gui.add(rotationSettings, 'sphereSpeed', 0, 2, 0.01).name('Sphere Rotation Speed')
gui.add(rotationSettings, 'textSpeed', 0, 2, 0.01).name('Text Rotation Speed')

/**
 * Camera
 */
const sizes = { width: window.innerWidth, height: window.innerHeight }
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 5
scene.add(camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Handle Resize
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Fullscreen
 */
window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement) canvas.requestFullscreen()
    else document.exitFullscreen()
})

/**
 * Animation Loop
 */
const clock = new THREE.Clock()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Sphere rotation
    sphere.rotation.y = elapsedTime * rotationSettings.sphereSpeed
    sphere.rotation.x = elapsedTime * rotationSettings.sphereSpeed * 0.7

    // Wireframe follows sphere position and rotation
    wireSphere.rotation.copy(sphere.rotation)
    wireSphere.position.copy(sphere.position)

    // Text rotation
    if (text) {
        text.rotation.y = elapsedTime * rotationSettings.textSpeed
    }

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}
tick()
