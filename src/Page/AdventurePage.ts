import { getNumber, trimPrefix } from '../Helpers/Convert';

export function showAdventureDifficulty() {
    jQuery('td.difficulty').each((index, el) => {
        const $el = jQuery(el);
        const $img = $el.find('img');
        const imgClass = $img.attr('class') || '';
        const level = getNumber(trimPrefix(imgClass, 'adventureDifficulty'));
        $img.after(` - ${level}`);
    });
}
