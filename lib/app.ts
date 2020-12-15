import getVisitorNumbers from './getVisitorNumbers';

export default async function runApp(): Promise<void> {
    const visitorResponse = await getVisitorNumbers();

    console.log(visitorResponse);
}
