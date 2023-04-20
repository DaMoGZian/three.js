/**
 * For anyone who wants to use OOP for making ThreeJS Apps
 *
 * Other classes inherit the Application class
 */

import { OrbitControls } from "../../examples/jsm/controls/OrbitControls.js";
import { PerspectiveCamera } from "../cameras/PerspectiveCamera.js";
import { WebGLRenderer } from "../renderers/WebGLRenderer.js";
import { Scene } from "../scenes/Scene.js";

class Application {
	constructor() {
		this.renderer = new WebGLRenderer();
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			0.01,
			1000
		);

		this.orbitControls = new OrbitControls(
			this.camera,
			this.renderer.domElement
		);
	}

	setFullscreen() {
		this.renderer.setSize(innerWidth, innerHeight);
	}

	useOrbitControls() {
		this.orbitControls.update();
	}

	init() {
		this.renderer.appendToDom(); // Function added by me (other pull request)
	}

	render() {
		this.renderer.render(this.scene, this.camera);
	}

	run() {
		this.init();
		this.loop();
	}

	loop() {
		this.render();

		requestAnimationFrame(this.loop.bind(this));
	}
}

export { Application };
