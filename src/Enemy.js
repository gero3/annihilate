import { g } from './global.js'

import * as THREE from '../lib/three.js/build/three.module.js'
import { Attacker } from './Attacker.js'
import { GLTFLoader } from '../lib/three.js/examples/jsm/loaders/GLTFLoader.js'
class Enemy {
  constructor(x, y, z) {
    this.isCharacter = true
    this.isEnemy = true

    updates.push(this)

    // this.health = 100
    this.oaction = {}
    this.mixer

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    this.fsm = createMachine(
      {
        id: 'enemy',
        context: {
          health: 100,
          // health: Infinity,
        },
        initial: 'loading',
        states: {
          loading: {
            on: {
              loaded: { target: 'idle' },
            },
          },
          idle: {
            entry: 'playIdle',
            on: {
              attack: { target: 'attack' },
              hit: { target: 'hit' },
            },
          },
          attack: {
            entry: 'playAttack',
            on: {
              idle: {
                target: 'idle',
                actions: 'throwAttacker',
              },
              hit: { target: 'hit' },
            },
          },
          hit: {
            entry: ['decreaseHealth', 'playHit'],
            always: [{ target: 'dead', actions: 'dead', cond: 'isDead' }],
            on: {
              idle: { target: 'idle' },
              hit: { target: 'hit' },
            },
          },
          dead: {
            type: 'final',
          },
        },
      },
      {
        actions: {
          decreaseHealth: assign({ health: (context, event) => context.health - 35 }),

          playIdle: () => {
            this.fadeToAction('idle', 0.2)
          },
          playAttack: () => {
            this.fadeToAction('dance', 0.2)
          },
          playHit: () => {
            this.fadeToAction('jump', 0.2)
          },
          throwAttacker: () => {
            if (window.role.gltf && this.gltf) new Attacker(scene, updates, this, window.role.mesh.position)
          },
          dead: () => {
            this.fadeToAction('death', 0.2)
            this.body.collisionFilterMask = g.GROUP_SCENE
            setTimeout(() => {
              this.body.velocity.set(0, 0, 0)
            }, 0)

            // let interval
            // setTimeout(() => {
            //   interval = setInterval(() => {
            //     // this.mesh.position.y-=.001
            //     this.body.velocity.set(0, 0, 0) // continuously clear velocity, otherwise may not cleared.
            //     this.body.collisionResponse = false
            //     this.body.position.y -= 0.0005
            //     // console.log('interval')
            //     setTimeout(() => {
            //       clearInterval(interval)
            //       // },5000)
            //     }, 2000)
            //   })
            // }, 2000)
          },
        },
        guards: {
          isDead(context) {
            return context.health <= 0
          },
        },
      }
    )

    // this.currentState
    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('enemy: state:', state.value)
      // if (state.changed) console.log(state.value,state)
      // this.currentState = state.value
      ///currentState === this.service.state.value
    })

    // Start the service
    this.service.start()
    // => 'pending'

    // this.service.send( 'idle' )
    // => 'resolved'

    this.mass = 50
    this.bodySize = 1.6
    this.body = new CANNON.Body({
      mass: this.mass,
      collisionFilterGroup: g.GROUP_ENEMY,
      collisionFilterMask: g.GROUP_SCENE | g.GROUP_ROLE | g.GROUP_ENEMY | g.GROUP_ROLE_WEAPON,
    })
    this.body.belongTo = this
    let shape = new CANNON.Sphere(this.bodySize)
    // let shape = new CANNON.Cylinder(this.bodySize, this.bodySize, 3, 8)
    // let shape = new CANNON.Cylinder(this.bodySize, this.bodySize, 5, 8)
    // this.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    this.body.angularDamping = 1
    this.body.addShape(shape)
    this.body.position.set(x, y, z)
    world.addBody(this.body)

    setInterval(() => {
      this.service.send('attack')
    }, 3000)
  }

  update(dt) {
    if (this.service.state.value === 'loading') return
    this.mixer.update(dt)
    this.mesh.position.set(this.body.position.x, this.body.position.y - this.bodySize, this.body.position.z)
    // this.shadow.position.x = this.body.position.x
    // this.shadow.position.z = this.body.position.z

    if (!role.gltf) return
    if (this.service.state.value !== 'dead') {
      {
        // look at role
        let vec2_diff = vec2(role.mesh.position.x - this.mesh.position.x, role.mesh.position.z - this.mesh.position.z)
        let angle = vec2_diff.angle()
        // console.log(angle)
        this.mesh.rotation.y = -angle + Math.PI / 2
      }
    }
  }

  hit() {
    // console.log('hit function')
    this.service.send('hit')
  }

  knockDown() {
    this.hit()
  }

  load() {
    return new Promise((resolve, reject) => {
      var loader = new GLTFLoader()
      loader.load(
        './model/RobotExpressive/RobotExpressive.glb',
        (gltf) => {
          // console.log('enemy loaded')
          // console.log(gltf)
          this.gltf = gltf
          this.mesh = this.gltf.scene

          this.mesh.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
            }
          })

          window.scene.add(this.mesh)
          this.mesh.scale.set(0.7, 0.7, 0.7)
          // mesh.position.set(x,y,z)
          this.mixer = new THREE.AnimationMixer(this.mesh)
          gltf.animations.forEach((animation) => {
            let name = animation.name.toLowerCase()
            let action = this.mixer.clipAction(animation)
            this.oaction[name] = action
            if (['jump', 'punch', 'dance'].includes(name)) {
              action.loop = THREE.LoopOnce
            }
            if (['death'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
            this.oaction.dance.timeScale = 3
          })
          this.action_act = this.oaction.idle
          this.action_act.play()
          this.mixer.addEventListener('finished', (e) => {
            // console.log('finished')
            this.service.send('idle')
          })
          this.service.send('loaded')
          resolve()
        },
        undefined,
        (e) => {
          console.error(e)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration) {
    // console.log(name)
    // previousAction = this.action_act;
    // activeAction = this.oaction[ name ];

    // if ( previousAction !== activeAction ) {
    //   previousAction.fadeOut( duration );
    // }

    // activeAction
    //   .reset()
    //   .setEffectiveTimeScale( 1 )
    //   .setEffectiveWeight( 1 )
    //   .fadeIn( duration )
    //   .play();

    this.action_act.stop()
    this.oaction[name].reset().play()
    this.action_act = this.oaction[name]
  }
}

export { Enemy }