import { EntityState, ActiveState, StoreConfig, EntityStore } from '@datorama/akita';
import { Poll, PollOption, PollOptionOrder, PollOptionOrderMap } from './poll.model';

export interface PollsState extends EntityState<Poll>, ActiveState {
    ui: {
        activePollOption: PollOption | null,
        pollOptionOrderMap: PollOptionOrderMap
    }
};

const initialState: PollsState = {
    active: null,
    ui: { activePollOption: null, pollOptionOrderMap: {} }
};

@StoreConfig({ name: 'polls' })
export class PollsStore extends EntityStore<PollsState> {
    constructor() {
        super(initialState);
    }

    setActiveOption(option: PollOption | null) {
        this.update(state => ({
            ...state,
            ui: {
                ...state.ui,
                activePollOption: option
            }
        }));
    }

    setPollOptionOrder(id: string, order: PollOptionOrder) {
        this.update(state => ({
            ...state,
            ui: {
                ...state.ui,
                pollOptionOrderMap: {
                    ...state.ui.pollOptionOrderMap,
                    [id]: order
                }
            }
        }));
    }
}

export const pollsStore = new PollsStore();