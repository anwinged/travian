import * as URLParse from 'url-parse';

const SESSION_KEY = 'travian_automation_mode';
const SESSION_VALUE = 'command_execution';

export default class ModeDetector {
    isAuto(): boolean {
        return this.isAutoByLocation() || this.isAutoBySession();
    }

    setAuto(): void {
        sessionStorage.setItem(SESSION_KEY, SESSION_VALUE);
    }

    private isAutoByLocation(): boolean {
        const p = new URLParse(window.location.href, true);
        console.log('PARSED LOCATION', p);
        if (p.query['auto-management'] !== undefined) {
            console.log('AUTO MANAGEMENT ON');
            return true;
        }

        return false;
    }

    private isAutoBySession(): boolean {
        const k = sessionStorage.getItem(SESSION_KEY);
        return k === SESSION_VALUE;
    }
}
