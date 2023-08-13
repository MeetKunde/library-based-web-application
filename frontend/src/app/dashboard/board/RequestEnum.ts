export enum RequestEnum {
    FORMULA,
    LENGTH,
    MEASURE,
    ANGLE_IS_CONVEX,
    PARTS_NUMBER_TO_DIVIDE_SEGMENT,
    PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE
};

export type AnswearType = 
    { formula: string } |
    { length: string } |
    { measure: string, angleIsConvex: boolean } |
    { angleIsConvex: boolean } |
    { partsNumber: number } |
    { partsNumber: number, angleIsConvex: boolean }
