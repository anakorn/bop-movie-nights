import { ID } from "@datorama/akita";
import { PollsStore, pollsStore } from "./polls.store";
import { PollOption, Poll, PollOptionOrder } from "./poll.model";
import { pollsQuery } from "./polls.query";
import { polls$ } from "../../external/firebase";
import { Subscription, combineLatest } from "rxjs";
import { tap } from "rxjs/operators";
import shuffle from "lodash.shuffle";

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

    loadPollOptionOrder(): Subscription {
        return combineLatest(polls$, pollsQuery.pollOptionOrderMap$)
            .pipe(
                // filter(([polls, pollOptionOrderMap]) => polls.filter(poll => !pollOptionOrderMap[poll.id]).length > 0),
                tap(([polls, pollOptionOrderMap]) => {
                    polls
                        // ignore already ordered polls
                        .filter(poll => !pollOptionOrderMap[poll.id])
                        .forEach(poll => {
                            this.setPollOptionOrder(
                                poll.id,
                                shuffle(poll.options).map(poll => poll.imdbId)
                            );
                        });
                })
            )
            .subscribe();
    }

    setActive(id: ID): void {
        this.pollsStore.setActive(id);
    }

    setActiveOption(option: PollOption | null) {
        this.pollsStore.setActiveOption(option);
    }

    setPollOptionOrder(id: string, order: PollOptionOrder) {
        this.pollsStore.setPollOptionOrder(id, order);
    }
}

export const pollsService = new PollsService(pollsStore);