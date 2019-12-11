import { QueryEntity } from "@datorama/akita";
import { Observable } from "rxjs";
import { PollsState, pollsStore, PollsStore } from "./polls.store";
import {
	Poll,
	PollOption,
	PollOptionOrder,
	PollOptionOrderMap
} from "./poll.model";
import { userQuery } from "../user/user.query";
import * as R from "ramda";
import { combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { USER_MOVIE_SUBMISSION_LIMIT } from "../../config";

const sortPolls = R.pipe(R.sortBy(R.prop("order")));

const countVotesInPoll = (uid: string, poll: Poll): number =>
	poll && poll.options
		? poll.options.filter(option => option.submittedUid === uid).length
		: 0;

export class PollsQuery extends QueryEntity<PollsState, Poll> {
	constructor(protected store: PollsStore) {
		super(store);
	}

	polls$: Observable<Poll[]> = this.selectAll().pipe(map(sortPolls));
	active$: Observable<Poll> = this.selectActive();
	activeOption$: Observable<PollOption | null> = this.select(
		state => state.ui.activePollOption
	);
	pollOptionOrderMap$: Observable<PollOptionOrderMap> = this.select(
		state => state.ui.pollOptionOrderMap
	);
	canSubmitMoviesToActivePoll: Observable<boolean> = combineLatest(
		this.active$,
		userQuery.user$
	).pipe(
		map(([activePoll, user]) =>
			user
				? countVotesInPoll(user.uid, activePoll) < USER_MOVIE_SUBMISSION_LIMIT
				: false
		)
	);
}

export const pollsQuery = new PollsQuery(pollsStore);
