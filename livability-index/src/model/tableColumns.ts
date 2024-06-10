import { LivabilityIndex } from "./livabilityIndex";

const sortValue = [
    { name: 'low', value: 1 },
    { name: 'medium', value: 2 },
    { name: 'high', value: 3 }
];

const caseInsensitiveSort = (rowA: any, rowB: any) => {
    const a = rowA.livability_index.toLowerCase();
    const b = rowB.livability_index.toLowerCase();

    const valueA = sortValue.find(item => item.name === a)?.value || 0;
    const valueB = sortValue.find(item => item.name === b)?.value || 0;

    if (valueA > valueB) {
        return 1;
    }

    if (valueB > valueA) {
        return -1;
    }

    return 0;
};

export const columns = [
    {
        name: 'Province',
        selector: (row: LivabilityIndex) => row.province
    },
    {
        name: 'Year',
        selector: (row: LivabilityIndex) => row.year
    },
    {
        name: 'Health Index',
        selector: (row: LivabilityIndex) => row.health_index,
    },
    {
        name: 'Polution',
        selector: (row: LivabilityIndex) => row.polution,
    },
    {
        name: 'Crime Rate',
        selector: (row: LivabilityIndex) => row.crime_rate,
    },
    {
        name: 'Purchasing Power',
        selector: (row: LivabilityIndex) => row.purchasing_power,
    },
    {
        name: 'Living Cost Stddev',
        selector: (row: LivabilityIndex) => row.living_cost,
        cell: (row: any) => row.living_cost.toFixed(2)
    },
    {
        name: 'Livability Index',
        selector: (row: LivabilityIndex) => row.livability_index,
        sortable: true,
        sortFunction: caseInsensitiveSort,
        conditionalCellStyles: [
            {
                when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'low',
                style: {
                    backgroundColor: 'rgba(255, 0, 0, 0.5)',
                    color: 'black',
                },
            },
            {
                when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'medium',
                style: {
                    backgroundColor: 'rgba(255, 165, 0, 0.5)',
                    color: 'black',
                },
            },
            {
                when: (row: LivabilityIndex) => row.livability_index.toLowerCase() === 'high',
                style: {
                    backgroundColor: 'rgba(0, 128, 0, 0.5)',
                    color: 'black',
                },
            },
        ],
    }
]