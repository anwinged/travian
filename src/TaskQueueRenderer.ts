import { TaskList } from './Storage/TaskQueue';
import { uniqId } from './utils';

const ID = uniqId();

export default class TaskQueueRenderer {
    render(tasks: TaskList) {
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
        tasks.forEach(task => {
            ul.append(
                jQuery('<li></li>').text(
                    task.ts +
                        ' ' +
                        task.cmd.name +
                        ' ' +
                        JSON.stringify(task.cmd.args) +
                        ' ' +
                        task.id
                )
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
