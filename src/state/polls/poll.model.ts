import { ID } from '@datorama/akita';

export interface Poll {
    id: string;
    title: string;
    options: PollOption[];
    archived: boolean;
    order: number;
}

export interface PollOption {
    imdbId: string;
    count: number;
    hasVotedUids: string[];
    submittedUid: string;
}

export type PollOptionOrder = string[];
export type PollOptionOrderMap = Record<string, PollOptionOrder>;