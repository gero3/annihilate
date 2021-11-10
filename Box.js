class Box {
  constructor() {
    let s = this
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()

    let size=1.5
    pos.set(-3, size/2 * gs, 0)
    quat.set(0, 0, 0, 1 * gs)

    s.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(size * gs, size * gs, size * gs), new THREE.MeshPhongMaterial({ color: 0x555555 /*depthWrite: false*/ }))
    // s.mesh.rotation.x = -Math.PI / 2
    s.mesh.position.copy(pos)
    scene.add(s.mesh)

    //ammo
    const margin = 0.04
    let mass = 0

    const shape = new Ammo.btBoxShape(new Ammo.btVector3(size/2 * gs, size/2 * gs, size/2 * gs))
    shape.setMargin(margin)

    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    transform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w))
    const motionState = new Ammo.btDefaultMotionState(transform)

    const localInertia = new Ammo.btVector3(0, 0, 0)
    shape.calculateLocalInertia(mass, localInertia)

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
    s.body = new Ammo.btRigidBody(rbInfo)
    s.body.name = 'box'

    // s.body.setFriction(4)
    s.body.setFriction(20)
    s.body.setRollingFriction(10)

    if (mass > 0) {
      // rigidBodies.push(threeObject)

      // // Disable deactivation
      s.body.setActivationState(4)
    }

    s.body.onCollide = (event) => {}

    world.addRigidBody(s.body)

    //cannon
    // let shape=new CANNON.Plane()
    // s.body=new CANNON.Body({
    //   mass: 0,
    //   collisionResponse: 0,
    // })
    // s.body.addShape(shape)
    // s.body.position.set(0,0,0)
    // s.body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2);
    // // s.body.addEventListener("collide", function (event) {
    // //   console.log('collide floor')
    // // })
    // world.addBody(s.body)
  }
}