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

export interface BoardSchemeJson {
    points: PointJson[];
    lines: LineJson[];
    circles: CircleJson[];
    perpendicular: [string, string][];
    parallel: [string, string][];
}