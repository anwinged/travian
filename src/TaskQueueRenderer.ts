import { ImmutableTaskList } from './Queue/TaskProvider';
import { uniqId } from './Helpers/Identity';
import { formatDate } from './Helpers/Format';

const ID = uniqId();

export class TaskQueueRenderer {
    render(tasks: ImmutableTaskList) {
        const ul = jQuery('<ul></ul>')
            .attr({ id: ID })
            .css({
                'position': 'absolute',
                'background-color': 'white',
                'left': 0,
                'top': '40px',
                'color': 'black',
                'z-index': '9999',
                'padding': '8px 6px',
            });
        tasks.forEach(task => {
            ul.append(
                jQuery('<li></li>').text(formatDate(task.ts) + ' ' + task.name + ' ' + task.id)
            );
        });

        const el = jQuery(`#${ID}`);
        if (el.length > 0) {
            el.replaceWith(ul);
        } else {
            jQuery('body').append(ul);
        }
    }
}
