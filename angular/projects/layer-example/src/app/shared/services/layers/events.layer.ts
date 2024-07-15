import { Injectable } from '@angular/core';
import { Layer, AbstractLayer } from '../../../modules/layer';
import { Observable, of } from 'rxjs';

interface Event {
    name: string
}
@Injectable({
    providedIn: 'root'
})
@Layer()
export class EventsLayer extends AbstractLayer{

    createEvent(name: string): Observable<Event>{
        return of({name})
    }
}