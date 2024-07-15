import { Injectable } from '@angular/core';
import { AbstractLayer, Layer } from '../../../../modules/layer';
import { Observable, of } from 'rxjs';

interface Contact {
    name: string,
    company: string
}

@Injectable({
    providedIn: 'root'
})
@Layer()
export class ContactLayer extends AbstractLayer{

    createContact(name: string, company: string): Observable<Contact>{
        return of({name, company})
    }
}