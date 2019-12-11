import React, { useMemo, useCallback } from 'react';
import Carousel from './Carousel';
import PollDetail from './PollDetail';
import Nominate from './Nominate';
import '../styles/Poll.scss';
import { usePollsFacade } from '../hooks/polls.hook';
import { useMoviesFacade } from '../hooks/movies.hook';
import { Movie } from '../state/movies/movie.model';
import { PollOption } from '../state/polls/poll.model';

const Poll: React.FC = () => {
    const [
        {
            activePoll,
            activePollOption,
            pollOptionOrderMap,
            canSubmitMoviesToActivePoll,
        },
        setActivePoll,
        setActivePollOption,
        addPollVote,
        voteForActiveOption,
        ,
        ,
        ,
        ,
        ,
        removeVoteForActiveOption
    ] = usePollsFacade();
    // TODO: remove movies facade and use updated polls facade;
    const [moviesState, getMovieById] = useMoviesFacade();
    const activePollOptions = activePoll && pollOptionOrderMap[activePoll.id]
        ? pollOptionOrderMap[activePoll.id]
            .map(imdbId => activePoll.options.find(option => option.imdbId === imdbId) as PollOption)
        : [];

    const imgs = useMemo(() => activePollOptions
        .filter(option => getMovieById(option.imdbId) !== undefined)
        .map(option => {
            const movie: Movie = getMovieById(option.imdbId);
            return ({
                src: `https://img.omdbapi.com/?i=${option.imdbId}&h=450&apikey=d9936574`,
                alt: movie.title
            });
        })
    , [activePollOptions, getMovieById]);

    const currentMovie = useMemo(() => activePollOption
        && getMovieById(activePollOption.imdbId)
    , [activePollOption, getMovieById]);

    const activeIndex = useMemo(() => {
        if (!activePoll || !activePollOption) {
            return;
        }
        return activePollOptions.findIndex(o => o.imdbId === activePollOption.imdbId);
    }, [activePoll, activePollOption]);

    const activeCallback = useCallback((index) => {
        if (!activePoll) {
            return;
        }
        return setActivePollOption(activePollOptions[index]);
    }, [activePoll, setActivePollOption]);

    if (!(activePoll)) {
        return null;
    }

    return (
        <div className="Poll">
            <Carousel
                imgs={imgs || []}
                activeCallback={activeCallback}
                active={activeIndex}
            />
            <PollDetail
                movie={currentMovie}
                saveCallback={voteForActiveOption}
                removeCallback={removeVoteForActiveOption}
                count={activePollOption ? activePollOption.count : 0}
                disableVoting={activePoll.archived} />
            { !activePoll.archived && <Nominate /> }
        </div>
    )
}

export default Poll;