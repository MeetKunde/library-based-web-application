import { 
    PointJson, LineJson, CircleJson 
} from "./CommonJsons"
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
    reason: DependencyReasonEnum;
    basedOn: number[];
    importance: DependencyImportanceEnum;
}

export interface IdHolder {
    id: number;
}


export interface PointModelRecord {
   
}


export interface LineModelRecord {
    
}


export interface CircleModelRecord {
    
}

export interface AngleModel {
    
}

export interface PointsPairModel {
    
}

export interface Formula {
    
}

export interface PolygonModel {
    
}

export interface ModelsPairModel<Type> {
    
}

export interface DependenciesGroupJson {
    type: DependencyTypeEnum;
    dependencies: (
        DependencyTemplate<Formula, Formula> |
        DependencyTemplate<PolygonModel, PolygonTypeEnum> |
        DependencyTemplate<IdHolder, IdHolder> |
        DependencyTemplate<PointsPairModel, PointsPairModel> |
        DependencyTemplate<AngleModel, AngleModel> |
        DependencyTemplate<IdHolder, AngleModel> |
        DependencyTemplate<IdHolder, PolygonModel> |
        DependencyTemplate<IdHolder, PointsPairModel> |
        DependencyTemplate<PolygonModel, PolygonModel> |
        DependencyTemplate<ModelsPairModel<PointsPairModel>, PointsPairModel>
    )[];
}

export interface SolutionSchemeJson {
    points: PointJson[],
    lines: LineJson[],
    cicles: CircleJson[],
    intersections: Intersections,
    indexes_of_variables: string[][],
    dependencies: DependenciesGroupJson[]
}