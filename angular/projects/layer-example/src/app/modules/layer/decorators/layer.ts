import { Injectable } from "@angular/core"
import { Constructor } from "../models/generic"
import { composer } from "../composer"
import { AbstractLayer } from "../models/abstract"

const LAYER_ANNOTATIONS = Symbol("layer__annotations")

export function Layer({
	scriptID = '',
	context = '',
	subLayers = [],
	providedIn = 'root',
}: Injectable & {scriptID?: string, context?: string, subLayers?: Constructor[]} = {} as any){
	// const ngService = Injectable({providedIn})
	const addon = composer(subLayers)()
	return <T extends Constructor<AbstractLayer>>(target: T) => {
		if(subLayers && subLayers.length > 0) {
			addon(target)
		}

		if(!target.hasOwnProperty(LAYER_ANNOTATIONS)){
			Object.defineProperty(target, LAYER_ANNOTATIONS, {value: {}})
		}
	}
}
