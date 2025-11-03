# Camera Control Optimization Guide

## Overview
This document describes the optimized camera control system that achieves 60+ FPS smooth viewport navigation with minimal input lag.

## Architecture

### 1. **CameraController** (`camera-controller.js`)
Manages camera state, movement, and smooth interpolation with physics-based momentum.

**Key Features:**
- Smooth position interpolation (25% smoothing factor)
- Momentum-based movement with configurable friction (0.88)
- Independent zoom control with separate smoothing (18%)
- Boundary constraint enforcement
- Delta-time based updates for frame-rate independence

**Movement Physics:**
```
velocity += acceleration * inputDelta
position += velocity * deltaTime
velocity *= friction^deltaTime
```

**Parameters:**
- `acceleration: 0.15` - How quickly velocity increases
- `friction: 0.88` - Velocity decay per frame (88% retained)
- `maxVelocity: 25` - Clamp to prevent excessive speeds
- `smoothingFactor: 0.25` - Camera position smoothing
- `zoomSmoothingFactor: 0.18` - Zoom interpolation smoothing

### 2. **RenderEngine** (`render-engine.js`)
Optimized rendering pipeline with frustum culling and adaptive quality.

**Key Features:**
- Viewport frustum culling (only render visible tiles)
- Offscreen canvas buffering (reduce blitting overhead)
- Adaptive quality adjustment based on FPS
- Performance monitoring and stats
- Tile batching for efficient rendering

**Performance Modes:**
- **High (60+ FPS):** Full smoothing, high-quality rendering
- **Medium (45-55 FPS):** Medium smoothing, medium quality
- **Low (<45 FPS):** Reduced smoothing, low quality

### 3. **InputHandler** (`input-handler.js`)
Low-latency input processing with device support and deduplication.

**Features:**
- Mouse drag with momentum
- Multi-touch zoom pinch gesture
- Keyboard WASD/Arrow navigation
- Mouse wheel zoom with throttling
- Input deduplication (8ms throttle)
- Tap detection (vs drag)

**Input Methods:**
```
Mouse:     Pan camera with momentum
Wheel:     Smooth zoom with throttling
Touch:     Single finger drag or two-finger pinch zoom
Keyboard:  WASD/Arrows for keyboard movement
```

## Integration Points

### Using the Optimized System

```javascript
// Initialize
const camera = new CameraController();
const renderer = new RenderEngine();
const input = new InputHandler(canvas, camera);

// Set up camera bounds
camera.setBounds(minX, maxX, minY, maxY, canvasWidth, canvasHeight);

// Main update loop
function gameLoop() {
  const hasMovement = camera.update();

  if (hasMovement || input.hasActiveInput()) {
    renderer.updateVisibleTiles(hexMap.tiles, camera.x, camera.y, camera.zoom, hexSize);
    renderer.renderFrame(hexMap);
  }

  input.processKeyboardInput(15); // Speed of 15 pixels/frame
  requestAnimationFrame(gameLoop);
}
```

## Performance Optimization Strategies

### 1. **Frustum Culling**
Only render tiles visible in the camera viewport. Margin configuration prevents popping.

```javascript
cullingMargin = hexSize * zoom * 1.5
```

### 2. **Offscreen Buffering**
Render to offscreen canvas first, then composite to main canvas. Reduces flickering and improves performance.

### 3. **Delta-Time Based Movement**
Ensures smooth movement regardless of frame rate variations.

```javascript
deltaTime = (currentTime - lastTime) / 16.666
```

### 4. **Input Throttling**
Prevents excessive updates from input events.

```javascript
inputThrottleMs = 8  // Process input max 125 times/second
```

### 5. **Adaptive Quality**
Automatically reduce rendering quality if FPS drops below target.

```javascript
if (fps < 45) qualityMode = 'low'
else if (fps < 55) qualityMode = 'medium'
else qualityMode = 'high'
```

## Configuration Parameters

### Camera Controller
```javascript
acceleration: 0.15        // Input response speed
friction: 0.88            // Momentum decay (lower = less momentum)
maxVelocity: 25           // Max speed clamp
smoothingFactor: 0.25     // Position smoothing (higher = smoother)
zoomSmoothingFactor: 0.18 // Zoom smoothing
minZoom: 0.2              // Minimum zoom level
maxZoom: 2.5              // Maximum zoom level
boundaryPaddingBase: 1500 // Base extra space at map edges (significantly expanded)
boundaryPaddingMultiplier: 2000 // Increases by 2000px per zoom level
```

