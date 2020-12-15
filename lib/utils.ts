import { SortedVisits, VisitorResponse, VisitorResults } from './types';

const isWeekend = (date: Date): boolean => {
    const dateDay = date.getDay();

    return dateDay === 0 || dateDay === 6;
};

const isTodaysDate = (currentDate: Date, inputDate: Date): boolean =>
    currentDate.getDate() == inputDate.getDate() &&
    currentDate.getMonth() == inputDate.getMonth() &&
    currentDate.getFullYear() == inputDate.getFullYear();

const determineVisitorResults = (currentDate: Date, sortedVisits: SortedVisits): VisitorResults =>
    Object.entries(sortedVisits).reduce((visitorResults, [name, visits]) => {
        // Filter invalid dates
        const validVisits = Object.values(visits).filter(
            ({ date }) => !isWeekend(date) && !isTodaysDate(currentDate, date),
        );

        // Only add to results if they have valid visits
        const visitResult = validVisits.length ? { [name]: { numberOfTimesVisited: validVisits.length } } : {};

        return {
            ...visitorResults,
            ...visitResult,
        };
    }, {} as VisitorResults);

const formatVisitorResponses = (vistorResponses: Array<VisitorResponse>): SortedVisits =>
    vistorResponses.reduce((sortedVisits, response) => {
        const { data } = response;

        data.forEach((visitor) => {
            const { name, id, date } = visitor;
            const currentVisits = sortedVisits[name] || {};

            // Overwrite duplicate record ids in subsequent responses to account for dynamic data entry
            sortedVisits[name] = {
                ...currentVisits,
                [id]: { date: new Date(date) },
            };
        });

        return sortedVisits;
    }, {} as SortedVisits);

export { determineVisitorResults, formatVisitorResponses };
