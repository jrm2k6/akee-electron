import { Notification } from 'electron';
import set from 'date-fns/set';
import addDays from 'date-fns/addDays';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';

export default class NotificationManager {
  timeoutId: NodeJS.Timer | null;

  clickHandler: () => Promise<void>;

  constructor(clickHandler: () => Promise<void>) {
    this.clickHandler = clickHandler;
    this.timeoutId = null;
  }

  run(): void {
    this.timeoutId = this.setNextTimeout();
  }

  setNextTimeout(): NodeJS.Timer {
    const currentDateTime = new Date();
    let nextFivePm: Date = set(new Date(), {
      hours: 17,
      minutes: 0,
      seconds: 0,
    });
    let diff = differenceInMilliseconds(nextFivePm, currentDateTime);
    if (diff < 0) {
      nextFivePm = addDays(nextFivePm, 1);
      diff = differenceInMilliseconds(nextFivePm, currentDateTime);
    }

    return setTimeout(() => {
      const notification = new Notification({
        title: 'Learned anything new?',
        closeButtonText: 'Close',
        body: 'Click to track what you learned today!',
      });
      notification.on('click', async () => {
        await this.clickHandler();
      });
      notification.show();
      if (this.timeoutId) clearTimeout(this.timeoutId);
      this.timeoutId = this.setNextTimeout();
    }, diff);
  }
}
