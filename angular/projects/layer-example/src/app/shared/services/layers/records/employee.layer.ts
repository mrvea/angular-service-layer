import { Injectable } from '@angular/core';
import { AbstractLayer, Layer } from '../../../../modules/layer';
import { ContactLayer } from './contact.layer';

@Injectable({
    providedIn: 'root'
})
@Layer()
export class EmployeeService extends AbstractLayer{
    constructor(
        private _cs: ContactLayer
    ){super()}
}