import { create } from 'zustand';
import { AvatarState, JoystickState, AvatarCustomization } from '../types';

interface AvatarStore extends AvatarState {
  setPosition: (position: [number, number, number]) => void;
  setRotation: (rotation: number) => void;
  setIsMoving: (isMoving: boolean) => void;
  setDirection: (direction: AvatarState['direction']) => void;
  updateDirection: (key: keyof AvatarState['direction'], value: boolean) => void;
}

interface AvatarCustomizationStore extends AvatarCustomization {
  setAvatarColor: (color: string) => void;
  setAvatarUrl: (url: string) => void;
}

interface JoystickStore extends JoystickState {
  setActive: (active: boolean) => void;
  setAngle: (angle: number) => void;
  setForce: (force: number) => void;
  setPosition: (position: { x: number; y: number }) => void;
  reset: () => void;
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  position: [0, 0, 0],
  rotation: 0,
  isMoving: false,
  direction: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },

  setPosition: (position) => set({ position }),
  setRotation: (rotation) => set({ rotation }),
  setIsMoving: (isMoving) => set({ isMoving }),
  setDirection: (direction) => set({ direction }),
  updateDirection: (key, value) =>
    set((state) => ({
      direction: { ...state.direction, [key]: value },
    })),
}));

export const useJoystickStore = create<JoystickStore>((set) => ({
  active: false,
  angle: 0,
  force: 0,
  position: { x: 0, y: 0 },

  setActive: (active) => set({ active }),
  setAngle: (angle) => set({ angle }),
  setForce: (force) => set({ force }),
  setPosition: (position) => set({ position }),
  reset: () => set({ active: false, angle: 0, force: 0, position: { x: 0, y: 0 } }),
}));

export const useAvatarCustomizationStore = create<AvatarCustomizationStore>((set) => ({
  color: '#6C5CE7',
  avatarUrl: '',

  setAvatarColor: (color) => set({ color }),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}));