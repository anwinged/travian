import * as URLParse from 'url-parse';

export async function waitForLoad() {
    return new Promise((resolve) => jQuery(resolve));
}

export function parseLocation(location?: string | undefined) {
    return new URLParse(location || window.location.href, true);
}

export function notify(msg: string): void {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
        // If it's okay let's create a notification
        const n = new Notification(msg);
        setTimeout(() => n && n.close(), 4000);
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === 'granted') {
                const n = new Notification(msg);
                setTimeout(() => n && n.close(), 4000);
            }
        });
    }
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
