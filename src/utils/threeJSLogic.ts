import { InputManagerStr } from '../engine/InputManager';
import { PhysicsControllerStr } from '../engine/PhysicsController';
import { CameraControllerStr } from '../engine/CameraController';
import { AvatarSystemStr } from '../engine/AvatarSystem';
import { ShopManagerStr } from '../engine/ShopManager';
import { EnvironmentManagerStr } from '../engine/EnvironmentManager';
import { EngineCoreStr } from '../engine/EngineCore';

export const generateThreeJSLogic = () => `
  // --- ShopVerse OS Modular Controllers ---
  ${InputManagerStr}
  ${PhysicsControllerStr}
  ${CameraControllerStr}
  ${AvatarSystemStr}
  ${ShopManagerStr}
  ${EnvironmentManagerStr}
  ${EngineCoreStr}

  // --- Bootloader ---
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    if (msg.includes("ResizeObserver")) return false; // Ignore harmless warnings
    var errText = 'WebView Error: ' + msg + ' at line ' + lineNo;
    var sub = document.querySelector('.loader-subtitle');
    if (sub) sub.innerHTML = '<span style="color:red">' + errText + '</span>';
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', error: errText }));
    }
    return false;
  };

  // Launch Engine
  const engine = new EngineCore();
  engine.init();
`;