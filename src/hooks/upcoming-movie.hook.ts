import { useEffect, useState } from "react";
import { Observable, Subscription } from "rxjs";
import { UpcomingMovie } from "../state/movies/upcoming-movie.model";
import { UpcomingMovie as UpcomingMovieExternal } from "../external/firebase.d";
import { upcomingMovie$ } from "../external/firebase";
import { useMoviesFacade } from "./movies.hook";
import { useUserFacade } from "./user.hook";
import * as firebase from "../external/firebase";

interface UpcomingMovieState {
	upcomingMovie: UpcomingMovie | null;
}

function onEmit<T>(
	source$: Observable<T>,
	nextFn: (value: T) => void
): Subscription {
	return source$.subscribe(nextFn, console.error);
}

/**
 * View Model for Upcoming Movie view components
 */
export function useUpcomingMovieFacade(): [
	UpcomingMovie | null,
	(
		imdbId: string,
		wallpaperUrl: string,
		wallpaperBackgroundPosition: string,
		watchDate: Date
	) => void
] {
	const [state, setState] = useState<UpcomingMovieState>({
		upcomingMovie: null
	});
	const [, getMovieById] = useMoviesFacade();
	const [, , , wrapLogin] = useUserFacade();

	/**
	 * Manage subscriptions with auto-cleanup
	 */
	useEffect(() => {
		const subscription = onEmit<UpcomingMovieExternal>(
			upcomingMovie$,
			upcomingMovie => {
				// Don't set state until movie details are ready
				const movieDetails = getMovieById(upcomingMovie.imdbId);
				if (movieDetails) {
					setState({
						upcomingMovie: {
							...upcomingMovie,
							...movieDetails
						}
					});
				}
			}
		);
		return () => subscription.unsubscribe();
	}, [getMovieById]);

	return [state.upcomingMovie, wrapLogin(firebase.setUpcomingMovie)];
}
