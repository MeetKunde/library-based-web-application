import { AngleTypeEnum } from "../shared/enums/AngleTypeEnum"
import { LineTypeEnum } from "../shared/enums/LineTypeEnum"
import { PolygonTypeEnum } from "../shared/enums/PolygonTypeEnum"

export interface PointJson {
    id: string,
    x: number,
    y: number,
    name: string
}

export interface LineJson {
    id: string,
    a: number, 
    b: number,
    type: LineTypeEnum,
    pointsOn: string[]
}

export interface CircleJson {
    id: string,
    cx: number,
    cy: number,
    r: number,
    centerId: string,
    pointsOn: string[]
}

export interface LinesPairJson {
    line1Id: string,
    line2Id: string
}

export interface SegmentsPairJson {
    segment1End1Id: string,
    segment1End2Id: string,
    segment2End1Id: string,
    segment2End2Id: string
}

export interface AnglesPairJson {
    angle1End1Id: string,
    angle1VertexId: string,
    angle1End2Id: string,
    angle2End1Id: string,
    angle2VertexId: string,
    angle2End2Id: string
}

export interface SegmentLineJson {
    segmentEnd1Id: string,
    segmentEnd2Id: string,
    lineId: string
}

export interface AngleLineJson {
    angleEnd1Id: string,
    angleVertexId: string,
    angleEnd2Id: string,
    angleType: AngleTypeEnum,
    lineId: string
}

export interface LineCircleJson {
    lineId: string,
    circleId: string
}

export interface CirclesPairJson {
    circle1Id: string,
    circle2Id: string
}

export interface CirclePolygonJson {
    circleId: string,
    polygonVerticesIds: string[]
}

export interface TriangleCircleJson {
    circleId: string,
    polygonVerticesIds: string[]
}

export interface PolygonTypeJson {
    polygonVerticesIds: string[],
    polygonType: PolygonTypeEnum
}

export interface PolygonSegmentJson {
    polygonVerticesIds: string[]
    segmentEnd1Id: string,
    segmentEnd2Id: string,
}

export interface SegmentsTripleJson {
    segment1End1Id: string,
    segment1End2Id: string,
    segment2End1Id: string,
    segment2End2Id: string,
    segment3End1Id: string,
    segment3End2Id: string
}

export interface SegmentLengthJson {
    segmentEnd1Id: string,
    segmentEnd2Id: string,
    length: string
}

export interface AngleMeasureJson {
    angleEnd1Id: string,
    angleVertexId: string,
    angleEnd2Id: string,
    angleIsConvex: boolean,
    measure: string
}

export interface PolygonPerimeterJson {
    polygonVerticesIds: string[],
    perimeter: string
}

export interface PolygonAreaJson {
    polygonVerticesIds: string[],
    area: string
}