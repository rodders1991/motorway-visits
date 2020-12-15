import { determineVisitorResults, formatVisitorResponses } from '../../lib/utils';

describe('utils', () => {
    describe('formatVisitorResponses', () => {
        it('should format a single response correctly', () => {
            const testVisitorResponse = {
                total: 111,
                data: [
                    {
                        id: 1,
                        name: 'Visitor #1',
                        date: '2020-12-12T23:40:30+00:00',
                    },
                    {
                        id: 2,
                        name: 'Visitor #1',
                        date: '2020-12-12T23:40:30+00:00',
                    },
                    {
                        id: 3,
                        name: 'Visitor #2',
                        date: '2020-12-12T23:40:30+00:00',
                    },
                ],
            };

            const expectedResult = {
                'Visitor #1': {
                    '1': { date: new Date('2020-12-12T23:40:30+00:00') },
                    '2': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
                'Visitor #2': {
                    '3': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
            };

            const actualResult = formatVisitorResponses([testVisitorResponse]);

            expect(expectedResult).toEqual(actualResult);
        });

        it('should format multiple responses correctly', () => {
            const testVisitorResponse = [
                {
                    total: 111,
                    data: [
                        {
                            id: 1,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 2,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 3,
                            name: 'Visitor #2',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                    ],
                },
                {
                    total: 111,
                    data: [
                        {
                            id: 4,
                            name: 'Visitor #2',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 5,
                            name: 'Visitor #2',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 6,
                            name: 'Visitor #3',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                    ],
                },
            ];

            const expectedResult = {
                'Visitor #1': {
                    '1': { date: new Date('2020-12-12T23:40:30+00:00') },
                    '2': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
                'Visitor #2': {
                    '3': { date: new Date('2020-12-12T23:40:30+00:00') },
                    '4': { date: new Date('2020-12-12T23:40:30+00:00') },
                    '5': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
                'Visitor #3': {
                    '6': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
            };

            const actualResult = formatVisitorResponses(testVisitorResponse);

            expect(expectedResult).toEqual(actualResult);
        });

        it('should overwrite duplicate record ids in subsequent responses to account for dynamic data entry', () => {
            const testVisitorResponse = [
                {
                    total: 111,
                    data: [
                        {
                            id: 1,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 2,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 3,
                            name: 'Visitor #2',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                    ],
                },
                {
                    total: 111,
                    data: [
                        {
                            id: 3,
                            name: 'Visitor #2',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 1,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                        {
                            id: 6,
                            name: 'Visitor #3',
                            date: '2020-12-12T23:40:30+00:00',
                        },
                    ],
                },
            ];

            const expectedResult = {
                'Visitor #1': {
                    '1': { date: new Date('2020-12-12T23:40:30+00:00') },
                    '2': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
                'Visitor #2': {
                    '3': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
                'Visitor #3': {
                    '6': { date: new Date('2020-12-12T23:40:30+00:00') },
                },
            };

            const actualResult = formatVisitorResponses(testVisitorResponse);

            expect(expectedResult).toEqual(actualResult);
        });
    });
    describe('determineVisitorResults', () => {
        const testCurrentDate = new Date('2020-12-15T23:40:30+00:00');

        it('should count the correct number of times visited by filtering out weekends and not include visitors with 0 valid visits', () => {
            const testData = {
                'Visitor #1': {
                    '1': { date: new Date('2020-12-13T23:40:30+00:00') }, // Weekend
                    '2': { date: new Date('2020-12-14T23:40:30+00:00') },
                    '3': { date: new Date('2020-12-14T23:40:30+00:00') },
                },
                'Visitor #2': {
                    '3': { date: new Date('2020-12-13T23:40:30+00:00') }, // Weekend
                },
                'Visitor #3': {
                    '6': { date: new Date('2020-12-13T23:40:30+00:00') },
                },
            };

            const expectedResult = { 'Visitor #1': { numberOfTimesVisited: 2 } };

            const actualResult = determineVisitorResults(testCurrentDate, testData);

            expect(expectedResult).toEqual(actualResult);
        });

        it('should count the correct number of times visited by filtering out the current day and not include visitors with 0 valid visits', () => {
            const testData = {
                'Visitor #1': {
                    '1': { date: new Date('2020-12-15T23:40:30+00:00') }, // CurrentDay
                    '2': { date: new Date('2020-12-14T23:40:30+00:00') },
                },
                'Visitor #2': {
                    '3': { date: new Date('2020-12-15T23:40:30+00:00') }, // CurrentDay
                },
                'Visitor #3': {
                    '6': { date: new Date('2020-12-13T23:40:30+00:00') },
                },
            };

            const expectedResult = { 'Visitor #1': { numberOfTimesVisited: 1 } };

            const actualResult = determineVisitorResults(testCurrentDate, testData);

            expect(expectedResult).toEqual(actualResult);
        });
    });
});
