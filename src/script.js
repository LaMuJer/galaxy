import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import {mod} from "three/examples/jsm/renderers/nodes/ShaderNode";

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const parameters = {}
parameters.count = 100000
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spin = 5
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = "#11e5e8"
parameters.outsideColor = "#0667c1"

let geometry = null
let material = null
let particles = null

const generateGalaxy = () => {

    if (particles !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(particles)
    }

    geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    for (let i = 0; i < parameters.count; i++) {
        let i3 = i * 3

        // Positions
        const radius = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const spin = radius * parameters.spin
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() - 0.5) * parameters.randomness
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() - 0.5) * parameters.randomness
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() - 0.5) * parameters.randomness

        positions[i3]   = Math.cos(branchAngle * spin) * radius + randomX
        positions[i3+1] = Math.tan(branchAngle * spin) * radius + randomY
        positions[i3+2] = Math.sin(branchAngle + spin) * radius + randomZ

        // Colors
        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3]   = mixedColor.r
        colors[i3+1] = mixedColor.g
        colors[i3+2] = mixedColor.b
    }

    geometry.setAttribute('position' , new THREE.BufferAttribute(positions,3))
    geometry.setAttribute('color' , new THREE.BufferAttribute(colors,3))

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        color: parameters.insideColor,
        vertexColors: true,
    })

    particles = new THREE.Points(geometry,material)
    particles.position.set(1,1,1 )
    scene.add(particles)
}
generateGalaxy()

gui.add(parameters, 'count' , 1000, 1000000, 100).name('count').onFinishChange(generateGalaxy)
gui.add(parameters, 'size' , 0.01, 0.1, 0.001).name('size').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius' , 1, 20, 1).name('radius').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches' , 2, 100, 1).name('branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'spin' , 2, 100, 1).name('spin').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness' , 0.1, 1, 0.001).name('randomness').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower' , 0.1, 10, 0.001).name('randomnessPower').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)



/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial()
// )
// scene.add(cube)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 5
camera.position.y = 2
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()