# Angular Service Layering (UNDER CONSTRUCTION)
Add more methods to a service without modified existing service 

## Introduction
Hello, My name is Evgeniy Vakhroushev. Most people call me Gene. I have been developing a developer for 10 years. I have been developing with angular for 9 years. I am a big promoter of typescript. I came up with the concept and implementation for layering angular services. I have not found any elegant solutions to the problem from my research. I wanted to create proof of concept for anyone that it may help.

Layering concept is still underdevelopment and evolving. Any suggestions are welcome!
## Criteria

- Single service for communication
- Easy to add features/abilities to the service
- User of the communication service would not know which layer the method came from
- Isolation of domain
- Layered service do not need to be aware of each other
- Layered service could be injected independently(one direction only) 
- scalable
- Abstract with decorators
## Problem/Reason
In many projects that I worked in, I ran into an issue of very large services and/or many services injections with manual method wrapping. 
In my cases I wanted to import one service and use this service only without complications. Imagine a service that is a mini API server, which has endpoints(methods) that handle some logic for whom ever is using it. 
I did not want to cram all of the methods into service, and I like to separate my code under some logical context. 
Bloated service will be hard to organize, test and debug. 
I tried to use inheritance. Each (sub) service was inheriting from another. This was essentially inheritance chaining. This worked when the services were very simple, but any added complexity was a headache. The inner communication was most impossible, so any interactions had to be extracted into multiple protected methods. It was a headache to update or change. 
I then tried to use composition. I grouped service methods under some logical context and made a separate service for each group. I injected the service into an API(communication) service, then wrapped all of the methods should be exposed publicly. This worked, but I had to recreate the method signature in the parent service. This made signature modification cumbersome. I did not want expose the child service, because this adds complexity to usage.

The idea of mixins came up as well. I have tried this for nodejs server and it worked very well. It was pretty elegant. Pure mixing was not as elegant in angular, because types would be lost in the merge with mixin decorator and we could not use "extend" mixins. There is issue of `this` as well with mixins, because encapsulation is broken.

## Solutions 

I decided to merge decorators, mixins, and composition with interface overloading.

Mixins will 
    create wrapper methods(composition), which will inject service, if does not exist, 
    invoke service method with passed arguments
Decorators will hide mixins actions on the background
Inheritance will extends the root communication service
Typescript generics will overload class interface with filtered out methods. 
    Note: class interface overloading is a workaround, due to mixins and decorator usage

each service layer will have 
- [x] isolation
  - [x] encapsulation
- [x] dynamically injected
- [x] full type retention 
- [x] "jump to" will jump to the child layer(tested in vscode)
- [x] easy to add new methods
- [x] name collision check at the register level 

## Concept
Communication service will funnels or projects all of the child methods with mixins, inheritance and class/method decorators. Communication service is never used internally(inside of the domain), so that there is no circular dependency.  
Layer decorator will build a mixin from registered subLayers set some restrictions and hidden properties for class level metadata.

### Setup
I create an empty(domain) service with some clear contextual identifier and with Layer decorator, add any layer that I wish to see in the communication service. This empty service is used to extend Communication service with explicit ` extends {{some class name}}` . Now I can register any number of layer services in the empty service to add infinite number of methods. This is all strictly governed by logical context(domain or subdomain).

I usually use `.layer.ts` instead of `.service.ts` for easy identification


## Definitions
Child service - any service that projects their methods through composition
Communication service - external communication from a domain
Layer - a service that would be use to extend the functionality of a communication service
    - could be a sudo sub communication service with child layers
Mixins "extend" - special mixins which returns an inline class extension with type retention and loss of identify
Mixins - mixing multiple class into one. 
Parent service - any service that contains composition methods from other service.
Sub service - see Child service