import {serviceNormalize} from "../common";

export interface IClassMetadata {
    module?: string;
    providers?: (Function | string)[];
}

export interface IClassType {
    $inject?: string[];
    name?: string;
    $injectDecorator?: string[];
}

export function updateTargetMetadata(target: any, metadata: IClassMetadata) {
    // Si no se especifica modulo al que pertenece, se establecer "auto" por defecto.
    if (!angular.isDefined(metadata.module)) {
        metadata.module = "auto";
    }
}

export function setTarget$Inject(target : IClassType, metadata: IClassMetadata) {
    if (metadata.providers) {
        const $inject = target.$inject = target.$inject || [];
        for (let i = 0; i < metadata.providers.length; i++) {
            const token = metadata.providers[i];
            const name = typeof token === "string" ? token : serviceNormalize((token as any).name);
            if ($inject.length === i) {
                $inject.push();
            }
            $inject[i] = name;
        }
    }
    if (target.$injectDecorator) {
        const $inject = target.$inject = target.$inject || [];
        for (let i = 0; i < target.$injectDecorator.length; i++) {
            if ($inject.length === i) {
                $inject.push("");
            }
            $inject[i] = target.$injectDecorator[i];
        }
    }
}

