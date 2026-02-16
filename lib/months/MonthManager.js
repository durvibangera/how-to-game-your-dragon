import { Month1 } from "./Month1";
import { Month2 } from "./Month2";
import { Month3 } from "./Month3";
import { Month4 } from "./Month4";
import { Month5 } from "./Month5";
import { Month6 } from "./Month6";

/**
 * Manages all 6 month environments, activating/deactivating as player progresses.
 */
export class MonthManager {
  constructor(scene) {
    this.scene = scene;
    this.months = [
      new Month1(scene),
      new Month2(scene),
      new Month3(scene),
      new Month4(scene),
      new Month5(scene),
      new Month6(scene),
    ];

    this.activeMonths = new Set();
    this.visibleMonths = new Set();
  }

  activateMonth(index) {
    if (index >= 0 && index < 6 && !this.activeMonths.has(index)) {
      this.months[index].activate();
      this.activeMonths.add(index);
      this.visibleMonths.add(index);
    }
  }

  _hideMonth(index) {
    if (this.visibleMonths.has(index)) {
      this.scene.remove(this.months[index].group);
      this.visibleMonths.delete(index);
    }
  }

  _showMonth(index) {
    if (this.activeMonths.has(index) && !this.visibleMonths.has(index)) {
      this.scene.add(this.months[index].group);
      this.visibleMonths.add(index);
    }
  }

  update(elapsed, delta, progress) {
    const currentMonth = Math.min(Math.floor(progress * 6), 5);
    const localProgress = (progress * 6) - currentMonth;

    for (let i = Math.max(0, currentMonth); i <= Math.min(5, currentMonth + 1); i++) {
      this.activateMonth(i);
    }

    for (const idx of this.activeMonths) {
      if (idx >= currentMonth - 1 && idx <= currentMonth + 1) {
        this._showMonth(idx);
      } else {
        this._hideMonth(idx);
      }
    }

    for (const idx of this.visibleMonths) {
      this.months[idx].update(elapsed, delta, localProgress, currentMonth === idx);
    }
  }
}
