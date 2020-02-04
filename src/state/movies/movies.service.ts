import { MoviesStore, moviesStore } from "./movies.store";
import { movies$ } from "../../external/firebase";
import { switchMap, scan } from "rxjs/operators";
import { from, merge } from "rxjs";
import { Movie as OMDBMovie } from "../../external/omdb.d";
import { Movie as CustomMovie } from "../../external/firebase.d";
import { fetchMovie } from "../../external/omdb";

type MoviePayload = {
	omdb: OMDBMovie;
	custom: CustomMovie;
};

export class MoviesService {
	constructor(private moviesStore: MoviesStore) {}

	// Subscribe to custom movies, and get their associated OMDB data
	load(): void {
		movies$
			.pipe(
				// We only want the last emitted array of movies
				// Map each movie into a promise for a
				switchMap(movies => {
					const customMovies$ = movies.map(custom => {
						return from(fetchMovie(custom.id)).pipe(
							scan(
								(_, omdb: OMDBMovie): MoviePayload =>
									({
										custom,
										omdb
									} as MoviePayload),
								{} as MoviePayload
							)
						);
					});
					return merge(...customMovies$);
				})
			)
			.subscribe(movie => {
				this.moviesStore.upsert(movie.omdb.imdbID, {
					id: movie.omdb.imdbID,
					genre: movie.omdb.Genre
						? movie.omdb.Genre.split(",").map((genre: string) =>
							genre.trim()
						)
						: [],
					plot: movie.omdb.Plot,
					poster: movie.omdb.Poster,
					rated: movie.omdb.Rated,
					runtime: movie.omdb.Runtime,
					title: movie.omdb.Title,
					website: movie.omdb.Website,
					year: movie.omdb.Year,
					trailerUrl: movie.custom.trailerUrl
				});
			});
	}
}

export const moviesService = new MoviesService(moviesStore);
