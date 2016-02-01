import {updateTargetMetadata, IClassMetadata, IClassType} from "./metadata";
import {Bootstrapper} from "../bootstrapper";

export interface IComponentMetadata extends angular.IComponentOptions, IClassMetadata {
    directives?: (string | Function)[];
}

export interface IComponentType extends IClassType {
    $componentMetadata?: IComponentMetadata;
    $routeConfig?: angular.RouteDefinition[];
}

export function setComponent$routeConfig(target: IComponentType, metadata: IComponentMetadata) {
    if (metadata.$routeConfig) {
        target.$routeConfig = metadata.$routeConfig;
    }
}

/***
 * Decorador de clases que implementan un componente.
 */
export function Component(metadata: IComponentMetadata) {
    return (target: IComponentType) => {
        metadata = target.$componentMetadata = angular.extend(/*target.$componentMetadata ||*/ {}, metadata);

        updateTargetMetadata(target, metadata);

        Bootstrapper.AddComponent(target);

        return target as any;
    };
}