import { ID } from "@datorama/akita";

export type App = {
    upcomingMovie: UpcomingMovie;
}

export type Movie = {
    id: string;
    trailerUrl: string;
}

export type UpcomingMovie = {
    imdbId: string;
    wallpaperUrl: string;
    watchDate: Date;
};

export type Poll = {
    id: ID;
    title: string;
    options: PollOption[];
    archived: boolean;
    order: number;
};

export type PollOption = {
    imdbId: string;
    count: number;
}