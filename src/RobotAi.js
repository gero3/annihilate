import { g } from './global.js'
import * as THREE from '../lib/three.js/build/three.module.js'
import { Ai } from './Ai.js'

class RobotAi extends Ai {
  constructor(character, distance = 1) {
    super(character, distance)

    const { createMachine, actions, interpret, assign } = XState // global variable: window.XState
    this.fsm = createMachine(
      {
        id: 'robot',
        context: {
          health: 100,
          // health: Infinity,
        },
        initial: 'canAttack',
        states: {
          canAttack: {
            on: {
              attack: { target: 'cantAttack', actions: 'attack' },
            },
          },
          cantAttack: {
            after: {
              3000: { target: 'canAttack' },
            },
          },
        },
      },
      {
        actions: {
          attack: () => {
            this.character.service.send('attack')
          },
        },
      }
    )

    this.service = interpret(this.fsm).onTransition((state) => {
      // if (state.changed) console.log('robotAi: state:', state.value)
    })

    this.service.start()
  }

  attack() {
    this.service.send('attack')
  }
}

export { RobotAi }