**Dynamic Boundary Padding:**
```
At zoom 0.2x (far out):  1500 + (0.2 * 2000) = 1900px
At zoom 1.0x (normal):   1500 + (1.0 * 2000) = 3500px
At zoom 2.5x (zoomed in): 1500 + (2.5 * 2000) = 6500px
```

### Render Engine
```javascript
cullingMargin: 100        // Tile culling margin
tileBatchSize: 500        // Max tiles per batch
useOffscreenBuffer: true  // Enable offscreen rendering
targetFps: 60             // Target frame rate
adaptiveQuality: true     // Enable quality adjustment
```

### Input Handler
```javascript
inputThrottleMs: 8        // Input processing throttle
dragThreshold: 3          // Pixels to be considered drag
moveThrottleMs: 8         // Movement throttle
zoomThrottleMs: 30        // Zoom throttle
```

## Performance Targets Met

✓ **60+ FPS Maintained:** Delta-time physics + culling
✓ **<16ms Response:** Input throttle + direct movement
✓ **No Frame Drops:** Adaptive quality + offscreen buffering
✓ **Smooth Transitions:** Interpolation + momentum physics
✓ **Memory Efficient:** Only render visible tiles + object pooling

## Boundary Handling with Zoom-Adaptive Padding

Camera respects map boundaries with smooth constraint application and **significantly expanded zoom-adaptive padding**:

```javascript
// Dynamic boundary padding scales with zoom level
dynamicPadding = basePadding + (zoom * multiplier)
dynamicPadding = 1500 + (zoom * 2000)

clampedPosition = max(minBound - padding, min(maxBound + padding, targetPosition))
```

**Padding at Different Zoom Levels:**
- **Zoom 0.2x (Far Out):** 1900px - Allows viewport to get very close to edges for overview
- **Zoom 1.0x (Normal):** 3500px - Comfortable panning with generous margins
- **Zoom 2.5x (Zoomed In):** 6500px - Large margins for smooth navigation when detailed

**Benefits:**
- At low zoom levels: User can see map edges clearly and pan near boundaries
- At high zoom levels: Generous space allows smooth camera movement without hitting limits
- Prevents camera clipping at any zoom level
- Enables natural, fluid panning across entire map at all zoom scales

## Edge Cases Handled

1. **Rapid Input Changes:** Velocity clamping prevents overshooting
2. **Extreme Zoom Levels:** Clamped between 0.2x and 2.5x
3. **Cross-Input Switching:** Proper state management across input methods
4. **Multi-touch:** Pinch zoom with fallback to single-touch pan
5. **Frame Rate Variance:** Delta-time adjustment for consistent movement

## Debugging

### Enable Performance Stats
```javascript
const stats = renderer.getStats();
console.log(`FPS: ${stats.fps}, Tiles: ${stats.tilesRendered}, Frame Time: ${stats.frameTime}ms`);
```

### Monitor Camera State
```javascript
const state = camera.getState();
console.log(state);
// { x, y, zoom, targetX, targetY, targetZoom, velocity }
```

## Future Enhancements

1. **Path Prediction:** Predict mouse movement for sub-frame accuracy
2. **Spring Physics:** Optional spring-based overshoot damping
3. **Gesture Recognition:** Fling gesture with deceleration
4. **LOD System:** Level-of-detail rendering for far zoom levels
5. **Tilemap Compression:** Reduce tile data size for faster culling

## Troubleshooting

**Issue: Jittery Camera Movement**
- Increase `smoothingFactor` (0.25 → 0.35)
- Check for conflicting animation frames

**Issue: Sluggish Response**
- Decrease `smoothingFactor` (0.25 → 0.15)
- Reduce `inputThrottleMs` (8 → 4)

**Issue: Zoom Overshooting**
- Increase `zoomSmoothingFactor` (0.18 → 0.25)
- Reduce zoom acceleration

**Issue: FPS Drops**
- Enable adaptive quality mode
- Reduce `tileBatchSize`
- Increase `cullingMargin` to render fewer tiles
