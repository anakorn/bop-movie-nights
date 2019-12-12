import firebase from "firebase/app";
import "firebase/firestore";
import { collectionData, docData } from "rxfire/firestore";
import { Movie, Poll, UpcomingMovie, PollOption } from "./firebase.d";

const app = firebase.initializeApp({
	apiKey: "AIzaSyCGCXKEcAJSyq_QvxgdO1RuE6VXHc-u2mM",
	authDomain: "bop-movie-nights.firebaseapp.com",
	databaseURL: "https://bop-movie-nights.firebaseio.com",
	projectId: "bop-movie-nights",
	storageBucket: "bop-movie-nights.appspot.com",
	messagingSenderId: "116248761122",
	appId: "1:116248761122:web:3dcc0a01f7a71fa7ac4b7b"
});
const db = app.firestore();

export const upcomingMovie$ = docData<UpcomingMovie>(
	db.doc("app/upcomingMovie")
);
export const movies$ = collectionData<Movie>(db.collection("movies"), "id");
export const polls$ = collectionData<Poll>(db.collection("polls"), "id");

type UpdatePollOptionFunction = (options: PollOption[]) => PollOption[];

async function updatePollOptions(
	pollId: string,
	update: UpdatePollOptionFunction
): Promise<void> {
	const pollRef = await db.collection("polls").doc(pollId);
	return db.runTransaction(
		async (transaction: firebase.firestore.Transaction) => {
			const pollDoc = await transaction.get(pollRef);
			if (!pollDoc.exists) {
				throw new Error(`Document with ref ID "${pollId}" does not exist!`);
			}
			const pollOptions: PollOption[] = pollDoc.get("options");
			const updatedPollOptions = update(pollOptions);
			transaction.update(pollRef, { options: updatedPollOptions });
		}
	);
}

export async function addVote(
	userId: string,
	pollId: string,
	imdbId: string
): Promise<void> {
	return updatePollOptions(pollId, (options: PollOption[]) =>
		options.map(option => {
			if (option.imdbId === imdbId) {
				if (option.hasVotedUids && option.hasVotedUids.includes(userId)) {
					throw new Error("User has already voted.");
				}
				return {
					...option,
					count: option.count + 1 || 1,
					hasVotedUids: (option.hasVotedUids || []).concat(userId)
				};
			}
			return option;
		})
	);
}

export async function removeVote(
	userId: string,
	pollId: string,
	imdbId: string
): Promise<void> {
	return updatePollOptions(pollId, (options: PollOption[]) =>
		options.map(option => {
			if (option.imdbId === imdbId) {
				return {
					...option,
					count: option.count - 1 || 0,
					hasVotedUids: (option.hasVotedUids || []).filter(
						uid => uid !== userId
					)
				};
			}
			return option;
		})
	);
}

export async function createPoll(
	title: string,
	order: number
): Promise<firebase.firestore.DocumentReference> {
	return db.collection("polls").add({
		title,
		order,
		archived: false,
		options: []
	});
}

export async function addPollOption(
	pollId: string,
	imdbId: string,
	submittedUid: string
) {
	return updatePollOptions(pollId, (options: PollOption[]) => {
		if (options.find(option => option.submittedUid === submittedUid)) {
			throw new Error(
				`User ${submittedUid} has already submitted movie ${imdbId} in poll ${pollId}`
			);
		}
		return options.concat([
			{
				imdbId,
				hasVotedUids: [],
				count: 0,
				submittedUid: submittedUid
			}
		]);
	});
}

export type UpdatePollRequest = {
	id: string;
	title: string;
	order: number;
	archived: boolean;
};

export async function updatePolls(
	requests: UpdatePollRequest[]
): Promise<void> {
	const batch = db.batch();
	requests.forEach(request => {
		batch.update(db.collection("polls").doc(request.id), {
			title: request.title,
			order: request.order,
			archived: request.archived
		});
	});
	return batch.commit();
}

export async function addMovie(
	imdbId: string,
	trailerUrl: string
): Promise<void> {
	const movieDocRef = db.collection("movies").doc(imdbId);
	return db.runTransaction(async transaction => {
		const movieDoc = await transaction.get(movieDocRef);
		if (movieDoc.exists) {
			throw new Error(`Movie document with ID ${imdbId} already exists.`);
		}
		transaction.set(movieDocRef, {
			trailerUrl
		});
	});
}

export async function setUpcomingMovie(
	imdbId: string,
	wallpaperUrl: string,
	wallpaperBackgroundPosition: string,
	watchDate: Date
): Promise<void> {
	return db
		.collection("app")
		.doc("upcomingMovie")
		.set({
			imdbId,
			wallpaperUrl,
			wallpaperBackgroundPosition,
			watchDate: firebase.firestore.Timestamp.fromDate(watchDate)
		});
}

export default firebase;
