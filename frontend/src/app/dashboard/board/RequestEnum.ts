import { PolygonType } from "./PolygonType";

export enum RequestEnum {
    FORMULA,
    LENGTH,
    MEASURE,
    ANGLE_IS_CONVEX,
    PARTS_NUMBER_TO_DIVIDE_SEGMENT,
    PARTS_NUMBER_AND_IS_CONVEX_TO_DIVIDE_ANGLE,
    PERIMETER,
    AREA,
    POLYGON_SIDES_NUMBER,
    TRIANGLE_TYPE,
    TRAPEZOID_TYPE
};

export type AnswearType = 
    { formula: string } |
    { length: string } |
    { measure: string, angleIsConvex: boolean } |
    { angleIsConvex: boolean } |
    { partsNumber: number } |
    { partsNumber: number, angleIsConvex: boolean } |
    { perimeter: string } |
    { area: string } |
    { sides: number } |
    { triangleType: /*PolygonType.SCALENE_ACUTE_TRIANGLE |*/ PolygonType.SCALENE_RIGHT_TRIANGLE | PolygonType.EQUILATERAL_TRIANGLE | PolygonType.ISOSCELES_ACUTE_TRIANGLE | PolygonType.ISOSCELES_RIGHT_TRIANGLE | /*PolygonType.OBTUSE_SCALENE_TRIANGLE |*/ PolygonType.OBTUSE_ISOSCELES_TRIANGLE } |
    { trapezoidType: PolygonType.SCALENE_TRAPEZOID | PolygonType.ISOSCELES_TRAPEZOID | PolygonType.RIGHT_TRAPEZOID }
