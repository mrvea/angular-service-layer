import { Injectable } from '@angular/core';
import { Layer, AbstractLayer, MergeEndpoints, ResolverLayer } from '../../../modules/layer';
import { EventsLayer } from './events.layer';
import { RecordsLayer } from './records/records.layers';

export const subLayers = [
	EventsLayer,
    RecordsLayer
]

@Injectable({
    providedIn: 'root'
})
@Layer({
    subLayers
})
export class Layers extends ResolverLayer<typeof subLayers> {
}
/**
 * Mixins way to add type definition to a class.
 */
export interface Layers extends MergeEndpoints<typeof subLayers> {}