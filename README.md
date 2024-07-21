# Angular Service Layering (UNDER CONSTRUCTION)
Add more methods to a service without modified existing service 

## Introduction
Hello, My name is Evgeniy Vakhroushev. Most people call me Gene. I have been a developer for 10 years and I have been developing with angular for 9 years. I am a big promoter of typescript and its generic system. From my experience, there is a problem with typescript. The problem is the inability to extend from multiple classes. I have not found any elegant solutions to the problem from my research. I wanted to create proof of concept for anyone that it may help. I came up with the concept and the implementation for layered angular services.
The implementation is mainly derived from my use cases and current limitations,so if something does not work in your use case, it can be modified in a plethora of ways.

This Layering concept implementation is still under development and evolving. Any suggestions are welcome!

## Problem/Reason
In many projects that I worked in, I ran into an issue of very large services and/or many services injections with manual method wrapping. 
In my cases I wanted to import one service and use this service only, and without complications. Imagine a service that is a mini API server, which has endpoints(methods) that handle some logic for whom ever is using it. I want to group the methods by some contextual logic and extract those groups into separate files or services. 

I have seen or tried all of these option to resolve the problem.
### Single service
Cram all of the methods into one service. This will break single responsibility rule, which one should separate code under some logical context or domain. 
Bloated service will be hard to organize, test and debug. 

### Inheritance
Each (sub) service inherits from another. This was essentially inheritance chaining. This worked when the services were very simple, but any added complexity is a headache to deal with. The inner communication was most impossible, so any interactions had to be extracted into multiple protected methods. It was difficult to update. The classes in typescript cannot be extended by multiple classes.

### Composition
Making services by context and grouping them under a domain if applicable. Injecting those service explicitly into communication service, and wrapping each expected method into a public communication method.
This worked, but the recreation the methods and signatures in the parent service seamed unnecessary. This made signature modification cumbersome. The injected serves could be made public, but this adds prior knowledge issue, and became cumbersome to use in dynamic way. 

### Mixins
Pure mixins are not as elegant in angular, because types would be lost in the merge with mixin decorator and we could not use "extend" mixins. The "extend" mixins will take way the elegant use of Service classes, but this is a personal choice. There is issue of `this` as well with mixins, because encapsulation is broken and binding is lost.
Note: I have tried this for nodejs server and it worked very well. It was pretty elegant.

## Criteria

- Single service for communication
- Easy to add features/abilities to the service
- Abstract sublayers services. User of the communication service would not know which layer the method came from.
- Isolation of domain
- Layered service do not need to be aware of each other
- Layered service could be injected independently(one direction only) 
- scalable
- Abstract with decorators
  
## Concept
Services are created with some contextual methods that application needs, like any other service in angular. A `@Layer()` decorator is added to the service. Layered class does extend from `AbstractLayer Class`, which adds typings in the mixin, and an expected behavior contract.
A root layer service is then created. A root layer will have `@Layer()` decorator as well, but all of the child layers will be added as `subLayers`. Due to a limitation of typescript, root layer service interface will have to be extend with child layer interfaces. All classes in typescript have interfaces with the name, and those interfaces can be "overloaded" or extended. This is a workaround, but it is pretty seamless.
Mixins will create method wrappers for each exported method. Mixins are used to created dynamic composition, because wrapper method does not relinquish ownership from all the original iterated methods. Wrapper function just calls the method and passes all of the parameters to it.
Communication service will extend the root layer service. 
Communication service is never used internally(inside of the domain), so that there is no circular dependency.  

Now root layer could be used to add a plethora of services, in turn, methods.

## Breakdown

in-depth breakdown of the concept

### Services:
Normal service with `@Layer()` decorator added to the class. The class extends an AbstractLayer class which will be explained in detail later
As a naming convention, I use `.layer.ts` for these services, instead of `.service.ts`
``` ts
@Injectable({ProvideIn: 'root'})
@Layer()
export class SomeLayer extends AbstractLayer {

}

```
#### Communication service
A service that extends from a root layer service.
Note: the class names are arbitrary.

``` ts
@Injectable({{ProvideIn: 'roo'}})
export class Store extends Layers{}
```

#### Root layer
Grouping service for better flow and inner communication.

``` ts
@Injectable({providedIn: 'root'})
@Layer({
    subLayers
})
export class Layers extends ResolverLayer<typeof subLayers> {
}
/**
 * Mixins way to add type definition to a class.
 */
export interface Layers extends MergeEndpoints<typeof subLayers> {}
```
#### class decorator

