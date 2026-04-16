import { generateThreeJSLogic } from './threeJSLogic';

export const generateCityHTML = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>ShopVerse City 3D</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    body {
      overflow: hidden;
      font-family: 'Segoe UI', 'Poppins', system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    /* Canvas Container */
    #canvas-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* Loading Screen */
    #loader {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(10px);
    }

    #loader.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .loader-content {
      text-align: center;
      animation: fadeInUp 0.6s ease-out;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .loader-spinner {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      border: 4px solid rgba(108, 99, 255, 0.1);
      border-top-color: #6c63ff;
      border-right-color: #a855f7;
      border-radius: 50%;
      animation: spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loader-title {
      font-size: 2rem;
      font-weight: 800;
      background: linear-gradient(135deg, #fff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }

    .loader-subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      letter-spacing: 2px;
    }

    .loader-progress {
      width: 200px;
      height: 3px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      margin: 20px auto 0;
      overflow: hidden;
    }

    .loader-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6c63ff, #a855f7);
      width: 0%;
      transition: width 0.3s ease;
    }

    /* Top Bar */
    #top-bar {
      position: fixed;
      top: 50px;
      left: 20px;
      right: 20px;
      height: 60px;
      background: rgba(15, 15, 30, 0.85);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      z-index: 100;
      border: 1px solid rgba(108, 99, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      font-size: 28px;
      filter: drop-shadow(0 2px 5px rgba(108, 99, 255, 0.3));
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    .logo-text {
      font-size: 18px;
      font-weight: 700;
      color: white;
    }

    .logo-text span {
      background: linear-gradient(135deg, #6c63ff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    #follow-btn {
      padding: 8px 20px;
      background: rgba(108, 99, 255, 0.2);
      border: 1.5px solid rgba(108, 99, 255, 0.5);
      border-radius: 30px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    #follow-btn:hover {
      background: rgba(108, 99, 255, 0.4);
      transform: scale(1.05);
    }

    #follow-btn.active {
      background: linear-gradient(135deg, #6c63ff, #a855f7);
      border-color: transparent;
      box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
    }

    /* Shop Panel */
    #shop-panel {
      position: fixed;
      top: 100px;
      right: -320px;
      width: 300px;
      background: rgba(20, 20, 40, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      z-index: 200;
      transition: right 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      border: 1px solid rgba(108, 99, 255, 0.3);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    #shop-panel.visible {
      right: 20px;
    }

    #shop-panel-close {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 30px;
      height: 30px;
      border-radius: 15px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    #shop-panel-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    #shop-panel-header {
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    #shop-icon-badge {
      width: 60px;
      height: 60px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      background: linear-gradient(135deg, #6c63ff, #a855f7);
    }

    #shop-panel-name {
      font-size: 20px;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    #shop-panel-type {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
    }

    #shop-panel-body {
      padding: 20px;
    }

    .shop-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    #shop-panel-rating {
      color: #ffc107;
      font-size: 14px;
      letter-spacing: 2px;
    }

    #shop-panel-price {
      font-size: 18px;
      font-weight: 700;
      background: linear-gradient(135deg, #6c63ff, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    #shop-panel-desc {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.5;
      margin-bottom: 15px;
    }

    #shop-panel-tags {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }

    .shop-tag {
      padding: 4px 12px;
      background: rgba(108, 99, 255, 0.2);
      border-radius: 12px;
      font-size: 11px;
      color: #a89cff;
    }

    #shop-visit-btn {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #6c63ff, #a855f7);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    #shop-visit-btn:active {
      transform: scale(0.98);
    }

    /* Tooltip */
    #hover-tooltip {
      position: fixed;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(10px);
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 500;
      z-index: 150;
      pointer-events: none;
      white-space: nowrap;
      border: 1px solid rgba(108, 99, 255, 0.5);
      transition: opacity 0.2s;
    }

    #hover-tooltip::before {
      content: '';
      position: absolute;
      top: -6px;
      left: 20px;
      width: 12px;
      height: 12px;
      background: rgba(0, 0, 0, 0.9);
      transform: rotate(45deg);
      border-left: 1px solid rgba(108, 99, 255, 0.5);
      border-top: 1px solid rgba(108, 99, 255, 0.5);
    }

    /* Shop Counter */
    #shop-count-badge {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 8px 16px;
      background: rgba(15, 15, 30, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      font-size: 12px;
      color: white;
      z-index: 100;
      border: 1px solid rgba(108, 99, 255, 0.3);
    }

    #visible-count {
      font-weight: 700;
      color: #6c63ff;
      font-size: 16px;
    }

    /* Virtual Joystick */
    #joystick-container {
      position: fixed;
      bottom: 30px;
      left: 30px;
      z-index: 100;
    }

    .joystick-base {
      width: 140px;
      height: 140px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(108, 99, 255, 0.4);
      border-radius: 70px;
      position: relative;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }

    .joystick-base:active {
      transform: scale(0.95);
    }

    .joystick-knob {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #6c63ff, #a855f7);
      border-radius: 30px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(108, 99, 255, 0.4);
      transition: transform 0.05s linear;
    }

    /* Zoom Controls */
    #zoom-controls {
      position: fixed;
      bottom: 30px;
      right: 30px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      z-index: 100;
    }

    .zoom-btn {
      width: 50px;
      height: 50px;
      background: rgba(15, 15, 30, 0.85);
      backdrop-filter: blur(10px);
      border: 1.5px solid rgba(108, 99, 255, 0.4);
      border-radius: 25px;
      color: white;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .zoom-btn:active {
      transform: scale(0.9);
      background: rgba(108, 99, 255, 0.5);
    }

    /* Mini Map */
    #minimap {
      position: fixed;
      top: 100px;
      left: 20px;
      width: 150px;
      height: 150px;
      background: rgba(15, 15, 30, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      border: 1px solid rgba(108, 99, 255, 0.3);
      z-index: 100;
      overflow: hidden;
    }

    #minimap-canvas {
      width: 100%;
      height: 100%;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .logo-text { font-size: 14px; }
      .logo-icon { font-size: 22px; }
      #follow-btn { padding: 6px 16px; font-size: 11px; }
      .joystick-base { width: 110px; height: 110px; }
      .joystick-knob { width: 45px; height: 45px; }
      .zoom-btn { width: 45px; height: 45px; font-size: 20px; }
      #shop-panel { width: 280px; }
      #minimap { width: 120px; height: 120px; top: 90px; }
    }
  </style>
