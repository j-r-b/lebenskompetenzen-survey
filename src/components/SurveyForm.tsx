import React, { useState } from 'react';
import { surveyQuestions, scaleDefinitions } from '../data';

interface SurveyFormProps {
    onSubmit: (answers: Record<string, number>) => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onSubmit }) => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleOptionChange = (questionId: string, value: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const currentQuestion = surveyQuestions[currentIndex];
    const totalQuestions = surveyQuestions.length;
    const isLastQuestion = currentIndex === totalQuestions - 1;
    const isCurrentAnswered = answers[currentQuestion.id] !== undefined;

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isLastQuestion && isCurrentAnswered) {
            onSubmit(answers);
        }
    };

    const progressPercentage = ((currentIndex) / totalQuestions) * 100;

    const currentScale = scaleDefinitions[currentQuestion.scaleId];
    const scalePoints = Array.from({ length: currentScale.max - currentScale.min + 1 }, (_, i) => currentScale.min + i);

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-center text-slate-800">Benutzerumfrage 2026</h2>
                <p className="text-center text-slate-500">Kategorie: <span className="font-semibold text-indigo-600">{currentScale.name}</span></p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>Frage {currentIndex + 1} von {totalQuestions}</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Current Question Component */}
            <div className="bg-slate-50 p-6 rounded-xl min-h-[220px] flex flex-col justify-center mb-8 border border-slate-100 shadow-inner">
                <p className="mb-8 text-xl text-slate-800 font-medium text-center">{currentQuestion.text}</p>

                <div className="flex justify-between items-center sm:hidden mb-4 text-xs text-slate-500 px-2">
                    <span>{currentScale.minLabel}</span>
                    <span>{currentScale.maxLabel}</span>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <span className="hidden sm:inline text-sm text-slate-500 w-1/4 text-right pr-2">{currentScale.minLabel}</span>
                    <div className="flex justify-between w-full sm:w-2/4 px-4 gap-2">
                        {scalePoints.map((value) => (
                            <label key={value} className="flex flex-col items-center cursor-pointer group relative">
                                <input
                                    type="radio"
                                    name={currentQuestion.id}
                                    value={value}
                                    checked={answers[currentQuestion.id] === value}
                                    onChange={() => handleOptionChange(currentQuestion.id, value)}
                                    className="w-6 h-6 text-indigo-600 border-slate-300 focus:ring-indigo-500 mb-2 cursor-pointer transition-transform group-hover:scale-110"
                                />
                                <span className={`text-sm font-medium transition-colors ${answers[currentQuestion.id] === value ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}>
                                    {value}
                                </span>
                            </label>
                        ))}
                    </div>
                    <span className="hidden sm:inline text-sm text-slate-500 w-1/4 pl-2">{currentScale.maxLabel}</span>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all ${currentIndex === 0
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                >
                    Zurück
                </button>

                {isLastQuestion ? (
                    <button
                        type="submit"
                        disabled={!isCurrentAnswered}
                        className={`px-8 py-2.5 rounded-lg font-semibold text-white transition-all ${isCurrentAnswered
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Auswerten
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isCurrentAnswered}
                        className={`px-8 py-2.5 rounded-lg font-semibold transition-all ${isCurrentAnswered
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                            : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            }`}
                    >
                        Weiter
                    </button>
                )}
            </div>
        </form>
    );
};
