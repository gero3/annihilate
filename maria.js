class Maria {
  constructor(x, y, z) {
    let s = this

    this.isCharacter = true

    updates.push(this)

    s.health = 100
    s.oaction = {}
    s.mixer
    // s.speed = 0.15
    s.speed = 0.3
    s.attackSpeed = 1
    s._vec0 = new THREE.Vector3()

    // pseudo shadow
    // const geometry = new THREE.CircleGeometry(1.7, 32)
    // const material = new THREE.ShaderMaterial({
    //   transparent: true,
    //   vertexShader: `
    //     varying vec2 vUv;
    //     void main(){
    //       vUv = uv;
    //       gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1);
    //     }
    //   `,
    //   fragmentShader: `
    //     varying vec2 vUv;
    //     void main(){
    //       // gl_FragColor = vec4(0,0,0,(1.-length(vUv*2.-1.))*.5);
    //       gl_FragColor = vec4(0,0,0,smoothstep(.0,.9,1.-length(vUv*2.-1.))*.3);
    //     }
    //   `,
    // })
    // s.shadow = new THREE.Mesh(geometry, material) // pseudo shadow
    // s.shadow.rotation.x = -Math.PI / 2
    // s.shadow.position.y = 0.01
    // s.shadow.renderOrder = 1 // need same as position.y order of all pseudo shadows
    // scene.add(s.shadow)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState

    s.xstate = createMachine(
      {
        id: 'maria',
        context: {
          health: 100,
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
              run: { target: 'run' },
              attack: { target: 'attack' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              blocked: { target: 'blocked' },
            },
          },
          run: {
            entry: 'playRun',
            on: {
              stop: { target: 'idle' },
              attack: { target: 'attack' },
              jump: { target: 'jump' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              // blocked: { target: 'blocked' }, // Note: Can block when running or in other states? No, more by intended operation, less by luck.
            },
            tags: ['canMove'],
          },
          attack: {
            entry: 'playAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              attack: { target: 'prepareFist' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          prepareFist: {
            on: {
              finish: { target: 'fist' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          fist: {
            entry: 'playFist',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
              attack: { target: 'prepareStrike' },
            },
            tags: ['canDamage'],
          },
          prepareStrike: {
            on: {
              finish: { target: 'strike' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          strike: {
            // top down strike
            entry: 'playStrike',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
              dash: { target: 'dash' },
            },
            tags: ['canDamage'],
          },
          jumpAttack: {
            entry: ['playJumpAttack'],
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
            tags: ['canDamage'],
          },
          jump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              jump: { target: 'doubleJump' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          doubleJump: {
            entry: ['playJump', 'jump'],
            on: {
              land: { target: 'idle' },
              attack: { target: 'jumpAttack' },
              hit: { target: 'hit' },
              dash: { target: 'jumpDash' },
            },
            tags: ['canMove'],
          },
          hit: {
            entry: ['playHit'],
            on: {
              hit: { target: 'hit' },
              finish: { target: 'idle' },
            },
          },
          blocked: {
            entry: ['playBlocked'],
            on: {
              finish: { target: 'idle' },
            },
          },
          dash: {
            entry: 'entryDash',
            after: {
              300: { target: 'idle' },
            },
            on: {
              attack: { target: 'dashAttack' },
            },
          },
          dashAttack: {
            entry: 'playDashAttack',
            on: {
              finish: { target: 'idle' },
              hit: { target: 'hit' },
            },
            tags: ['canDamage'],
          },
          jumpDash: {
            entry: 'entryJumpDash',
            on: {
              land: { target: 'idle' },
            },
            exit: 'exitJumpDash',
          },
        },
      },
      {
        actions: {
          entryDash() {
            s.fadeToAction('dash')

            // s.body.mass = 0
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(60)
            s.body.velocity.x = s._vec0.x
            // s.body.velocity.y = 0
            s.body.velocity.z = s._vec0.z
          },
          entryJumpDash() {
            s.fadeToAction('dash', 0)
            // s.body.mass = 0
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(30)
            s.body.velocity.x = s._vec0.x
            // s.body.velocity.y = 0
            s.body.velocity.z = s._vec0.z
          },
          playIdle() {
            s.fadeToAction('idle')
          },
          playRun() {
            s.fadeToAction('running')
          },
          playAttack() {
            s.oaction['punch'].timeScale = s.attackSpeed
            s.fadeToAction('punch')
          },
          playDashAttack() {
            s.oaction['dashAttack'].timeScale = 2
            s.fadeToAction('dashAttack')

            setTimeout(() => {
              s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(70)
              s.body.velocity.x = s._vec0.x
              s.body.velocity.z = s._vec0.z
            }, 100)

            // let to = { t: 0 }
            // let _rotationY = s.gltf.scene.rotation.y
            // gsap.to(to, {
            //   duration: 0.5,
            //   t: -Math.PI * 2,
            //   onUpdate: () => {
            //     // console.log(to.t)
            //     s.gltf.scene.rotation.y = _rotationY + to.t
            //   },
            // })
          },
          playFist() {
            s.oaction['fist'].timeScale = s.attackSpeed
            s.fadeToAction('fist')
          },
          playStrike() {
            s.oaction['strike'].timeScale = s.attackSpeed
            s.fadeToAction('strike')
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(50)
            // console.log(s._vec0)

            // setTimeout(() => {
            //   s.body.velocity.x = s._vec0.x
            //   // s.body.velocity.y = 30
            //   s.body.velocity.z = s._vec0.z
            //   // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            //   // s.body.velocity.y -= downVelocity
            //   s.body.velocity.y = -s.body.position.y * 5
            // }, 500)
          },
          playJumpAttack(context, event, o) {
            s.oaction['jumpAttack'].timeScale = s.attackSpeed * 4
            s.fadeToAction('jumpAttack')
            s._vec0.set(0, 0, 1).applyEuler(s.gltf.scene.rotation).multiplyScalar(15)
            console.log(s._vec0)
            s.body.velocity.x = s._vec0.x
            s.body.velocity.y = 20
            s.body.velocity.z = s._vec0.z
            // let downVelocity=o.state.history.value === 'jump' ? 20 : o.state.history.value === 'doubleJump' ? 50 : 0
            setTimeout(() => {
              // s.body.velocity.y -= downVelocity
              s.body.velocity.y = -s.body.position.y * 5
            }, 200)
          },
          jump() {
            s.body.velocity.y = 20
          },
          playJump() {
            s.fadeToAction('jump')
          },
          playHit() {
            s.oaction['hit'].timeScale = 3
            s.fadeToAction('hit')
          },
          playBlocked() {
            s.fadeToAction('impact')
          },
        },
      }
    )

    // s.currentState
    s.xstateService = interpret(s.xstate).onTransition((state) => {
      // if (state.changed) console.log('maria: state:', state.value)
      // console.log(state)
      // if (state.changed) console.log(state)
      // s.currentState = state.value
      ///currentState === s.xstateService.state.value
    })

    // Start the service
    s.xstateService.start()
    // => 'pending'

    // s.xstateService.send( 'idle' )
    // => 'resolved'

    this.body_size = 1.6
    let physicsMaterial = new CANNON.Material({
      friction: 0,
    })
    s.body = new CANNON.Body({
      mass: 80,
      // material: physicsMaterial,
    })
    s.body.belongTo = this
    let shape = new CANNON.Sphere(this.body_size)
    // let shape = new CANNON.Cylinder(this.body_size, this.body_size, 3, 8)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
    s.body.angularDamping = 1
    s.body.addShape(shape)
    s.body.position.set(x, y, z) ///formal
    // s.body.position.set(10.135119435295582, -0.000010295802922222208, -14.125613840025014)///test
    world.addBody(s.body)
    s.body.addEventListener('collide', (event) => {
      // console.log('collide', event.body.id, event.target.id)
      // if (event.body === window.ground.body) {
      if (event.body !== window.greatSword.body) {
        ///todo: Is cannon.js has collision mask?
        // todo: refactor: window.ground
        s.xstateService.send('land')
      }
    })
  }

  update(dt) {
    let s = this
    if (s.xstateService.state.matches('loading')) return

    s.gltf.scene.position.set(s.body.position.x, s.body.position.y - this.body_size, s.body.position.z)
    // s.shadow.position.x = s.body.position.x
    // s.shadow.position.z = s.body.position.z
    s.mixer.update(dt)
  }

  hit() {
    let s = this
    // console.log('hit()')
    // s.health-=50
    // console.log(this.health)
    // if(s.health<=0){
    //   s.xstateService.send('dead')
    // }else{
    s.xstateService.send('hit')
    // }
  }

  load(callback) {
    let s = this
    return new Promise((resolve, reject) => {
      var loader = new THREE.GLTFLoader()
      loader.load(
        './model/maria/all.gltf',
        function (gltf) {
          console.log(gltf.animations)
          s.gltf = gltf

          s.swordDelegate = new THREE.Object3D()
          s.swordDelegate.position.x = -24
          s.swordDelegate.position.z = 50
          s.swordDelegate.rotation.y = -0.55
          s.swordBone = s.gltf.scene.getObjectByName('sword_joint')
          s.swordBone.add(s.swordDelegate)

          s.gltf.scene.traverse(function (child) {
            if (child.isMesh) {
              child.castShadow = true
              child.receiveShadow = true
              child.material = new THREE.MeshBasicMaterial()
              child.material.map = new THREE.TextureLoader().load('./model/maria/maria_diffuse.jpg')
              child.material.map.flipY = false
              child.material.skinning = true
            }
          })
          scene.add(s.gltf.scene)
          s.gltf.scene.scale.setScalar(2.7)
          // s.gltf.scene.scale.set(.7,.7,.7)
          // s.gltf.scene.position.set(x,y,z)
          s.mixer = new THREE.AnimationMixer(s.gltf.scene)
          s.gltf.animations.forEach((animation) => {
            // let name = animation.name.toLowerCase()
            let name = animation.name
            let action = s.mixer.clipAction(animation)
            s.oaction[name] = action

            // if (['jump', 'punch', 'fist', 'jumpattack', 'dodge', 'hit'].includes(name)) {
            // if ([].includes(name)) {
            //   action.loop = THREE.LoopOnce
            // }

            if (['punch', 'punch', 'fist', 'jumpAttack', 'strike', 'hit', 'impact', 'jump', 'dashAttack'].includes(name)) {
              action.loop = THREE.LoopOnce
              action.clampWhenFinished = true
            }
          })
          s.action_act = s.oaction.idle
          s.action_act.play()
          s.mixer.addEventListener('finished', (e) => {
            s.xstateService.send('finish')
          })
          s.xstateService.send('loaded')
          resolve()

          callback()
        },
        undefined,
        function (e) {
          console.error(e)
          reject()
        }
      )
    })
  }

  fadeToAction(name, duration = 0.1) {
    let s = this

    // previousAction = s.action_act;
    // activeAction = s.oaction[ name ];
    // if ( previousAction !== activeAction ) {
    //   previousAction.fadeOut( duration );
    // }
    // activeAction
    //   .reset()
    //   .setEffectiveTimeScale( 1 )
    //   .setEffectiveWeight( 1 )
    //   .fadeIn( duration )
    //   .play();

    let nextAction = s.oaction[name]

    if (1) {
      // fade
      nextAction.reset()
      // nextAction.stop()
      nextAction.play()
      // nextAction.enabled = true
      // nextAction.setEffectiveTimeScale(1)
      // nextAction.setEffectiveWeight(1)
      // nextAction.time = 0
      s.action_act.crossFadeTo(nextAction, duration)
      // Note: If action_act loopOnce, need crossFade before finished. Or clampWhenFinished.
      s.action_act = nextAction
    } else {
      // not fade
      s.action_act.stop()
      // s.action_act.paused = true
      nextAction.reset().play()
      s.action_act = nextAction
    }
  }
}

export { Maria }
