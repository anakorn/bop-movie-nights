import React, { useCallback, useState } from "react";
import Lightbox from "lightbox-react";
import { User } from "../state/user/user.model";
import { useMoviesFacade } from "../hooks/movies.hook";
import { usePollsFacade } from "../hooks/polls.hook";
import { useUserFacade } from "../hooks/user.hook";
import "../styles/Nominate.scss";

interface NominateFormProps {
	onSubmit: () => any;
	user: User | null;
}

const NominateForm: React.FC<NominateFormProps> = ({ onSubmit, user }) => {
	const [{ activePoll }, , , , , , , addPollOption, , , ,] = usePollsFacade();
	const [, , addMovie] = useMoviesFacade();
	const [error, setError] = useState<String | null>(null);

	const handleSubmit = useCallback(async () => {
		const idElement = document.getElementById(
			"nominate-id"
		) as HTMLInputElement;
		const trailerElement = document.getElementById(
			"nominate-trailer"
		) as HTMLInputElement;
		if (!idElement || !idElement.value) {
			setError("IMDB id is required");
			return;
		}
		if (!trailerElement || !trailerElement.value) {
			setError("Trailer is required");
			return;
		}
		if (!activePoll || !activePoll.id) {
			setError("Internal Error: Poll not found. Please refresh.");
			return;
		}
		if (!user || !user.uid) {
			setError("Internal Error: No user found. Please refresh.");
			return;
		}
		setError(null);
		try {
			await addMovie(idElement.value, trailerElement.value);
		} catch (e) {
			console.error(e);
		}
		try {
			await addPollOption(activePoll.id, idElement.value, user.uid);
		} catch (e) {
			console.error(e);
			window.alert(e);
		}
		onSubmit();
	}, [setError, onSubmit, activePoll, addPollOption, user, addMovie]);

	return (
		<div className="NominateForm Lightbox-container">
			<h2 className="Lightbox-title">Nominate a movie</h2>
			<div className="Lightbox-section">
				<h3>
					<label htmlFor="nominate-id">IMDB id</label>
				</h3>
				<small>
					https://www.imdb.com/title/<em>id</em>
				</small>
				<input autoFocus required id="nominate-id" type="text" placeholder="tt5311514" minLength={9} maxLength={9}  />
			</div>
			<div className="Lightbox-section">
				<h3>
					<label htmlFor="nominate-trailer">Youtube Trailer Link</label>
				</h3>
				<small>
					Example:{" "}
					<a href="https://www.youtube.com/watch?v=xU47nhruN-Q" target="_blank">
						https://www.youtube.com/watch?v=xU47nhruN-Q
					</a>
				</small>
				<input
					id="nominate-trailer"
					type="text"
					placeholder="https://www.youtube.com/watch?v=xU47nhruN-Q"
					required 
				/>
			</div>
			<div className="Lightbox-section">
				{error && <small className="Nominate-error">{error}</small>}
				<button onClick={handleSubmit}>Submit Nomination</button>
			</div>
		</div>
	);
};

const Nominate: React.FC = () => {
	const [isNominating, setIsNominating] = useState(false);
	const closeLightbox = useCallback(() => setIsNominating(false), [
		setIsNominating
	]);
	const openLightbox = useCallback(() => setIsNominating(true), [
		setIsNominating
	]);
	const [userState, , , , showLogin] = useUserFacade();
	const [{ canSubmitMoviesToActivePoll }] = usePollsFacade();
	return (
		<>
			<div className="Nominate">
				{(!userState.user || canSubmitMoviesToActivePoll) && (
					<h2 className="Nominate-title">Have another nomination?</h2>
				)}
				{!userState.user && (
					<button className="Nominate-button" onClick={() => showLogin(true)}>
						Login to Nominate
					</button>
				)}
				{userState.user && canSubmitMoviesToActivePoll && (
					<button className="Nominate-button" onClick={openLightbox}>
						<span className="Nominate-icon">+</span>
						Nominate Movie
					</button>
				)}
				{userState.user && !canSubmitMoviesToActivePoll && (
					<>
						<h2 className="Nominate-title">Thank you for your nominations!</h2>
						<p style={{ color: "white" }}>
							Please come back next month to nominate other movies.
						</p>
					</>
				)}
			</div>
			{userState.user && isNominating && (
				<Lightbox
					// @ts-ignore
					mainSrc={
						<NominateForm onSubmit={closeLightbox} user={userState.user} />
					}
					onCloseRequest={closeLightbox}
					enableZoom={false}
				/>
			)}
		</>
	);
};

export default Nominate;
