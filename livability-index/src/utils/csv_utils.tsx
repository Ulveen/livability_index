import Papa from 'papaparse';
import { LivabilityIndex } from '../model/livabilityIndex';

export async function read_csv(path: string) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvText = await response.text();
        const results = Papa.parse<LivabilityIndex>(csvText, { header: true });
        return results.data;
    } catch (error) {
        console.error('There was an error!', error);
    }
}