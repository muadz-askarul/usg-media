export type TPatient = {
    id?: string;
    name: string;
    patient_id: number;
};

export type TUsgImage = {
    id?: string;
    patient_id: number;
    examination_date: Date;
    url: string;
};
