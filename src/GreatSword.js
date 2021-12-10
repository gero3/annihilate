import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Splash } from './Splash.js'
import { Attacker } from './Attacker.js'

class GreatSword extends Attacker {
  constructor() {
    super()

    let shape = new CANNON.Box(new CANNON.Vec3(0.19, 0.19, 0.74))
    // let shape = new CANNON.Box(new CANNON.Vec3(0.5 * 3, 0.5 * 3, 2 * 3))
    this.body.addShape(shape)
    world.addBody(this.body)
  }

  update() {
    // console.log(this.collidings.length)

    if (this.owner.gltf) {
      let tempVec3 = vec3() ///todo: performance
      let tempQuat = new THREE.Quaternion() ///todo: performance
      // this.owner.mesh.children[0].children[0].children[1].children[0].getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldPosition(tempVec3)
      this.owner.swordDelegate.getWorldQuaternion(tempQuat)
      this.body.position.copy(tempVec3)
      this.body.quaternion.copy(tempQuat)
    }
  }

  collide(event, isBeginCollide) {
    // console.log('greatSword collide', event.body.belongTo)
    // if (event.body.belongTo?.isEnemy === true && event.body.belongTo !== this.owner) {
    // console.log(1111111111)
    if (isBeginCollide && this.owner.service.state.hasTag('canDamage')) {
      // console.log('collide')

      // debugger
      if (event.body.belongTo.isEnemy) {
        if (this.owner.service.state.hasTag('knockDown')) {
          event.body.belongTo.knockDown()
          new Splash(event)
          if (this.owner.service.state.matches('jumpBash')) {
            event.body.velocity.y = -event.body.position.y * 10
          }
        } else {
          event.body.belongTo.hit()
          new Splash(event)
          // console.log(event.contact)
          // debugger

          // if (this.owner.service.state.matches('launch')) {
          if (this.owner.service.state.hasTag('canLaunch') && !event.body.belongTo.isAir) {
            // console.log(111)
            // event.body.velocity.y += 30
            // NOTE: Direct change position instead of velocity, to prevent friction between enemy herd cause not lift.
            gsap.to(event.body.position, {
              duration: 0.3,
              y: event.body.position.y + 3.7,
              onComplete: () => {
                // let posY = event.body.position.y
                // gsap.to(event.body.position, {
                //   duration: 0.3,
                //   y: posY,
                // })
                // event.body.velocity.y = 0 // Prevent too fast drop. Because cannonjs will accumulate drop velocity when direct change position.
                // event.body.velocity.y = 3.7
                event.body.velocity.y = 0
              },
            })
            event.body.belongTo.isAir = true // todo: refactor.
            // console.log('set isAir true')
          }
        }
      }
    }
    // }
  }
}

export { GreatSword }
