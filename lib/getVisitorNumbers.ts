import axios from 'axios';
import login from './login';
import { SortedVisits } from './types';
import { determineVisitorResults, formatVisitorResponses } from './utils';

const BASE_VISIT_URL = 'https://motorway-challenge-api.herokuapp.com/api/visits';

interface VisitorRecord {
    id: number;
    name: string;
    date: string;
}
interface VisitorResponse {
    data: Array<VisitorRecord>;
    total: number;
}

async function* getVisitorResponse(token: string): AsyncGenerator<VisitorResponse, VisitorResponse> {
    const maxRetries = 5;
    let retryCount = 0;
    let page = 1;

    while (true) {
        const requestUrl = `${BASE_VISIT_URL}?token=${token}&page=${page}`;

        try {
            const response = await axios.get<VisitorResponse>(requestUrl);

            page++;
            yield response.data;
        } catch (err) {
            retryCount++;

            if (retryCount === maxRetries) {
                console.error(`Failed to get visitor and hit max retries for url ${requestUrl}`, err);

                throw err;
            }
            console.log(`Failed to get visitor responses for url ${requestUrl}, retrying (retry count ${maxRetries})`);

            continue;
        }
    }
}

const getVisitorNumbers = async (): Promise<SortedVisits> => {
    let token = '';

    try {
        token = await login();
    } catch (err) {
        console.error('Failed to login');

        throw err;
    }

    let emptyResponse = false;
    const responses = [];
    const responseGenerator = getVisitorResponse(token);

    while (!emptyResponse) {
        const { value: visitorResponse } = await responseGenerator.next();

        emptyResponse = visitorResponse.data.length === 0;

        responses.push(visitorResponse);
    }

    const sortedVisits = formatVisitorResponses(responses);

    const currentDate = new Date(Date.now());

    return determineVisitorResults(currentDate, sortedVisits);
};

export default getVisitorNumbers;
