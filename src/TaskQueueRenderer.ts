import { State } from './Storage/TaskQueue';

const ID = 'id-832654376836436939356';

export default class TaskQueueRenderer {
    render(state: State) {
        const ul = jQuery('<ul></ul>')
            .attr({ id: ID })
            .css({
                position: 'absolute',
                'background-color': 'white',
                left: 0,
                top: '40px',
                color: 'black',
                'z-index': '9999',
                padding: '8px 6px',
            });
        if (state.current) {
            ul.append(
                jQuery('<li></li>').text('Current: ' + state.current.cmd.name)
            );
        }
        state.items.forEach(c => {
            ul.append(jQuery('<li></li>').text(c.cmd.name));
        });

        const el = jQuery(`#${ID}`);
        if (el.length > 0) {
            el.replaceWith(ul);
        } else {
            jQuery('body').append(ul);
        }
    }
}
