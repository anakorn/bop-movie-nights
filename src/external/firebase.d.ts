import { ID } from "@datorama/akita";

export type App = {
	upcomingMovie: UpcomingMovie;
};

export type Movie = {
	id: string;
	trailerUrl: string;
};

export type UpcomingMovie = {
	imdbId: string;
	wallpaperUrl: string;
	wallpaperBackgroundPosition: string;
	watchDate: Date;
};

export type Poll = {
	id: string;
	title: string;
	options: PollOption[];
	archived: boolean;
	order: number;
};

export type PollOption = {
	imdbId: string;
	count: number;
	hasVotedUids: string[];
	submittedUid: string;
};
