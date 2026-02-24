export type ScaleId = 'Usability' | 'Design' | 'Funktion';

export interface ScaleDefinition {
    id: ScaleId;
    name: string;
    min: number;
    max: number;
    minLabel: string;
    maxLabel: string;
}

export const scaleDefinitions: Record<ScaleId, ScaleDefinition> = {
    Usability: { id: 'Usability', name: 'Usability', min: 1, max: 5, minLabel: 'stimme gar nicht zu', maxLabel: 'stimme voll zu' },
    Design: { id: 'Design', name: 'Design', min: 1, max: 7, minLabel: 'trifft überhaupt nicht zu', maxLabel: 'trifft voll und ganz zu' },
    Funktion: { id: 'Funktion', name: 'Funktion', min: 0, max: 4, minLabel: 'nie', maxLabel: 'immer' }
};

export interface Question {
    id: string;
    scaleId: ScaleId;
    text: string;
    inverse?: boolean;
}

export const surveyQuestions: Question[] = [
    // Usability (1-5)
    { id: 'q1', scaleId: 'Usability', text: 'Die Bedienung der App ist intuitiv und leicht verständlich.' },
    { id: 'q2', scaleId: 'Usability', text: 'Ich finde mich in der Navigation schnell zurecht.' },
    { id: 'q3', scaleId: 'Usability', text: 'Aufgaben lassen sich nur mit viel Nachdenken erledigen.', inverse: true },
    // Design (1-7)
    { id: 'q4', scaleId: 'Design', text: 'Das visuelle Erscheinungsbild ist modern und ansprechend.' },
    { id: 'q5', scaleId: 'Design', text: 'Die Farben und Typografie unterstützen die Lesbarkeit gut.' },
    { id: 'q6', scaleId: 'Design', text: 'Das Layout wirkt aufgeräumt und nicht überladen.' },
    // Funktion (0-4)
    { id: 'q7', scaleId: 'Funktion', text: 'Die angebotenen Funktionen erfüllen meine Erwartungen vollständig.' },
    { id: 'q8', scaleId: 'Funktion', text: 'Die Anwendung reagiert sehr träge auf meine Eingaben.', inverse: true },
    { id: 'q9', scaleId: 'Funktion', text: 'Es gibt keine störenden Fehler oder Abstürze bei der Nutzung.' },
];
