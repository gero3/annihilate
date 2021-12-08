import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
class Ai {
  constructor(character, distance = 1) {
    this.character = character
    this.target = null
    this.distance = distance

    this.enabled = true

    this.isAttack = true

    updates.push(this)

    this.detector = new CANNON.Body({
      mass: 0,
      collisionFilterGroup: g.GROUP_TRIGGER,
      collisionFilterMask: g.GROUP_ROLE,
    })
    this.detector.belongTo = this
    this.detector.collisionResponse = false
    let shape = new CANNON.Sphere(10)
    this.detector.addShape(shape)
    window.world.addBody(this.detector)

    this.detector.addEventListener('beginContact', (event) => {
      // console.log('enemy find ', event.body.belongTo?.constructor.name)
      this.setTarget(event.body.belongTo)
    })

    this.detector.addEventListener('endContact', (event) => {
      this.setTarget(null)
    })
  }

  update(dt) {
    // console.log(this.character.facing.x, this.character.facing.y)
    // console.log(this.character.direction.x, this.character.direction.y)

    if (!this.enabled) {
      // this.character.service.send('stop')
      return
    }

    if (this.target) {
      // if (this.character.service.state.matches('loading')) return

      this.character.direction.x = this.target.body.position.x - this.character.body.position.x
      this.character.direction.y = this.target.body.position.z - this.character.body.position.z
      // console.log(this.character.direction)

      if (this.character.direction.length() > this.distance) {
        this.character.service.send('run')
        this.character.facing.copy(this.character.direction)
      } else {
        if (this.isAttack) {
          // if (g.isAttack) {
          this.character.service.send('attack')
          // } else {
          //   this.character.service.send('stop')
          // }
        } else {
          this.character.service.send('stop')
        }
      }

      if (this.character.service.state.hasTag('canMove')) {
        // change facing
        this.character.mesh.rotation.y = -this.character.facing.angle() + Math.PI / 2 ///formal
        // this.character.mesh.rotation.y = -this.character.facing.angle()+Math.PI///test
      }

      this.character.direction.normalize().multiplyScalar(this.character.speed)
      if (this.character.service.state.hasTag('canMove')) {
        this.character.body.position.x += this.character.direction.x
        this.character.body.position.z += this.character.direction.y
        // let velocityScale = 70
        // this.character.body.velocity.x = this.character.direction.x * velocityScale
        // this.character.body.velocity.z = this.character.direction.y * velocityScale
      }
    } else {
      this.character.service.send('stop')
    }

    this.detector.position.copy(this.character.body.position)
  }
  setCharacter(character) {
    this.character = character
  }
  setTarget(target) {
    this.target = target
  }
  setDistance(distance) {
    this.distance = distance
  }
}

export { Ai }
