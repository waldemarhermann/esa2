/**
 * Updated by master on 21.02.24.
 */
import {mwf} from "vfh-iam-mwf-base";
import {EntityManager} from "vfh-iam-mwf-base";
import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";
import {GenericCRUDImplRemote} from "vfh-iam-mwf-base";
import * as entities from "./model/MyEntities.js";

class MyApplication extends mwf.Application {

    constructor() {
        super();
    }

    /* 3. Datenzugriff wird hier vorbereitet */
    async oncreate() {
        console.log("MyApplication.oncreate(): calling supertype oncreate");

        // first call the supertype method and pass a callback
        await super.oncreate();

        console.log("MyApplication.oncreate(): initialising local database");
        // 4. initialise the local database
        // TODO-REPEATED: add new entity types to the array of object store names
        await GenericCRUDImplLocal.initialiseDB("mwftutdb", 1, ["MyEntity", "MediaItem"]);

        console.log("MyApplication.oncreate(): local database initialised");

        //// TODO-REPEATED: if entity manager is used, register entities and crud operations for the entity types
        //this.registerEntity("MyEntity", entities.MyEntity, true);
        //this.registerCRUD("MyEntity", this.CRUDOPS.LOCAL, GenericCRUDImplLocal.newInstance("MyEntity"));
        //this.registerCRUD("MyEntity", this.CRUDOPS.REMOTE, GenericCRUDImplRemote.newInstance("MyEntity"));

        /* 5. Registriert Datentyp MediaItem, der EntityManager weiß dann, wie er mit MediaItem umgehen muss*/
        this.registerEntity("MediaItem", entities.MediaItem, true);
        this.registerCRUD("MediaItem", this.CRUDOPS.LOCAL, GenericCRUDImplLocal.newInstance("MediaItem"));
        this.registerCRUD("MediaItem", this.CRUDOPS.REMOTE, GenericCRUDImplRemote.newInstance("MediaItem"));

        // TODO: do any further application specific initialisations here
        this.initialiseCRUD(this.CRUDOPS.LOCAL, EntityManager);

        // THIS MUST NOT BE FORGOTTEN: initialise the entity manager!
        /* 6. Startet das Ganze */
        EntityManager.initialise();
    };
}

const application = new MyApplication();
export {application as default}


