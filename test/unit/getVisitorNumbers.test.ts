import axios from 'axios';
import { mocked } from 'ts-jest/utils';
import getVisitorNumbers from '../../lib/getVisitorNumbers';

jest.mock('axios');

const mockedAxios = mocked(axios, true);

describe('Motorway Visit Script', () => {
    beforeEach(() => {
        // Tuesday 15th December 2020
        jest.spyOn(Date, 'now').mockReturnValue(1608029525212);
        mockedAxios.get.mockReset();
    });

    it('should not continue with the script if the login has failed', async () => {
        mockedAxios.get.mockRejectedValue(new Error('Failed'));

        await expect(getVisitorNumbers()).rejects.toThrow('Failed');
    });

    it('should return the correct result with the number of visits per person, breaking at the end with no results have returned', async () => {
        mockedAxios.get
            .mockResolvedValueOnce({ data: { token: 'test' } })
            .mockResolvedValueOnce({
                data: {
                    total: 111,
                    data: [
                        {
                            id: 1,
                            name: 'Visitor #1',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                        {
                            id: 2,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00', // Weekend
                        },
                        {
                            id: 3,
                            name: 'Visitor #2',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                    ],
                },
            })
            .mockResolvedValueOnce({
                data: {
                    total: 111,
                    data: [
                        {
                            id: 1, // Duplicate
                            name: 'Visitor #1',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                        {
                            id: 4,
                            name: 'Visitor #1',
                            date: '2020-12-15T23:40:30+00:00', // Current Day
                        },
                        {
                            id: 5,
                            name: 'Visitor #2',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                    ],
                },
            })
            .mockResolvedValue({ data: { data: [] } });

        const expectedResult = {
            'Visitor #1': { numberOfTimesVisited: 1 },
            'Visitor #2': { numberOfTimesVisited: 2 },
        };

        const actualResult = await getVisitorNumbers();

        expect(actualResult).toEqual(expectedResult);
    });

    it('should retry failed responses return the correct result with the number of visits per person', async () => {
        // Added two rejects two rejected, one resolved, one rejected and one resolved to simulate multiple requests failing
        mockedAxios.get
            .mockResolvedValueOnce({ data: { token: 'test' } })
            .mockRejectedValueOnce(new Error('Failed'))
            .mockRejectedValueOnce(new Error('Failed'))
            .mockResolvedValueOnce({
                data: {
                    total: 111,
                    data: [
                        {
                            id: 1,
                            name: 'Visitor #1',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                        {
                            id: 2,
                            name: 'Visitor #1',
                            date: '2020-12-12T23:40:30+00:00', // Weekend
                        },
                        {
                            id: 3,
                            name: 'Visitor #2',
                            date: '2020-12-09T23:40:30+00:00',
                        },
                    ],
                },
            })
            .mockRejectedValue(new Error('Failed'))
            .mockResolvedValue({ data: { data: [] } });

        const expectedResult = {
            'Visitor #1': { numberOfTimesVisited: 1 },
            'Visitor #2': { numberOfTimesVisited: 1 },
        };

        const actualResult = await getVisitorNumbers();

        expect(actualResult).toEqual(expectedResult);
    });

    it('should fail if failed responses have gone over the max retry count per responses', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { token: 'test' } }).mockRejectedValue(new Error('Failed'));

        await expect(getVisitorNumbers()).rejects.toThrow('Failed');

        expect(mockedAxios.get).toHaveBeenCalledTimes(6);
    });
});
