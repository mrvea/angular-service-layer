import { Injectable } from "@angular/core"
import { Constructor, ContextualMethods, GenericObj } from "../models/generic"
import { composer } from "../composer"
import { AbstractLayer } from "../models/abstract"

const LAYER_ANNOTATIONS = Symbol("layer__annotations")

export function Layer<T extends (GenericObj & Constructor)[], M extends keyof ContextualMethods<T[number]['prototype']>>({
	subLayers = [] as unknown as T,
	hideMethods = [] as unknown as M[]
}: {subLayers?: T,  hideMethods?: M[]} = {} as any){
	const addon = !!subLayers && subLayers.length > 0 ? composer(subLayers)(...hideMethods) : false 
	return <T extends Constructor<AbstractLayer>>(target: T) => {
		if(!!addon) {
			addon(target)
		}
		if(!target.hasOwnProperty(LAYER_ANNOTATIONS)){
			Object.defineProperty(target, LAYER_ANNOTATIONS, {value: {}})
		}
	}
}
