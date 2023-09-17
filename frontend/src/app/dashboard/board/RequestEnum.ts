import { PolygonTypeEnum } from "./shared-enums/PolygonTypeEnum";

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
    { triangleType:  PolygonTypeEnum.SCALENE_RIGHT_TRIANGLE | PolygonTypeEnum.EQUILATERAL_TRIANGLE | PolygonTypeEnum.ISOSCELES_ACUTE_TRIANGLE | PolygonTypeEnum.ISOSCELES_RIGHT_TRIANGLE | PolygonTypeEnum.OBTUSE_ISOSCELES_TRIANGLE } |
    { trapezoidType: PolygonTypeEnum.SCALENE_TRAPEZOID | PolygonTypeEnum.ISOSCELES_TRAPEZOID | PolygonTypeEnum.RIGHT_TRAPEZOID }
