interface SortedVisits {
    [visitorName: string]: {
        [recordId: number]: { date: Date };
    };
}

interface VisitorRecord {
    id: number;
    name: string;
    date: string;
}
interface VisitorResponse {
    data: Array<VisitorRecord>;
    total: number;
}

interface VisitorResults {
    [name: string]: {
        numberOfTimesVisited: number;
    };
}

export { SortedVisits, VisitorResponse, VisitorResults };
