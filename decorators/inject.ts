import {updateTargetMetadata, IClassMetadata, IClassType} from "./metadata";
import {serviceNormalize} from "../common";

/**
 * Says to angular how and where inject a service or angular 1 component.
 */
export function Inject(token: Function | string) {
    return (target: any, key: string, index: number) => {
        
        // Create $injectDecorator array if not exists
        const $inject = target.$injectDecorator = target.$injectDecorator || [];
        // Obtain the name of service to put on $injectDecorator
        var name = typeof token === "string" ? token : serviceNormalize((token as any).name);
        // Ensure  array position exists
        while ($inject.length < index) {
            $inject.push("");
        }
        // Set the injection in the correct position.
        $inject[index] = name;
    }
}
