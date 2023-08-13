export interface PointJson {
    id: string,
    x: number,
    y: number,
    name: string
}

export interface LineJson {
    id: string,
    A: number, 
    B: string,
    C: string
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

export interface LinesPair {
    line1Id: string,
    line2Id: string
}

export interface SegmentLength {
    segmentEnd1Id: string,
    segmentEnd2Id: string,
    length: string
}

export interface AngleMeasure {
    angleEnd1Id: string,
    angleVertexId: string,
    angleEnd2Id: string,
    angleIsConvex: boolean,
    measure: string
}

export interface SegmentsEquality {
    segment1End1Id: string,
    segment1End2Id: string,
    segment2End1Id: string,
    segment2End2Id: string
}

export interface AnglesEquality {
    angle1End1Id: string,
    angle1VertexId: string,
    angle1End2Id: string,
    angle2End1Id: string,
    angle2VertexId: string,
    angle2End2Id: string
}

export interface MidPerpendicular {
    segmentEnd1Id: string,
    segmentEnd2Id: string,
    lineId: string
}

export interface Bisector {
    angleEnd1Id: string,
    angleVertexId: string,
    angleEnd2Id: string,
    angleIsConvex: boolean,
    lineId: string
}

export interface BoardSchemeJson {
    points: PointJson[];
    lines: LineJson[];
    circles: CircleJson[];
    perpendicular: LinesPair[];  
    parallel: LinesPair[];   
    equalSegments: SegmentsEquality[];
    equalAngles: AnglesEquality[];
    segmentLengths: SegmentLength[];
    angleMeasures: AngleMeasure[];
    formulas: string[];
    midPerpendicular: MidPerpendicular[];
    bisectors: Bisector[]
}