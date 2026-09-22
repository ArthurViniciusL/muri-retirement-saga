import Phaser from 'phaser';
import { VirtualControls } from '@/ui/VirtualControls';

export interface Intents {
  left: boolean;
  right: boolean;
  crouch: boolean;
  jump: boolean;
  jumpPressed: boolean;
  jumpReleased: boolean;
}

const ACTIONS = ['left', 'right', 'crouch', 'jump'] as const;
type Action = (typeof ACTIONS)[number];

const { KeyCodes } = Phaser.Input.Keyboard;

const KEYS: Record<Action, readonly number[]> = {
  left: [KeyCodes.A, KeyCodes.LEFT],
  right: [KeyCodes.D, KeyCodes.RIGHT],
  crouch: [KeyCodes.S, KeyCodes.DOWN],
  jump: [KeyCodes.W, KeyCodes.UP, KeyCodes.SPACE],
};

export class InputController {
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly keyPresses = new Set<Action>();
  private readonly controls: VirtualControls;
  private jumpWasHeld = false;

  public constructor(scene: Phaser.Scene) {
    this.controls = new VirtualControls(scene);

    const keyboard = scene.input.keyboard;
    if (keyboard) {
      for (const action of ACTIONS) {
        const keys = KEYS[action].map((code) => {
          const key = keyboard.addKey(code, true);
          key.on(Phaser.Input.Keyboard.Events.DOWN, () => this.keyPresses.add(action));
          return key;
        });
        this.keys.set(action, keys);
      }
    }
  }

  public read(): Intents {
    const jump = this.held('jump');
    const intents: Intents = {
      left: this.held('left'),
      right: this.held('right'),
      crouch: this.held('crouch'),
      jump,
      jumpPressed: this.keyPresses.delete('jump') || this.controls.consumePressed('jump'),
      jumpReleased: this.jumpWasHeld && !jump,
    };
    this.jumpWasHeld = jump;
    return intents;
  }

  public layout(): void {
    this.controls.layout();
  }

  public reset(): void {
    for (const keys of this.keys.values()) {
      keys.forEach((key) => key.reset());
    }
    this.keyPresses.clear();
    this.controls.releaseAll();
    this.jumpWasHeld = false;
  }

  private held(action: Action): boolean {
    const byKey = this.keys.get(action)?.some((key) => key.isDown) ?? false;
    return byKey || this.controls.isHeld(action === 'crouch' ? 'down' : action);
  }
}
