export function isPoint(object: any): boolean {
    return object.elType == 'point' || object.elType == 'glider';
}

export function isIntersectionPoint(object: any): boolean {
    return object.elType == 'intersection';
}

export function isLine(object: any): boolean {
    return object.elType == 'line' || object.elType == 'perpendicular' || object.elType == 'parallel' || object.elType == 'tangent';
}

export function isCircle(object: any): boolean {
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