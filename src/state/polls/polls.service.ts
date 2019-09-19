import { ID } from "@datorama/akita";
import { PollsStore, pollsStore } from "./polls.store";
import { PollOption, Poll } from "./poll.model";
import { polls$ } from "../../external/firebase";
import { Subscription } from "rxjs";

export class PollsService {
    constructor(private pollsStore: PollsStore) {}

    load(): Subscription {
        return polls$.subscribe(polls => {
            this.pollsStore.set(polls.map((poll): Poll => ({
                id: poll.id,
                title: poll.title,
                options: poll.options.map((option): PollOption => ({
                    imdbId: option.imdbId,
                    count: option.count,
                    hasVotedUids: option.hasVotedUids
                })),
                archived: poll.archived,
                order: poll.order
            })));
        });
    }

    setActive(id: ID): void {
        this.pollsStore.setActive(id);
    }

    setActiveOption(option: PollOption | null) {
        this.pollsStore.setActiveOption(option);
    }
}

export const pollsService = new PollsService(pollsStore);