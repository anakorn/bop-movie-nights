import React, { useCallback, useState, useMemo } from "react";
import YoutubeLightbox from "./YoutubeLightbox";
import { Movie } from "../state/movies/movie.model";
import "../styles/PollDetail.scss";
import { useUserFacade } from "../hooks/user.hook";
import { usePollsFacade } from "../hooks/polls.hook";

interface PollDetailProps {
	movie: Movie | null;
	saveCallback: Function;
	removeCallback: Function;
	count: number;
	disableVoting: boolean;
}

const PollDetail: React.FC<PollDetailProps> = ({
	movie,
	saveCallback,
	removeCallback,
	count,
	disableVoting
}) => {
	const [isTrailerOpen, setTrailerOpen] = useState(false);
	const [trailerUrl, setTrailerUrl] = useState(null);
	const [userState, login, logout, , showLogin] = useUserFacade();
	const [
		pollsState,
		setActivePoll,
		setActivePollOption,
		addPollVote,
		voteForActiveOption,
		hasVotedForActiveOption,
		,
		,
		,
		removePollVote
	] = usePollsFacade();

	const openTrailer = useCallback(
		event => {
			const { url } = event.target.dataset;
			setTrailerUrl(url);
			setTrailerOpen(true);
		},
		[setTrailerOpen]
	);

	const closeTrailer = useCallback(() => {
		setTrailerOpen(false);
		setTrailerUrl(null);
	}, [setTrailerOpen]);

	const handleSave = useCallback(
		event => {
			event.preventDefault();
			saveCallback();
		},
		[saveCallback]
	);

	const handleRemove = useCallback(
		event => {
			event.preventDefault();
			removeCallback();
		},
		[removeCallback]
	);

	if (!movie) {
		return null;
	}

	return (
		<div className="PollDetail">
			<h2 className="PollDetail-title">{movie.title}</h2>
			<div className="PollDetail-tags">
				{movie.genre.map(g => (
					<span key={g} className="PollDetail-tag PollDetail-genre">
						{g}
					</span>
				))}
			</div>
			<p className="PollDetail-plot">{movie.plot}</p>
			<div className="PollDetail-tags">
				<span className="PollDetail-tag">{movie.runtime}</span>
				<span className="PollDetail-tag">{movie.rated}</span>
				<span className="PollDetail-tag">{movie.year}</span>
			</div>
			<div className="PollDetail-actions">
				<button data-url={movie.trailerUrl} onClick={openTrailer}>
					Trailer
				</button>
				{!disableVoting &&
					(userState.user ? (
						<button
							onClick={hasVotedForActiveOption() ? handleRemove : handleSave}
							className={`${hasVotedForActiveOption() ? "active" : ""}`}
						>
							<i className="fas fa-star" style={{ marginRight: 4 }} />
							<span>({count || 0})</span>
						</button>
					) : (
						<button className="primary" onClick={() => showLogin(true)}>
							<span style={{ marginRight: 4 }}>Login to Vote</span>
							<span>({count || 0})</span>
						</button>
					))}
			</div>
			<YoutubeLightbox
				src={trailerUrl}
				isOpen={isTrailerOpen}
				onClose={closeTrailer}
			/>
		</div>
	);
};

export default PollDetail;
