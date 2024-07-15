import { Injectable } from '@angular/core';
import { Layer, AbstractLayer, ResolverLayer, MergeEndpoints } from '../../../../modules/layer/';
import { ContactLayer } from './contact.layer';

const subLayers = [
    ContactLayer
]

@Injectable({
    providedIn: 'root'
})
@Layer({
    subLayers
})
export class RecordsLayer extends ResolverLayer<typeof subLayers>{}
/**
 * Mixins way to add type definition to a class.
 */
export interface RecordsLayer extends MergeEndpoints<typeof subLayers> {}