Layer Decorator function to hide mixins, and adds hidden properties.

```ts
export function Layer<T extends (GenericObj & Constructor)[], M extends keyof ContextualMethods<T[number]['prototype']>>({
	subLayers = [] as unknown as T,
	hideMethods = [] as unknown as M[]
}: {subLayers?: T,  hideMethods?: M[]} = {} as any){
    /**
     * building a class mixins if subLayers are present. 
     */
	const addon = !!subLayers && subLayers.length > 0 ? composer(subLayers)(...hideMethods) : false 
	return <T extends Constructor<AbstractLayer>>(target: T) => {
        /**
         * add methods to the class if available
         */
		if(!!addon) {
			addon(target)
		}
    
	}
}
```
### Mixins

The class mixin returned from composer make a dynamic wrapper method for each allowed method

```ts
 <T extends Constructor>(derivedCtor: T) => {
        behaviors.forEach(addMethods(derivedCtor, privateMethods));
		return derivedCtor as T & ContextualMethods<U[number]['prototype']>
    };
```
The `addMethods` takes all of the properties and filters only functions, filters out private or hidden methods and makes a wrapper method

```ts
function addMethod(derivedCtor: Constructor, baseCtor: Constructor) {
        return (name: string) => {
            Object.defineProperty(derivedCtor.prototype, name, {
                value: function <P extends unknown>(...args: P[]) {
                    if (!this.Handlers[baseCtor.name] ) {
                        this.Handlers[baseCtor.name] = this.GetHandler(baseCtor)
                    }
                    return this.Handlers[baseCtor.name][name](...args);
                },
                writable: true,
            });
        };
    }
```
A method is added with the same name as the method in the child service.
The wrapper method has a check if a child layer is present or not. If not present, it is requested with `GetHandler` method. 
Then the the method is called from layer service directly with specific properties and results are returned.

Note: This `GenHandler` method is from the AbstractLayers class.

#### composer
Composer is a mixin factory builder. 

First, it takes in behaviors, which returns a mixin factory

```ts
<U extends (GenericObj & Constructor)[]>(behaviors: U)=> {...}
```
the mixin factory accepts "private" or explicitly hidden methods, 
```ts
<M extends keyof ContextualMethods<U[number]['prototype']> | undefined>(...privateMethods: M[]) => {...}
```
Note: These function params could be combined, but there some use cases where the separation is neccessary.

### Composition

The wrapper method, that is displayed in the mixins section, is a composition, or `has-a` method from another class. The same way a person would wrap a function from a child class, this method does it automatically.
The method in the layers class maintains its encapsulation.

### Extension

AbstractLayer adds some restrictions and adds protected properties and methods. `@Layer()` decorator is restricted to this class or any classes extend from this class. This is done to ensure these properties and methods are present.

```ts
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
```

The mixin function does not need to "know" how we get the `handler`, so it calls abstracted `Gethandler` method. This method uses angular `Injector` class to "get" the service. The child layer is not injected unless one of its methods are called. The `Injector` class is usually injected as well, so extended class will need to constructor inject it as protected property with the same name or add it as static injector at a module level. 
Note: The static variable approach did not sit right with me, and modules are not as popular now, due to standalone components. 

```ts
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
```
This class adds a helper function to use string names to call a method from the service.
The property types and count are maintained. This is usually added to any root layers or sub root layers

### Generics

This is where the magic happens to main the method signatures. 
Note: full list of generic is the example

```ts
export type Endpoint<T extends unknown = any> = Observable<T>
```
generic endpoint observable, which will limit autocompletion to method that have observable return type


```ts
export type EndpointMethod = AnyFunction<any, Endpoint>
```
generic for method with endpoint return 

```ts
export type MethodNames<T> = {
    [K in keyof T]: T[K] extends EndpointMethod ? K : never;
}[keyof T];
```
This excludes all methods that do not have an observable as a return type

```ts
export type MergeEndpoints<T extends GenericObj[]> = ContextualMethods<T[number]['prototype']>
```
generic way to extract method from a class
Note: I have not seen this does this way, and I am not sure if it is proper away, but it works for this use case. 
    Please tell me if there is a better way.

```ts
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
```

## Definitions

Child service 
: any service that projects their methods through composition

Communication service 
: external communication from a domain

Layer
: a service that would be use to extend the functionality of a communication service
: could be a sudo sub communication service with child layers

Mixins "extend"
: special mixins which returns an inline class extension with type retention and loss of identify

Mixins
: mixing multiple class into one. 

Parent service
: any service that contains composition methods from other service.

Sub service
: see Child service