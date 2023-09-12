export function isPoint(object: any): boolean {
    if(isTechnicalObject(object)) { return false; }

    return object.elType == 'point' || object.elType == 'glider';
}

export function isIntersectionPoint(object: any): boolean {
    if(isTechnicalObject(object)) { return false; }

    return object.elType == 'intersection';
}

export function isTechnicalObject(object: any): boolean {
    const technicalObject: string[] = [
        "jxgBoard1_infobox",
        "jxgBoard1P1",
        "jxgBoard1P1Label",
        "jxgBoard1P3",
        "jxgBoard1P4",
        "jxgBoard1L5",
        "jxgBoard1P6",
        "jxgBoard1P7",
        "jxgBoard1L8",
        "jxgBoard1P9",
        "jxgBoard1P10",
        "jxgBoard1L11",
        "jxgBoard1C12",
        "jxgBoard1P13",
        "jxgBoard1P14",
        "jxgBoard1L15",
        "jxgBoard1P16",
        "jxgBoard1L17",
        "jxgBoard1G18",
        "jxgBoard1G19"
    ];

    return technicalObject.filter((id) => id == object.id).length > 0;
}

export function isLine(object: any): boolean {
    if(isTechnicalObject(object)) { return false; }

    return object.elType == 'line' || object.elType == 'perpendicular' || object.elType == 'parallel' || object.elType == 'tangent';
}

export function isCircle(object: any): boolean {
    if(isTechnicalObject(object)) { return false; }

    return object.elType == 'circle' || object.elType == 'circumcircle' || object.elType == 'incircle';
}

export function xCoord(point: any): number {
    return point.coords.usrCoords[1];
}

export function yCoord(point: any): number {
    return point.coords.usrCoords[2];
}

export function coords(point: any): [number, number] {
    return [xCoord(point), yCoord(point)];
}

export function distance(point1: any, point2: any): number {
    const dx = point1.coords.usrCoords[1] - point2.coords.usrCoords[1];
    const dy = point1.coords.usrCoords[2] - point2.coords.usrCoords[2];

    return Math.sqrt(dx * dx + dy * dy);
}

export function genRandom(lowerBound: number, upperBound: number): number {
    return lowerBound + (upperBound - lowerBound) * Math.random();
}