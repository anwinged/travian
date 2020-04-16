import * as URLParse from 'url-parse';

const SESSION_KEY = 'travian_automation_mode';
const SESSION_VALUE = 'command_execution';
const MODE_PARAMETER_NAME = 'auto-management';

export class ModeDetector {
    isAuto(): boolean {
        return this.isAutoByLocation() || this.isAutoBySession();
    }

    setAuto(): void {
        sessionStorage.setItem(SESSION_KEY, SESSION_VALUE);
    }

    private isAutoByLocation(): boolean {
        const p = new URLParse(window.location.href, true);
        return p.query[MODE_PARAMETER_NAME] !== undefined;
    }

    private isAutoBySession(): boolean {
        const sessionKey = sessionStorage.getItem(SESSION_KEY);
        return sessionKey === SESSION_VALUE;
    }
}
