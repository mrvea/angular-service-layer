import { Constructor, ContextualMethods, GenericObj } from "./models/generic";


export const composer =
    /**
     * Initiates object composition with behaviors
     * @param behaviors list of extending behaviors
     * @returns 
     */
    <U extends (GenericObj & Constructor)[]>(behaviors: U) =>
    /**
     * Augmentation of behaviors
     * Note: This could be made to explicitly hide or make public
     * * each option has advantages and disadvantages, so choose what will work for each use case.
     * * I chose to explicit hide, because most of my methods will be public, so this will make it easier to add and remove.
     * @param privateMethods list of method we want to explicitly hide
     * @returns class decorator
     */

    <M extends keyof ContextualMethods<U[number]['prototype']>>(...privateMethods: M[]) =>
    /**
     * class decorator or class mixin function which adds methods from each extending behavior object
     * @param derivedCtor 
     * @returns 
     */
    <T extends Constructor>(derivedCtor: T) => {
        behaviors.forEach(addMethods(derivedCtor, privateMethods));
		return derivedCtor as T & ContextualMethods<U[number]['prototype']>
    };

    /**
     * Factory to make a method which will selectively defines methods by property name
     * @param derivedCtor augmented object
     * @param privateMethods list methods to exclude
     * @returns extractor method
     */
    function addMethods<B extends Constructor, M extends string & any>(derivedCtor: B, privateMethods: M[]) {

        return (base: Constructor) =>
            Object.getOwnPropertyNames(base.prototype) // get all actual properties of a behavior object
                .filter(filterMethods(base)) // filter only the function types
                .filter(excludedMethods(privateMethods)) // exclude explicitly hidden methods
                .forEach(addMethod(derivedCtor, base)); // add each method to the augmented class
    }

    function filterMethods(base: Constructor) {
        return (name: string): boolean => typeof base.prototype[name] == 'function';
    }
    function excludedMethods<M extends string & any>(exclude: M[]){
        return (name: string): boolean => !exclude.includes(name as M)
    }
    /**
     * Creates a methods wrapper with a proper name
     * * The wrapper check if behaver class exists in the behavior collection
     * * * if so, calls the behavior with called arguments
     * * * if not, it tries to retrieve the handler with expected method
     * * * Note: The retriever is will try to inject the service
     * @param derivedCtor 
     * @param baseCtor 
     * @returns 
     */
    function addMethod(derivedCtor: Constructor, baseCtor: Constructor) {
        return (name: string) => {
    
            Object.defineProperty(derivedCtor.prototype, name, {
                value: function <P extends unknown>(...args: P[]) {
                    if (!this ||
                        !this.Handlers[baseCtor.name]
                        //|| !(name in this.Handlers[baseCtor.name].EndPoints)
                    ) {
                        this.Handlers[baseCtor.name] = this.GetHandler(baseCtor)
                        // throw new Error(`Unable find handler with name ${baseCtor}`);
                    }
                    return this.Handlers[baseCtor.name][name](...args);
                },
                writable: true,
            });
        };
    }