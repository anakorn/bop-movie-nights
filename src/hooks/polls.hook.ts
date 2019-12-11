import { useEffect, useState } from "react";
import { Observable, Subscription } from "rxjs";
import _firebase from "firebase";
import { ID } from "@datorama/akita";
import { first } from "rxjs/operators";
import { USER_MOVIE_SUBMISSION_LIMIT } from "../config";
import { pollsService } from "../state/polls/polls.service";
import { pollsQuery } from "../state/polls/polls.query";
import {
	Poll,
	PollOption,
	PollOptionOrderMap,
	PollOptionOrder
} from "../state/polls/poll.model";
import { useUserFacade } from "./user.hook";
import * as firebase from "../external/firebase";
import { UpdatePollRequest } from "../external/firebase";

interface PollsState {
	polls: Poll[];
	livePolls: Poll[];
	activePoll: Poll | null;
	activePollOption: PollOption | null;
	pollOptionOrderMap: PollOptionOrderMap;
	canSubmitMoviesToActivePoll: boolean;
}

function onEmit<T>(
	source$: Observable<T>,
	nextFn: (value: T) => void
): Subscription {
	return source$.subscribe(nextFn, console.error);
}

/**
 * View Model for Poll view components
 */
export function usePollsFacade(): [
	PollsState,
	Function,
	Function,
	(userId: string, pollId: string, imdbId: string) => Promise<void>,
	Function,
	Function,
	(
		title: string,
		order: number
	) => Promise<_firebase.firestore.DocumentReference> | void,
	(pollId: string, imdbId: string, submittedUid: string) => void,
	(requests: UpdatePollRequest[]) => void,
	(userId: string, pollId: string, imdbId: string) => Promise<void>,
	() => Promise<void>,
	(id: string, order: PollOptionOrder) => void
] {
	const [userState, login, , wrapLogin, showLogin] = useUserFacade();
	const [state, setState] = useState<PollsState>({
		polls: [],
		livePolls: [],
		activePoll: null,
		activePollOption: null,
		pollOptionOrderMap: {},
		canSubmitMoviesToActivePoll: false
	});
	const setActive = (id: ID) => {
		pollsService.setActive(id);
		// Reset active poll option when active poll is changed
		if (state.activePoll && state.activePoll.id !== id) {
			pollsService.setActiveOption(null);
		}
	};
	const setActiveOption = (option: PollOption) =>
		pollsService.setActiveOption(option);

	const addPollVote = async (id: ID, optionId: string) => {
		if (userState.user) {
			firebase.addVote(userState.user.uid, id.toString(), optionId);
		} else {
			showLogin(true);
		}
	};
	const removePollVote = async (id: ID, optionId: string) => {
		if (userState.user) {
			firebase.removeVote(userState.user.uid, id.toString(), optionId);
		} else {
			showLogin(true);
		}
	};
	const voteForActiveOption = () => {
		if (!(state.activePoll && state.activePollOption)) {
			throw Error(`Cannot select poll option.`);
		}
		return addPollVote(state.activePoll.id, state.activePollOption.imdbId);
	};
	const removeVoteForActiveOption = () => {
		if (!(state.activePoll && state.activePollOption)) {
			throw Error(`Cannot select poll option.`);
		}
		return removePollVote(state.activePoll.id, state.activePollOption.imdbId);
	};
	const hasVotedForActiveOption = () => {
		if (
			state.activePollOption &&
			state.activePollOption.hasVotedUids &&
			userState.user
		) {
			return state.activePollOption.hasVotedUids.includes(userState.user.uid);
		}
		return false;
	};

	/**
	 * Manage subscriptions with auto-cleanup
	 */
	useEffect(() => {
		const subscriptions = [
			onEmit<Poll[]>(pollsQuery.polls$, polls =>
				setState(state => {
					return {
						...state,
						polls,
						livePolls: polls.filter(poll => !poll.archived)
					};
				})
			),
			onEmit<Poll>(pollsQuery.active$, poll =>
				setState(state => ({
					...state,
					activePoll: poll
				}))
			),
			onEmit<PollOption | null>(pollsQuery.activeOption$, pollOption =>
				setState(state => ({ ...state, activePollOption: pollOption }))
			),
			onEmit<PollOptionOrderMap | null>(
				pollsQuery.pollOptionOrderMap$,
				pollOptionOrderMap =>
					setState(state => ({
						...state,
						pollOptionOrderMap: pollOptionOrderMap || {}
					}))
			),
			onEmit<boolean>(
				pollsQuery.canSubmitMoviesToActivePoll,
				canSubmitMoviesToActivePoll =>
					setState(state => ({
						...state,
						canSubmitMoviesToActivePoll
					}))
			)
		];

		// Set first available poll to be active
		subscriptions.push(
			pollsQuery.polls$
				.pipe(first(polls => polls.length > 0))
				.subscribe(polls => {
					const livePolls = polls.filter(poll => !poll.archived);
					if (livePolls.length > 0) {
						setActive(livePolls[0].id);
					}
				})
		);

		pollsService.load();
		pollsService.loadPollOptionOrder();
		return () => {
			subscriptions.forEach(subscription => subscription.unsubscribe());
		};
	}, []);

	return [
		state,
		setActive,
		setActiveOption,
		addPollVote,
		voteForActiveOption,
		hasVotedForActiveOption,
		wrapLogin(firebase.createPoll),
		wrapLogin(firebase.addPollOption),
		wrapLogin(firebase.updatePolls),
		removePollVote,
		removeVoteForActiveOption,
		pollsService.setPollOptionOrder
	];
}
