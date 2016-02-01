import {updateTargetMetadata, IClassMetadata, IClassType} from "./metadata";
import {Bootstrapper} from "../bootstrapper";

export interface IInjectableMetadata extends IClassMetadata {
}

export interface IInjectableType extends IClassType {
    $injectableMetadata?: IInjectableMetadata;
}

/***
 * Decorador de clases que implementan un servicio injectable.
*/
export function Injectable(metadata: IInjectableMetadata = {}) {
    return (target: IInjectableType) => {
        metadata = target.$injectableMetadata = angular.extend(/*target.$injectableMetadata ||*/ {}, metadata);

        updateTargetMetadata(target, metadata);

        Bootstrapper.AddInjectable(target as any);

        return target as any;
    };
}