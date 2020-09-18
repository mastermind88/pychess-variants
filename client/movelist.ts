import { init } from "snabbdom";
import klass from 'snabbdom/modules/class';
import attributes from 'snabbdom/modules/attributes';
import properties from 'snabbdom/modules/props';
import listeners from 'snabbdom/modules/eventlisteners';

const patch = init([klass, attributes, properties, listeners]);

import h from 'snabbdom/h';
import { VNode } from 'snabbdom/vnode';

import { boardSettings } from './boardSettings';

export function selectMove (ctrl, ply) {
    const active = document.querySelector('move.active');
    if (active) active.classList.remove('active');

    const elPly = document.querySelector(`move[ply="${ply}"]`);
    if (elPly) elPly.classList.add('active');

    ctrl.goPly(ply)
    scrollToPly(ctrl);
}

function scrollToPly (ctrl) {
    if (ctrl.steps.length < 9) return;
    const movelistEl = document.getElementById('movelist') as HTMLElement;
    const plyEl = movelistEl.querySelector('move.active') as HTMLElement | null;

    let st: number | undefined = undefined;

    if (ctrl.ply == 0) st = 0;
    else if (ctrl.ply == ctrl.steps.length - 1) st = 99999;
    else if (plyEl) st = plyEl.offsetTop - movelistEl.offsetHeight / 2 + plyEl.offsetHeight / 2;

    if (st !== undefined)
        movelistEl.scrollTop = st;
}

export function movelistView (ctrl) {
    const container = document.getElementById('move-controls') as HTMLElement;
    ctrl.moveControls = patch(container, h('div#btn-controls-top.btn-controls', [
        h('button#flip', { on: { click: () => boardSettings.toggleOrientation() } }, [ h('i.icon.icon-refresh', { props: { title: 'Flip board' } } ) ]),
        h('button', { on: { click: () => selectMove(ctrl, 0) } }, [ h('i.icon.icon-fast-backward') ]),
        h('button', { on: { click: () => selectMove(ctrl, Math.max(ctrl.ply - 1, 0)) } }, [ h('i.icon.icon-step-backward') ]),
        h('button', { on: { click: () => selectMove(ctrl, Math.min(ctrl.ply + 1, ctrl.steps.length - 1)) } }, [ h('i.icon.icon-step-forward') ]),
        h('button', { on: { click: () => selectMove(ctrl, ctrl.steps.length - 1) } }, [ h('i.icon.icon-fast-forward') ]),
    ]));
    return h('div.movelist#movelist');
}

export function updateMovelist (ctrl, plyFrom, plyTo, activate: boolean = true) {
    const container = document.getElementById('movelist') as HTMLElement;
    const active = document.querySelector('move.active');
    if (active && activate) active.classList.remove('active');

    const moves: VNode[] = [];
    for (let ply = plyFrom; ply < plyTo; ply++) {
        const move = ctrl.steps[ply]['san'];
        if (move === null) continue;

        const moveEl = [ h('san', move) ];
        const scoreStr = ctrl.steps[ply]['scoreStr'] ?? '';
        moveEl.push(h('eval#ply' + ply, scoreStr));

        if (ply % 2 !== 0)
            moves.push(h('move.counter', (ply + 1) / 2));

        const el = h('move', {
            class: { active: ((ply === plyTo - 1) && activate) },
            attrs: { ply: ply },
            on: { click: () => selectMove(ctrl, ply) },
        }, moveEl);

        moves.push(el);
    }
    patch(container, h('div#movelist.movelist', moves));
    if (activate) scrollToPly(ctrl);
}
