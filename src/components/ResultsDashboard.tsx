import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement
} from 'chart.js';
import { Radar, Chart } from 'react-chartjs-2';
import { BarWithErrorBarsController, BarWithErrorBar } from 'chartjs-chart-error-bars';
import { surveyQuestions, scaleDefinitions } from '../data';
import type { ScaleId } from '../data';

// Register standard Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement,
    BarWithErrorBarsController,
    BarWithErrorBar
);

interface ResultsDashboardProps {
    answers: Record<string, number> | null;
    onReset: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ answers, onReset }) => {
    const storedAnswersRaw = localStorage.getItem('survey_2026_answers');
    const validAnswers = answers || (storedAnswersRaw ? JSON.parse(storedAnswersRaw) : null);

    const stats = useMemo(() => {
        // Group questions by scaleId
        const grouped = surveyQuestions.reduce((acc, q) => {
            if (!acc[q.scaleId]) acc[q.scaleId] = [];
            acc[q.scaleId].push(q);
            return acc;
        }, {} as Record<string, typeof surveyQuestions>);

        const scaleIds = Object.keys(grouped) as ScaleId[];
        const result: Record<ScaleId, { mean: number; sd: number; values: number[]; scaleName: string; maxVal: number }> = {} as any;

        if (!validAnswers) {
            // Dummy data if validAnswers is null
            scaleIds.forEach(id => {
                const scale = scaleDefinitions[id];
                result[id] = { mean: (scale.max + scale.min) / 2, sd: 0.5, values: [], scaleName: scale.name, maxVal: scale.max };
            });
            return result;
        }

        scaleIds.forEach((id) => {
            const scale = scaleDefinitions[id];
            const qs = grouped[id];
            const vals: number[] = [];
            qs.forEach((q) => {
                const answer = validAnswers[q.id];
                if (answer !== undefined) {
                    // Inverse scoring dynamically using scale definition (max + min - answer)
                    const score = q.inverse ? (scale.max + scale.min - answer) : answer;
                    vals.push(score);
                }
            });

            if (vals.length === 0) {
                result[id] = { mean: 0, sd: 0, values: [], scaleName: scale.name, maxVal: scale.max };
                return;
            }

            const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
            let variance = 0;
            if (vals.length > 1) {
                variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length - 1);
            }
            result[id] = { mean, sd: Math.sqrt(variance), values: vals, scaleName: scale.name, maxVal: scale.max };
        });

        return result;
    }, [validAnswers]);

    const scaleIds = Object.keys(stats) as ScaleId[];
    const labels = scaleIds.map(id => stats[id].scaleName);
    const means = scaleIds.map((id) => stats[id].mean);

    // Radar Chart Data 
    // Note: Since scales might have different max values (e.g. 5 vs 7), 
    // comparing them purely visually on a shared Radar axis can be slightly skewed,
    // but standard for quick summary dashboards without normalization.
    const radarData = {
        labels: labels,
        datasets: [
            {
                label: 'Mittelwert',
                data: means,
                backgroundColor: 'rgba(79, 70, 229, 0.2)', // Indigo 600
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(79, 70, 229, 1)',
            },
        ],
    };

    const radarOptions = {
        scales: {
            r: {
                beginAtZero: true,
            },
        },
        maintainAspectRatio: false,
    };

    // Bar Chart Data with Error Bars
    const barData = {
        labels: labels,
        datasets: [
            {
                label: 'Mittelwert mit Standardabweichung',
                data: scaleIds.map((id) => {
                    const m = stats[id].mean;
                    const sd = stats[id].sd;
                    const scale = scaleDefinitions[id];
                    return {
                        y: m,
                        yMin: Math.max(scale.min, m - sd),
                        yMax: Math.min(scale.max, m + sd)
                    };
                }),
                backgroundColor: 'rgba(56, 189, 248, 0.6)', // Light Blue
                borderColor: 'rgba(14, 165, 233, 1)',
                borderWidth: 1,
                errorBarColor: '#333',
                errorBarLineWidth: 2,
            },
        ],
    };

    const barOptions = {
        scales: {
            y: {
                beginAtZero: true,
            }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold mb-4 text-center text-slate-800">Deine Auswertung</h2>
            <p className="text-center text-slate-500 mb-10">
                Vielen Dank für deine Teilnahme! Hier siehst du die Zusammenfassung deiner Antworten.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center border border-slate-100 shadow-inner">
                    <h3 className="text-xl font-semibold mb-6 text-slate-700">Skalen-Mittelwerte (Radar)</h3>
                    <div className="w-full h-80">
                        <Radar data={radarData} options={radarOptions} />
                    </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl flex flex-col items-center border border-slate-100 shadow-inner">
                    <h3 className="text-xl font-semibold mb-6 text-slate-700">Mittelwerte & Standardabweichung</h3>
                    <div className="w-full h-80">
                        <Chart type="barWithErrorBars" data={barData} options={barOptions} />
                    </div>
                </div>
            </div>

            {!validAnswers && (
                <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded-lg text-center shadow-sm">
                    Hinweis: Du hast die Umfrage bereits abgeschlossen. Da die Daten anonym erhoben wurden, siehst du hier keine detaillierten persönlichen Ergebnisse mehr.
                </div>
            )}

            <div className="mt-12 text-center">
                <button
                    onClick={onReset}
                    className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                >
                    Umfrage neu starten
                </button>
            </div>
        </div>
    );
};
