import { 
    PointJson, LineJson, CircleJson, 
    LinesPairJson, SegmentsPairJson, AnglesPairJson, CirclesPairJson,
    SegmentLineJson, AngleLineJson, LineCircleJson, CirclePolygonJson, TriangleCircleJson, 
    PolygonTypeJson, PolygonSegmentJson, 
    SegmentLengthJson, AngleMeasureJson, PolygonPerimeterJson, PolygonAreaJson
} from "./CommonJsons";

export interface BoardSchemeJson {
    points: PointJson[];
    lines: LineJson[];
    circles: CircleJson[];
    perpendicularLines: LinesPairJson[];  
    parallelLines: LinesPairJson[];   
    equalSegments: SegmentsPairJson[];
    equalAngles: AnglesPairJson[];
    midPerpendiculars: SegmentLineJson[];
    bisectors: AngleLineJson[]
    tangentLines: LineCircleJson[];
    tangentCircles: CirclesPairJson[];
    circumscribedCircles: CirclePolygonJson[];
    inscribedCircles: CirclePolygonJson[];
    escribedCircles: TriangleCircleJson[];
    polygonTypes: PolygonTypeJson[];
    medians: PolygonSegmentJson[];
    altitudes: PolygonSegmentJson[];
    midSegments: PolygonSegmentJson[];
    segmentLengths: SegmentLengthJson[];
    angleMeasures: AngleMeasureJson[];
    perimeters: PolygonPerimeterJson[];
    areas: PolygonAreaJson[];
    formulas: string[];
}