import { defer, from, switchMap } from "rxjs";
import { AnyFunction, GenericObj, MergeEndpoints } from "./generic";
import { Injector, ProviderToken } from "@angular/core";

/**
 * The driver abstract class 
 */
export abstract class AbstractLayer {
	static injector: Injector;
	protected Handlers: GenericObj<ProviderToken<AbstractLayer>> = {};
	protected Injector: Injector | undefined

	protected GetHandler(pt: ProviderToken<unknown>) {
		if (!this.Injector) return AbstractLayer.injector.get(pt);
		return this.Injector.get(pt);
	}

	protected HasMethod(name: string) {
		return name in this && typeof (this as any)[name] === 'function'
	}

}

/**
 * Defines a capability to invoke and watch contextual methods
 */
export class ResolverLayer<T extends GenericObj[]> extends AbstractLayer {
     /**
     * tries to call a method from string name.
     * Note: this method throws, so it must succeed. 
     * @param method method name
     * @param params list of params represented in the method if found
     */
	resolve<M extends keyof MergeEndpoints<T>>(method: M, ...params: Parameters<MergeEndpoints<T>[M]>) {
		if(!(method in this)){
            throw new Error(`Unknown method ${method}`)
		}
        return this[method as keyof this](...params) 
	}
}