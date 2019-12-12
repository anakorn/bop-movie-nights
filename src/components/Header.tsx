import React, { useState, useCallback } from "react";
import YoutubeLightbox from "./YoutubeLightbox";
import PlayButton from "./PlayButton";
import "../styles/Header.scss";
import "../styles/HeaderPlaceholder.scss";
import { useUpcomingMovieFacade } from "../hooks/upcoming-movie.hook";
import moment from "moment";
import ContentLoader from "react-content-loader";

const HeaderPlaceholder: React.FC = () => {
	return (
		<div className="Header HeaderPlaceholder">
			<div className="Container">
				<ContentLoader
					height={240}
					width={400}
					speed={1}
					primaryColor="#f1c40f"
					secondaryColor="#ecda92"
				>
					<rect x="0" y="24" width="200" height="20" />
					<rect x="0" y="53" width="35" height="13" />
					<rect x="45" y="53" width="35" height="13" />
					<rect x="90" y="53" width="35" height="13" />
					<rect x="135" y="53" width="35" height="13" />
					<rect x="180" y="53" width="35" height="13" />
					<rect x="225" y="53" width="35" height="13" />
					<rect x="0" y="74" width="100" height="20" />
					<rect x="0" y="126" width="380" height="24" />
					<rect x="0" y="156" width="48" height="12" />
					<rect x="0" y="200" width="220" height="27" />
				</ContentLoader>
			</div>
		</div>
	);
};

const Header: React.FC = () => {
	const [upcomingMovie] = useUpcomingMovieFacade();
	const [isTrailerOpen, setTrailerOpen] = useState(false);

	// Hooks must be defined before loading screen return
	const openTrailer = useCallback(() => {
		setTrailerOpen(true);
	}, [setTrailerOpen]);

	const closeTrailer = useCallback(() => {
		setTrailerOpen(false);
	}, [setTrailerOpen]);

	const isLoading = upcomingMovie === null;

	// Loading state
	if (isLoading) {
		return <HeaderPlaceholder />;
	}

	const {
		wallpaperUrl,
		wallpaperBackgroundPosition,
		title,
		genre,
		trailerUrl,
		plot,
		website,
		runtime,
		rated,
		watchDate
	} = upcomingMovie || {};

	return (
		<div className="Header">
			<div
				className="Header-background"
				style={{
					backgroundImage: `url(${wallpaperUrl})`,
					backgroundPosition: wallpaperBackgroundPosition
				}}
			></div>
			<div className="Container">
				<h1 className="Header-title">{title}</h1>
				<div className="Header-genres">
					{genre &&
						genre.map((g: string) => (
							<div key={g} className="Header-genre">
								{g}
							</div>
						))}
				</div>
				<button className="Header-trailer" onClick={openTrailer}>
					<span>Watch Trailer</span>
					<i
						className="far fa-play-circle"
						style={{
							marginLeft: "10px",
							fontSize: "20px",
							verticalAlign: "middle"
						}}
					/>
				</button>

				<div className="Header-text-container">
					{plot && (
						<p className="Header-plot">
							{plot}
							{website && (
								<a
									className="Header-website"
									rel="noopener noreferrer"
									target="_blank"
									href={website}
								>
									Visit Website >
								</a>
							)}
						</p>
					)}
					<div>
						{runtime && <div className="Header-runtime">{runtime}</div>}
						{rated && <div className="Header-rating">{rated}</div>}
					</div>
					<h2
						className="Header-subtitle"
						title={moment(watchDate.seconds * 1000).fromNow()}
					>
						Upcoming: {moment(watchDate.seconds * 1000).format("dddd, MMMM Do")}
					</h2>
				</div>
			</div>
			<YoutubeLightbox
				src={trailerUrl}
				isOpen={isTrailerOpen}
				onClose={closeTrailer}
			/>
		</div>
	);
};

export default Header;
