import { Area1 } from "./Area1";
import { Area2 } from "./Area2";
import { Area3 } from "./Area3";
import { Area4 } from "./Area4";
import { Area5 } from "./Area5";
import { Area6 } from "./Area6";

/**
 * Manages all 6 area environments, activating/deactivating as player progresses.
 */
export class AreaManager {
  constructor(scene) {
    this.scene = scene;
    this.areas = [
      new Area1(scene),
      new Area2(scene),
      new Area3(scene),
      new Area4(scene),
      new Area5(scene),
      new Area6(scene),
    ];

    this.activeAreas = new Set();
    this.visibleAreas = new Set();
  }

  activateArea(index) {
    if (index >= 0 && index < 6 && !this.activeAreas.has(index)) {
      this.areas[index].activate();
      this.activeAreas.add(index);
      this.visibleAreas.add(index);
    }
  }

  _hideArea(index) {
    if (this.visibleAreas.has(index)) {
      this.scene.remove(this.areas[index].group);
      this.visibleAreas.delete(index);
    }
  }

  _showArea(index) {
    if (this.activeAreas.has(index) && !this.visibleAreas.has(index)) {
      this.scene.add(this.areas[index].group);
      this.visibleAreas.add(index);
    }
  }

  update(elapsed, delta, progress) {
    const currentArea = Math.min(Math.floor(progress * 6), 5);
    const localProgress = (progress * 6) - currentArea;

    for (let i = Math.max(0, currentArea); i <= Math.min(5, currentArea + 1); i++) {
      this.activateArea(i);
    }

    for (const idx of this.activeAreas) {
      if (idx >= currentArea - 1 && idx <= currentArea + 1) {
        this._showArea(idx);
      } else {
        this._hideArea(idx);
      }
    }

    for (const idx of this.visibleAreas) {
      this.areas[idx].update(elapsed, delta, localProgress, currentArea === idx);
    }
  }
}
