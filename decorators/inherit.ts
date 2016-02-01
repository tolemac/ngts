import {IClassMetadata, IClassType} from "./metadata";
import {Bootstrapper} from "../bootstrapper";
import {IInjectableType} from "./injectable";
import {IDirectiveType} from "./directive";
import {IComponentType} from "./component";


/***
 * Decorador de clases que implementan un servicio injectable.
*/
export function Inherit(fromType: IInjectableType | IDirectiveType | IComponentType) {
    return (target: IInjectableType | IDirectiveType | IComponentType) => {
        // Injectable metadata
        InheritProperty(fromType, target, "$injectableMetadata");

        // Directive metadata
        InheritProperty(fromType, target, "$directiveMetadata");

        // component metadata
        InheritProperty(fromType, target, "$componentMetadata");

        // $injectDecorator
        if (fromType.$injectDecorator) {
            target.$injectDecorator = [];
            angular.forEach(fromType.$injectDecorator, (value) => target.$injectDecorator.push(value));
        }

        // $inject
        if (fromType.$inject) {
            target.$inject = [];
            angular.forEach(fromType.$inject, (value) => target.$inject.push(value));
        }

        return target as any;
    };
}

function InheritProperty(fromType: any, target: any, property: string) {
    let _fromType = fromType;
    let _targetType = target;
    let _fromMetadata = _fromType[property];
    let _targetMetadata = _targetType[property];
    if (_fromType[property]) {
        _targetType[property] = angular.extend({}, _fromMetadata);
        angular.extend(_targetType[property], _targetMetadata);
    }
}