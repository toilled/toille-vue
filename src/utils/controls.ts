export interface ControlsState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}

export function handleControlsKeyDown(controls: ControlsState, event: KeyboardEvent) {
  switch (event.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      controls.forward = true;
      break;
    case 's':
    case 'arrowdown':
      controls.backward = true;
      break;
    case 'a':
    case 'arrowleft':
      controls.left = true;
      break;
    case 'd':
    case 'arrowright':
      controls.right = true;
      break;
  }
}

export function handleControlsKeyUp(controls: ControlsState, event: KeyboardEvent) {
  switch (event.key.toLowerCase()) {
    case 'w':
    case 'arrowup':
      controls.forward = false;
      break;
    case 's':
    case 'arrowdown':
      controls.backward = false;
      break;
    case 'a':
    case 'arrowleft':
      controls.left = false;
      break;
    case 'd':
    case 'arrowright':
      controls.right = false;
      break;
  }
}
