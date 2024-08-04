import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../shared/services/store.service';

@Component({
    selector: 'vea-example',
    templateUrl: './example.page.html',
    styleUrls: ['./example.page.scss']
})
export class ExampleComponent implements OnInit {
    constructor(
        private _store: StoreService
    ) { }

    ngOnInit(): void { 
        this._store.createContact("name", "com")
        this._store.createEvent("some event")
        this._store.mustResolve("createEvent", "another event")
    }
}
