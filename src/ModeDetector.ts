import { parseLocation } from './utils';

export enum ManagementMode {
    Blank = 'blank',
    Executor = 'executor',
}

const MANAGEMENT_MODE_SESSION_KEY = 'travian_management_mode';

export const MANAGEMENT_MODE_QUERY_PARAMETER = 'ta-management-mode';

export class ModeDetector {
    isExecutorMode(): boolean {
        return (
            this.isModeByLocation(ManagementMode.Executor) ||
            this.isModeBySession(ManagementMode.Executor)
        );
    }

    setExecutorMode(): void {
        sessionStorage.setItem(MANAGEMENT_MODE_SESSION_KEY, ManagementMode.Executor);
    }

    isBlankMode(): boolean {
        return (
            this.isModeByLocation(ManagementMode.Blank) ||
            this.isModeBySession(ManagementMode.Blank)
        );
    }

    setBlankMode() {
        sessionStorage.setItem(MANAGEMENT_MODE_SESSION_KEY, ManagementMode.Blank);
    }

    private isModeByLocation(mode: ManagementMode): boolean {
        const p = parseLocation();
        const queryParam = p.query[MANAGEMENT_MODE_QUERY_PARAMETER];
        return queryParam === mode;
    }

    private isModeBySession(mode: ManagementMode): boolean {
        const sessionKey = sessionStorage.getItem(MANAGEMENT_MODE_SESSION_KEY);
        return sessionKey === mode;
    }

    static makeLink(mode: ManagementMode): string {
        const p = parseLocation();
        p.query[MANAGEMENT_MODE_QUERY_PARAMETER] = mode;
        return p.toString();
    }
}
