import React, { useState, useCallback, useMemo } from "react";
import moment from "moment";

import { useUserFacade } from "../hooks/user.hook";
import { useMoviesFacade } from "../hooks/movies.hook";
import { useUpcomingMovieFacade } from "../hooks/upcoming-movie.hook";
import { usePollsFacade } from "../hooks/polls.hook";

import "../styles/Admin.scss";

type UpcomingMovieForm = {
	id: string;
	wallpaperUrl: string;
	wallpaperBackgroundPosition: string;
	watchDate: string;
};

type NewPollForm = {
	name: string;
	order: number;
};

type NewPollOptionForm = {
	pollId: string;
	imdbId: string;
};

type NewMovieForm = {
	imdbId: string;
	trailerUrl: string;
};

const Admin: React.FC = () => {
	// TODO: add auth into this
	const userIsAdmin = false;
	const [useAdmin, setAdmin] = useState(false);
	const [{ user }] = useUserFacade();
	const [moviesState, getMovieById, addMovie] = useMoviesFacade();
	const [upcomingMovie, setUpcomingMovie] = useUpcomingMovieFacade();
	const [
		{ polls },
		setActivePoll,
		setActivePollOption,
		addPollVote,
		voteForActiveOption,
		hasVotedForActiveOption,
		createPoll,
		addPollOption
	] = usePollsFacade();

	const [upcomingMovieForm, setUpcomingMovieForm] = useState<UpcomingMovieForm>(
		upcomingMovie
			? {
					id: String(upcomingMovie.imdbId || upcomingMovie.id),
					wallpaperUrl: upcomingMovie.wallpaperUrl,
					wallpaperBackgroundPosition:
						upcomingMovie.wallpaperBackgroundPosition,
					watchDate: moment(
						upcomingMovie.watchDate.seconds * 1000
					).toISOString()
			  }
			: {
					id: "",
					wallpaperUrl: "",
					wallpaperBackgroundPosition: "",
					watchDate: ""
			  }
	);

	const [newPollForm, setNewPollForm] = useState<NewPollForm>({
		name: "",
		order: 0
	});

	const [newPollOptionForm, setNewPollOptionForm] = useState<NewPollOptionForm>(
		{
			imdbId: "",
			pollId: ""
		}
	);

	const [newMovieForm, setNewMovieForm] = useState<NewMovieForm>({
		imdbId: "",
		trailerUrl: ""
	});

	const handleAdmin = useCallback(
		event => {
			if (event.target.checked) {
				return setAdmin(true);
			}
			return setAdmin(false);
		},
		[setAdmin]
	);

	const moviesList = useMemo(
		() =>
			moviesState.movies.map(movie => (
				<option key={movie.imdbId || movie.id} value={movie.imdbId || movie.id}>
					{movie.title} ({movie.imdbId || movie.id})
				</option>
			)),
		[moviesState]
	);

	const pollsList = useMemo(
		() =>
			polls.map(poll => (
				<div key={poll.id} className="AdminPoll">
					<input
						className="AdminPoll-title"
						type="text"
						defaultValue={poll.title}
					/>
					<input
						className="AdminPoll-order"
						type="text"
						defaultValue={String(poll.order)}
					/>
					<label className="AdminPoll-archive">
						<input type="checkbox" defaultChecked={poll.archived} />
						Archive
					</label>
				</div>
			)),
		[polls]
	);

	const pollsListAsDropdown = useMemo(
		() =>
			polls.map(poll => (
				<option key={poll.id} value={poll.id}>
					{poll.title} ({poll.id})
				</option>
			)),
		[polls]
	);

	if (!userIsAdmin) {
		return null;
	}

	if (!useAdmin) {
		return (
			<div className="Admin">
				<label className="AdminSection">
					<input
						type="checkbox"
						onChange={handleAdmin}
						defaultChecked={useAdmin}
					/>
					Admin Panel
				</label>
			</div>
		);
	}

	return (
		<div className="Admin">
			<label className="AdminToggle AdminSection">
				<input
					type="checkbox"
					defaultChecked={useAdmin}
					onChange={handleAdmin}
				/>{" "}
				Admin Panel
			</label>
			<div className="AdminSection">
				<h3>Upcoming Movie</h3>
				<label htmlFor="AdminHeader-movie">Movie (id)</label>
				<select
					id="AdminHeader-movie"
					style={{ width: "100%" }}
					value={upcomingMovieForm.id}
					onChange={e => {
						setUpcomingMovieForm({
							...upcomingMovieForm,
							id: e.target.value
						});
					}}
				>
					{moviesList}
				</select>
				<label htmlFor="AdminHeader-wallpaper">Wallpaper Url</label>
				<input
					id="AdminHeader-wallpaper"
					type="text"
					value={upcomingMovieForm.wallpaperUrl}
					onChange={e => {
						setUpcomingMovieForm({
							...upcomingMovieForm,
							wallpaperUrl: e.target.value
						});
					}}
					placeholder="https://i.imgur.com/Ed9Ecae.jpg"
				/>
				<label htmlFor="AdminHeader-wallpaperBgPosition">
					Wallpaper Background Position
				</label>
				<input
					id="AdminHeader-wallpaperBgPosition"
					type="text"
					value={upcomingMovieForm.wallpaperBackgroundPosition}
					onChange={e => {
						setUpcomingMovieForm({
							...upcomingMovieForm,
							wallpaperBackgroundPosition: e.target.value
						});
					}}
					placeholder="center bottom"
				/>
				<label htmlFor="AdminHeader-date">Watch Date</label>
				<input
					id="AdminHeader-date"
					type="datetime-local"
					value={upcomingMovieForm.watchDate}
					onChange={e => {
						setUpcomingMovieForm({
							...upcomingMovieForm,
							watchDate: e.target.value
						});
					}}
				/>
				<button
					type="button"
					onClick={() => {
						setUpcomingMovie(
							upcomingMovieForm.id,
							upcomingMovieForm.wallpaperUrl,
							upcomingMovieForm.wallpaperBackgroundPosition,
							new Date(upcomingMovieForm.watchDate)
						);
					}}
				>
					Update Upcoming Movie
				</button>
			</div>
			<div className="AdminSection">
				<h3>New Poll</h3>
				<label htmlFor="AdminNewPoll-name">Poll Name</label>
				<input
					id="AdminNewPoll-name"
					type="text"
					placeholder="Poll Name"
					value={newPollForm.name}
					onChange={e => {
						setNewPollForm({
							...newPollForm,
							name: e.target.value
						});
					}}
				/>
				<label htmlFor="AdminNewPoll-order">Order</label>
				<input
					id="AdminNewPoll-order"
					type="number"
					placeholder="Order"
					value={newPollForm.order}
					onChange={e => {
						setNewPollForm({
							...newPollForm,
							order: e.target.valueAsNumber
						});
					}}
				/>
				<button
					type="button"
					onClick={() => {
						createPoll(newPollForm.name, newPollForm.order);
					}}
				>
					Add Poll
				</button>
			</div>
			<div className="AdminSection AdminSection--disabled">
				<h3>Manage Polls</h3>
				{pollsList}
				<button type="button">Update Polls</button>
			</div>
			<div className="AdminSection">
				<h3>New Poll Option</h3>
				<label htmlFor="AdminNewPollOption-poll">Poll (id)</label>
				<select
					id="AdminNewPollOption-poll"
					style={{ width: "100%" }}
					value={newPollOptionForm.pollId}
					onChange={e => {
						setNewPollOptionForm({
							...newPollOptionForm,
							pollId: e.target.value
						});
					}}
				>
					{pollsListAsDropdown}
				</select>
				<label htmlFor="AdminNewPollOption-id">Movie (id)</label>
				<select
					id="AdminNewPollOption-id"
					style={{ width: "100%" }}
					value={newPollOptionForm.imdbId}
					onChange={e => {
						setNewPollOptionForm({
							...newPollOptionForm,
							imdbId: e.target.value
						});
					}}
				>
					{moviesList}
				</select>
				<button
					type="button"
					onClick={async () => {
						if (user) {
							try {
								await addPollOption(
									newPollOptionForm.pollId,
									newPollOptionForm.imdbId,
									user.uid
								);
								window.alert(
									`Successfully added poll option movie ${newPollOptionForm.imdbId} for poll ${newPollOptionForm.pollId} for user ${user.uid}`
								);
							} catch (e) {
								console.error(e);
								window.alert(e);
							}
						}
					}}
				>
					Add Poll Option
				</button>
			</div>
			<div className="AdminSection">
				<h3>New Movie</h3>
				<label htmlFor="AdminNewMovie-id">IMDBid</label>
				<input
					id="AdminNewMovie-id"
					type="text"
					placeholder="tt#######"
					value={newMovieForm.imdbId}
					onChange={e => {
						setNewMovieForm({
							...newMovieForm,
							imdbId: e.target.value
						});
					}}
				/>
				<label htmlFor="AdminNewPoll-trailer">Trailer Url</label>
				<input
					id="AdminNewPoll-trailer-order"
					type="text"
					placeholder="YT link to trailer"
					value={newMovieForm.trailerUrl}
					onChange={e => {
						setNewMovieForm({
							...newMovieForm,
							trailerUrl: e.target.value
						});
					}}
				/>
				<button
					type="button"
					onClick={async () => {
						setNewMovieForm({
							imdbId: "",
							trailerUrl: ""
						});
						try {
							await addMovie(newMovieForm.imdbId, newMovieForm.trailerUrl);
							window.alert(`Successfully added movie ${newMovieForm.imdbId}`);
						} catch (e) {
							console.error(e);
							window.alert(e);
						}
					}}
				>
					Add Movie
				</button>
			</div>
		</div>
	);
};

export default Admin;
