import {IInjectableMetadata, IInjectableType} from "./decorators/injectable";
import {IDirectiveMetadata, IDirectiveType} from "./decorators/directive";
import {IComponentMetadata, IComponentType, setComponent$routeConfig} from "./decorators/component";
import * as Common from "./common";
import {IClassMetadata, IClassType, setTarget$Inject} from "./decorators/metadata";

export class Bootstrapper {

    static injectables: IInjectableType[] = [];
    static components: IComponentType[] = [];
    static directives: IDirectiveType[] = [];
    static defaultControllerAs : string;

    static AddInjectable(injectable: IInjectableType) {
        this.injectables.push(injectable);
    }
    static AddComponent(component: IComponentType) {
        this.components.push(component);
    }
    static AddDirective(directive: IDirectiveType) {
        this.directives.push(directive);
    }
}

export class ModuleBootstrapper {
    private injectables: IInjectableType[] = [];
    private directives: IDirectiveType[] = [];
    private components: IComponentType[] = [];
    private app: ng.IModule;

    constructor(private moduleName: string, private dependencies: string[] = []) {
    }

    private registerServices() {
        // Añadir los servicios globales buscando por nombre de módulo
        Bootstrapper.injectables.forEach((item: IInjectableType) => {
            if (item.$injectableMetadata.module === this.moduleName)
                this.addInjectable(item);
        });

        this.injectables.forEach((item: IInjectableType) => {
            // Establecemos $inject con los valores de los metadatos.
            setTarget$Inject(item, item.$injectableMetadata);
            // Registramos el injectable como servicio.
            this.app.service(Common.serviceNormalize(item.name), item as Function);
        });
    }

    private registerDirectives() {
        // Añadir las directivas globales buscando por nombre de módulo
        Bootstrapper.directives.forEach((item: IDirectiveType) => {
            if (item.$directiveMetadata.module === this.moduleName)
                this.addDirective(item);
        });

        this.directives.forEach((item: IDirectiveType) => {
            // Establecer controller as por defecto si se ha indicado.
            if (!item.$directiveMetadata.controllerAs && Bootstrapper.defaultControllerAs) {
                item.$directiveMetadata.controllerAs = Bootstrapper.defaultControllerAs;
            }
            
            // Establecer $inject.
            setTarget$Inject(item, item.$directiveMetadata);

            // Crear ddo con el elemento como controlador.
            const ddo: any = {
                controller: item
            }
            // Añadir al ddo la información de la directiva.
            angular.extend(ddo, item.$directiveMetadata);
            const directiveName = Common.serviceNormalize(item.name);
            // Crear el directive factory y pasar opciones que van al factory
            const factory: any = () => ddo;

            angular.forEach(ddo, (val, key) => {
                if (key.charAt(0) === "$") {
                    factory[key] = val;
                }
            });

            // registrar la directiva.
            this.app.directive(directiveName, factory);
        });
    }

    private registerComponents() {
        // Añadir los componentes globales buscando por nombre de módulo
        Bootstrapper.components.forEach((item: IComponentType) => {
            if (item.$componentMetadata.module === this.moduleName)
                this.addComponent(item);
        });

        this.components.forEach((item: IComponentType) => {
            // Establecer controller as por defecto si se ha indicado.
            if (!item.$componentMetadata.controllerAs && Bootstrapper.defaultControllerAs) {
                item.$componentMetadata.controllerAs = Bootstrapper.defaultControllerAs;
            }

            if (!item.$componentMetadata.restrict) {
                item.$componentMetadata.restrict = "AE";
            }
            // Establecer $inject.
            setTarget$Inject(item, item.$componentMetadata);
            setComponent$routeConfig(item, item.$componentMetadata);
            
            // Crear componentOptions con el elemento como controlador.
            const options: ng.IComponentOptions = {
                controller: item as any
            }

            // Añadir al ddo la información de la directiva.
            angular.extend(options, item.$componentMetadata);
            const componentName = Common.serviceNormalize(item.name);
            // registrar la directiva.
            this.app.component(componentName, options);
        });
        
    }

    private registerItems() {
        this.registerServices();
        this.registerDirectives();
        this.registerComponents();
    }

    private bootstrapInternal() {
        angular.bootstrap(document.documentElement, [this.moduleName]);
    }

    addInjectable(injectable: IInjectableType) {
        if (this.injectables.indexOf(injectable) < 0)
            this.injectables.push(injectable);
    }

    addDirective(directive: IDirectiveType) {
        if (this.directives.indexOf(directive) < 0)
            this.directives.push(directive);
    }

    addComponent(component: IComponentType) {
        if (this.components.indexOf(component) < 0)
            this.components.push(component);
    }

    addDepencency(dependency: string) {
        if (this.dependencies.indexOf(dependency) < 0)
            this.dependencies.push(dependency);
    }

    createModule(configuration?: any[], components?: any[]) {
        this.app = angular.module(this.moduleName, this.dependencies || []);
        decorateController(this.app);
        this.registerItems();
        if (configuration)
            this.app.config(configuration);
    }

    bootStrap(configuration?, components?: any[]) {
        // Asumir que los tipos registrados con module: "auto" son para el módulo que arranca.
        Bootstrapper.injectables.forEach((item) => {
            if (item.$injectableMetadata.module === "auto")
                item.$injectableMetadata.module = this.moduleName;
        });
        Bootstrapper.directives.forEach((item) => {
            if (item.$directiveMetadata.module === "auto")
                item.$directiveMetadata.module = this.moduleName;
        });
        Bootstrapper.components.forEach((item) => {
            if (item.$componentMetadata.module === "auto")
                item.$componentMetadata.module = this.moduleName;
        });

        this.createModule(configuration, components);
        this.bootstrapInternal();
    }
}

let thereIsRouterRootComponent = false;
const directiveFactory = {};

function compilerProviderDecorator($compileProvider) {
    var directive = $compileProvider.directive;
    $compileProvider.directive = function (name, factory) {
        directiveFactory[name] = factory;
        return directive.apply(this, arguments);
    };
}

function decorateController(app: ng.IModule) {
    angular.module("ng").config(["$compileProvider", compilerProviderDecorator]);

    app.config(["$provide", ($provide: ng.auto.IProvideService) => {
        $provide.decorator("$controller", ["$injector", "$delegate", ($injector, $delegate) => {
            const origDelegate = $delegate;

            return function (_class) {
                const component = origDelegate.apply(this, arguments);

                if (_class.$routeConfig && $injector.has("$rootRouter")) {
                    if (!thereIsRouterRootComponent) {
                        const factory = directiveFactory[Common.serviceNormalize(_class.name as string)];
                        delete factory.$routeConfig;
                        const $router = $injector.get("$rootRouter");
                        $router.config(_class.$routeConfig);
                        thereIsRouterRootComponent = true;
                    }
                    else {
                        $injector.get("$rootRouter");
                    }
                }
                
                return component;
            };
        }]);
    }]);
}