</head>
<body>
  <div id="canvas-container"></div>
  
  <div id="loader">
    <div class="loader-content">
      <div class="loader-spinner"></div>
      <div class="loader-title">ShopVerse City</div>
      <div class="loader-subtitle">Loading 3D World...</div>
      <div class="loader-progress">
        <div class="loader-progress-bar" id="loader-progress-bar"></div>
      </div>
    </div>
  </div>
  
  <div id="top-bar">
    <div class="logo">
      <div class="logo-icon">🏙️</div>
      <div class="logo-text">ShopVerse <span>City</span></div>
    </div>
    <button id="follow-btn">🎮 Follow Me</button>
  </div>
  
  <div id="minimap">
    <canvas id="minimap-canvas" width="150" height="150"></canvas>
  </div>
  
  <div id="shop-panel">
    <button id="shop-panel-close">✕</button>
    <div id="shop-panel-header">
      <div id="shop-icon-badge"></div>
      <div>
        <div id="shop-panel-name"></div>
        <div id="shop-panel-type"></div>
      </div>
    </div>
    <div id="shop-panel-body">
      <div class="shop-meta-row">
        <span id="shop-panel-rating"></span>
        <span id="shop-panel-price"></span>
      </div>
      <p id="shop-panel-desc"></p>
      <div id="shop-panel-tags"></div>
      <button id="shop-visit-btn">✨ Visit Shop</button>
    </div>
  </div>
  
  <div id="hover-tooltip"></div>
  
  <div id="shop-count-badge">
    🏪 <span id="visible-count">0</span> Shops
  </div>
  
  <div id="joystick-container">
    <div class="joystick-base" id="joystick-base">
      <div class="joystick-knob" id="joystick-knob"></div>
    </div>
  </div>
  
  <div id="zoom-controls">
    <button class="zoom-btn" id="zoom-in">+</button>
    <button class="zoom-btn" id="zoom-out">−</button>
  </div>

  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.128.0/build/three.module.js"
      }
    }
  </script>
  <script type="module">
    import * as THREE from 'three';
    window.THREE = THREE;

    ${generateThreeJSLogic()}
  </script>
</body>
</html>`;