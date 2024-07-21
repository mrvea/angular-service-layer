import { Observable } from "rxjs";

export interface GenericObj<T extends unknown = any> {
    [key: string]:T
}

export type Constructor<T = {}> = new (...args: any[]) => T;

export type AnyFunction<T extends unknown = GenericObj, U extends unknown = GenericObj> = (...args: T[]) => U 

export type Endpoint<T extends unknown = any> = Observable<T>


export type MethodNames<T> = {
	[K in keyof T]: T[K] extends EndpointMethod ? K : never;
}[keyof T];

/**
 * defines an endpoint method
 */
export type EndpointMethod = AnyFunction<any, Endpoint>

/**
 * Makes a Object with contextual methods from typeof array of typeof class
 */
export type MergeEndpoints<T extends GenericObj[]> = ContextualMethods<T[number]['prototype']>

/**
 * Derives Object type with Endpoint method type from type list of Object.
 * Explicitly excludes `resolve` method (reserved word under api context)
 */
export type ContextualMethods<T extends GenericObj> = {
	[K in (T extends GenericObj ? Exclude<MethodNames<T>, 'resolve'> : never)]:
	T extends GenericObj
	? T[K] extends EndpointMethod ? T[K] : never
	: never
}

