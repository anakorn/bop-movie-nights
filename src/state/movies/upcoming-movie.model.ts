import { Movie } from "./movie.model";

export interface UpcomingMovie extends Movie {
	wallpaperUrl: string;
	wallpaperBackgroundPosition: string;
	watchDate: any;
}
