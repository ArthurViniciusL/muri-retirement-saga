import Phaser from 'phaser';
import { PauseButton } from '@/ui/PauseButton';
import { VirtualControls } from '@/ui/VirtualControls';

export interface Intents {
  left: boolean;
  right: boolean;
  crouch: boolean;
  jump: boolean;
  defend: boolean;
  jumpPressed: boolean;
  jumpReleased: boolean;
  meleePressed: boolean;
  rangedPressed: boolean;
  pausePressed: boolean;
}

const ACTIONS = ['left', 'right', 'crouch', 'jump', 'melee', 'ranged', 'defend', 'pause'] as const;
type Action = (typeof ACTIONS)[number];

const { KeyCodes } = Phaser.Input.Keyboard;

const KEYS: Record<Action, readonly number[]> = {
  left: [KeyCodes.A],
  right: [KeyCodes.D],
  crouch: [KeyCodes.S],
  jump: [KeyCodes.W, KeyCodes.SPACE],
  melee: [KeyCodes.J],
  ranged: [KeyCodes.K],
  defend: [KeyCodes.L],
  pause: [KeyCodes.ESC, KeyCodes.P],
};

export class InputController {
  private readonly keys = new Map<Action, Phaser.Input.Keyboard.Key[]>();
  private readonly keyPresses = new Set<Action>();
  private readonly controls: VirtualControls;
  private readonly pauseButton: PauseButton;
  private pausePending = false;
  private jumpWasHeld = false;

  public constructor(scene: Phaser.Scene) {
    this.controls = new VirtualControls(scene);
    this.pauseButton = new PauseButton(scene, () => {
      this.pausePending = true;
    });

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
      keyboard.on(Phaser.Input.Keyboard.Events.ANY_KEY_DOWN, () => this.controls.hide());
    }

    scene.events.on(Phaser.Scenes.Events.RESUME, this.reset, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.RESUME, this.reset, this));
  }

  public read(): Intents {
    const jump = this.held('jump');
    const intents: Intents = {
      left: this.held('left'),
      right: this.held('right'),
      crouch: this.held('crouch'),
      jump,
      defend: this.held('defend'),
      jumpPressed: this.pressed('jump'),
      jumpReleased: this.jumpWasHeld && !jump,
      meleePressed: this.pressed('melee'),
      rangedPressed: this.pressed('ranged'),
      pausePressed: this.keyPresses.delete('pause') || this.pausePending,
    };
    this.pausePending = false;
    this.jumpWasHeld = jump;
    return intents;
  }

  public layout(): void {
    this.controls.layout();
    this.pauseButton.layout();
  }

  public reset(): void {
    for (const keys of this.keys.values()) {
      keys.forEach((key) => key.reset());
    }
    this.keyPresses.clear();
    this.controls.releaseAll();
    this.pausePending = false;
    this.jumpWasHeld = false;
  }

  private held(action: Exclude<Action, 'pause'>): boolean {
    const keyHeld = this.keys.get(action)?.some((key) => key.isDown) ?? false;
    return keyHeld || this.touchHeld(action);
  }

  private pressed(action: 'jump' | 'melee' | 'ranged'): boolean {
    const byKey = this.keyPresses.delete(action);
    const byTouch = this.controls.consumePressed(action);
    return byKey || byTouch;
  }

  private touchHeld(action: Exclude<Action, 'pause'>): boolean {
    return this.controls.isHeld(action === 'crouch' ? 'down' : action);
  }
}
