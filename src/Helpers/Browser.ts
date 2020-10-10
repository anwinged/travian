import * as URLParse from 'url-parse';

export async function waitForLoad() {
    return new Promise((resolve) => jQuery(resolve));
}

export function parseLocation(location?: string | undefined) {
    return new URLParse(location || window.location.href, true);
}

export function notify(msg: string): void {
    const n = new Notification(msg);
    setTimeout(() => n && n.close(), 4000);
}

export function markPage(text: string, version: string) {
    jQuery('body').append(
        '<div style="' +
            'position: absolute; ' +
            'top: 0; left: 0; ' +
            'background-color: white; ' +
            'font-size: 24px; ' +
            'z-index: 9999; ' +
            'padding: 8px 6px; ' +
            'color: black">' +
            text +
            ' ' +
            version +
            '</div>'
    );
}
