export function isPoint(object: any): boolean {
    return object.elType == 'point' || object.elType == 'glider';
}

export function isIntersectionPoint(object: any): boolean {
    return object.elType == 'intersection';
}

export function isLine(object: any): boolean {
    return object.elType == 'line' || object.elType == 'perpendicular' || object.elType == 'parallel';
}

export function isCircle(object: any): boolean {
    return object.elType == 'circle';
}

export function xCoord(point: any): number {
    return point.coords.usrCoords[1];
}

export function yCoord(point: any): number {
    return point.coords.usrCoords[2];
}

export function distance(point1: any, point2: any): number {
    const dx = point1.coords.usrCoords[1] - point2.coords.usrCoords[1];
    const dy = point1.coords.usrCoords[2] - point2.coords.usrCoords[2];

    return Math.sqrt(dx * dx + dy * dy);
}
