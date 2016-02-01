import {updateTargetMetadata, IClassMetadata, IClassType} from "./metadata";
import {Bootstrapper} from "../bootstrapper";

export interface IDirectiveMetadata extends angular.IDirective, IClassMetadata {
}

export interface IDirectiveType extends IClassType {
    $directiveMetadata?: IDirectiveMetadata;
}

/***
 * Decorador de clases que implementan una directiva.
*/
export function Directive(metadata: IDirectiveMetadata) {
    return (target: IDirectiveType) => {
        metadata = target.$directiveMetadata = angular.extend(/*target.$directiveMetadata ||*/ {}, metadata);

        updateTargetMetadata(target, metadata);

        Bootstrapper.AddDirective(target);

        return target as any;
    };
}