import React from "react";
import { LivabilityIndex } from "../model/livabilityIndex";
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Bar, BarChart, Cell } from "recharts";

interface Props {
    data: LivabilityIndex[]
}

const LivabilityBarchart: React.FC<Props> = ({ data }) => {
    const livabilityData: { [key: string]: number } = {};
    const colorMapping: { [key: string]: string } = {
        High: '#82ca9d',
        Medium: '#ffc658',
        Low: '#ff7875',
    };
    data.forEach((item) => {
        if (!livabilityData[item.livability_index]) {
            livabilityData[item.livability_index] = 1;
        } else {
            livabilityData[item.livability_index]++;
        }
    });

    const chartData = ['Low', 'Medium', 'High'].map((livabilityIndex) => ({
        livabilityIndex,
        count: livabilityData[livabilityIndex] || 0,
    }));

    return (
        <ResponsiveContainer width="100%" height={550}>
            <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="livabilityIndex" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count">
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colorMapping[entry.livabilityIndex]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default LivabilityBarchart;