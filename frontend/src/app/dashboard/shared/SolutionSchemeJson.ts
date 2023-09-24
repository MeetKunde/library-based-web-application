import { 
    PointJson, LineJson, CircleJson 
} from "./CommonJsons"
import { AngleTypeEnum } from "./enums/AngleTypeEnum";
import { DependencyCategoryEnum } from "./enums/DependencyCategoryEnum";
import { DependencyImportanceEnum } from "./enums/DependencyImportanceEnum";
import { DependencyReasonEnum } from "./enums/DependencyReasonEnum";
import { DependencyTypeEnum } from "./enums/DependencyTypeEnum"
import { PolygonTypeEnum } from "./enums/PolygonTypeEnum";

export interface Intersections {
    line_line: number[][][];
    circle_circle: number[][][];
    line_circle: number[][][];
    points_on_line_line: [number, number][][];
    points_on_circle_circle: [number, number][][];
    points_on_line_circle: [number, number][][];
}

export interface DependencyTemplate<Object1Type, Object2Type> {
    object1: Object1Type;
    object2: Object2Type;
    id: number;
    category: DependencyCategoryEnum;
    type: DependencyTypeEnum;
    reasons: DependencyReasonEnum[];
    dependentDependencies: number[][];
    importances: DependencyImportanceEnum[];
}

export interface IdHolderObject {
    id: string;
}

export interface AngleModelObject {
    point1Id: string;
    vertexId: string;
    point2Id: string;
    type: AngleTypeEnum;
}

export interface PointsPairModelObject {
    end1Id: string;
    end2Id: string;
}

export interface ExpressionModelObject {
    value: string;
    variables: string[];
}

export interface PolygonModelObject {
    verticesIds: string[];
}

export interface ModelsPairModelObject<Type> {
    first: Type;
    second: Type;
}

export type EquationDependency = DependencyTemplate<ExpressionModelObject, ExpressionModelObject>;

export type Dependency = 
(
    EquationDependency |
    DependencyTemplate<PolygonModelObject, PolygonTypeEnum> |
    DependencyTemplate<IdHolderObject, IdHolderObject> |
    DependencyTemplate<PointsPairModelObject, PointsPairModelObject> |
    DependencyTemplate<AngleModelObject, AngleModelObject> |
    DependencyTemplate<IdHolderObject, AngleModelObject> |
    DependencyTemplate<IdHolderObject, PolygonModelObject> |
    DependencyTemplate<IdHolderObject, PointsPairModelObject> |
    DependencyTemplate<PolygonModelObject, PolygonModelObject>
)

export interface SolutionSchemeJson {
    points: PointJson[],
    lines: LineJson[],
    cicles: CircleJson[],
    intersections: Intersections,
    indexes_of_variables: string[][],
    dependencies: Dependency[]
}