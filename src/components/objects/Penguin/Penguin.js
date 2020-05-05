import { Group, Vector3, Vector2 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TWEEN } from 'three/examples/jsm/libs/tween.module.min.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { TextureLoader } from 'three/src/loaders/TextureLoader.js';
import MODEL from './10033_Penguin_v1_iterations-2.obj';
import MATERIAL from './10033_Penguin_v1_iterations-2.mtl';
import IMAGE1 from './10033_Penguin_v1_Diffuse1.jpg';
import IMAGE2 from './10033_Penguin_v1_Diffuse2.jpg'
import IMAGE3 from './10033_Penguin_v1_Diffuse3.jpg'
import IMAGE4 from './10033_Penguin_v1_Diffuse4.jpg'

class Penguin extends Group {
    constructor(parent, x, z, rotation) {
        // Call parent Group() constructor
        super();


        // set name
        this.name = 'penguin';
        // set force
        this.netForce = new Vector3(0,0,0);
        // set velocity
        this.velocity = new Vector3(0,0,0);
        // set penguinMass
        this.mass = 1;
        // Boolean that signifies whether or not penguin is falling off ice
        this.isFalling = false;
        // Initial coordinates of penguin
        this.coordinates = new Vector3(x, 1, z);

        const loader = new OBJLoader(); // load object loader
        loader.load(MODEL, (object) => {
          let texture = new TextureLoader().load(IMAGE1);
          if (rotation == 90) texture = new TextureLoader().load(IMAGE2);
          if (rotation == 180) texture = new TextureLoader().load(IMAGE3);
          if (rotation == 270) texture = new TextureLoader().load(IMAGE4);
          object.traverse((child) => {
            if (child.type == "Mesh") {
              child.material.map = texture;
            }
          });
          object.scale.divideScalar(20); // scale object
          object.rotateX(-90*Math.PI/180); // rotate so right way up
          object.rotateZ(rotation*Math.PI/180); // rotate so right way up
          object.position.x = x; // set position variables
          object.position.z = z;
          object.position.y = 1;
          this.add(object); // add object to this
        });
      }

    // apply gravitational force to penguin
    applyGravity() {
      this.netForce = new Vector3(0, -60, 0);
    }


    // check if two penguins collide
    collide(penguin) {
      let radius = 1;
      let x1 = this.coordinates;
      let x2 = penguin.coordinates;
      if (x1.distanceTo(x2) < 2*radius) { // update velocity based on collision
        console.log("collision");
        let v1 = this.velocity;
        let v2 = penguin.velocity;
        let v1_v2 = new Vector3(0,0,0);
        let v2_v1 = v1_v2.clone();
        let x1_x2 = v1_v2.clone();
        let x2_x1 = v1_v2.clone();

        v1_v2.subVectors(v1, v2);
        v2_v1.subVectors(v2, v1);
        x1_x2.subVectors(x1, x2);
        x2_x1.subVectors(x2, x1);


        let temp1 = v1_v2.clone();
        temp1.dot(x1_x2);
        temp1.divideScalar(x1_x2.length() * x1_x2.length());
        temp1.multiply(x1_x2);
        temp1.multiplyScalar((2*penguin.mass) / (penguin.mass + this.mass));
        console.log(this.velocity);
        this.velocity.sub(temp1);
        console.log(this.velocity);

        let temp2 = v2_v1.clone();
        temp2.dot(x2_x1);
        temp2.divideScalar(x2_x1.length() * x2_x1.length());
        temp2.multiply(x2_x1);
        temp2.multiplyScalar((2*this.mass) / (penguin.mass + this.mass));
        console.log(penguin.velocity);
        penguin.velocity.sub(temp2);
        console.log(penguin.velocity);
        //debugger;

        return true;
      }
      else { // do nothing if no collision
        return false;
      }
    }


    // Method to launch penguin by setting velocity vector to user input
    launch(vector) {
      this.velocity = vector;
    }


    // update the friction element of each penguin
    // Check if penguin is falling off ice, if so no need to apply friction
    applyFriction() {
      if (this.isFalling) {
        return;
      }
      if (this.velocity.length() < 0.25) {
        this.netForce = new Vector3(0,0,0);
      }
      let velocity = this.velocity.clone();
      velocity.normalize;
      this.netForce = velocity.negate();
    }

    // returns location of penguin
    location() {
      return new Vector2(this.position.x, this.position.z);
    }

    // update force
    updateForce(force) {
      this.netForce.add(force);
    }

    // Updates position of penguin
    update(x, y, z) {
      this.position.x += x;
      this.position.y += y;
      this.position.z += z;
    }
}

export default Penguin;
