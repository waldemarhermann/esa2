/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
// import * as https from "node:https";
// import {GenericCRUDImplLocal} from "vfh-iam-mwf-base";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    filterMode = "all";
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view

        console.log("oncreate(): root is: ", this.root)

        /* 12. Durch Klick auf "+" wird neues MediaItem erstellt */
        const addNewItemAction = this.root.querySelector("#myapp-addNewItem");
        addNewItemAction.onclick = async () => {
            /*// alert("new add!");
            const newItem = new entities.MediaItem("lorem epsum", "https://picsum.photos/100/100");
            console.log("adding: ", newItem);
            /!* 13. Alte Variante: CRUD-Operation werden hier direkt angesteuert *!/
            // this.crudops.create(newItem).then(createdItem => this.addToListview(createdItem));
            /!* 14. Neue Variante: EntityManager kümmert sich hier automaitsch.
            Mit create in der IndexedDB gespeichert. Anschließend mit "addToListView" in die HTML-Liste eingefügt *!/
            newItem.create().then(() => this.addToListview(newItem));*/

            const newItem = new entities.MediaItem("lorem", "https://picsum.photos/100/100");
            const dialogResult = await this.showDialog("myapp-mediaitem-dialog", {
                itemToBeEdited: newItem
            });
            if (dialogResult && dialogResult.returnStatus === "itemUpdated") {
                await this.reloadList();
            }
        }

        const toggle = this.root.querySelector("#myapp-filter-toggle");
        if (toggle) {
            toggle.onclick = async () => {
                this.switchFilterMode();
                toggle.textContent = this.filterMode; // ⬅️ Wichtig für den linken Button!
                await this.reloadList();
            };
            toggle.textContent = this.filterMode;
        }

        const refreshButton = this.root.querySelector("#myapp-refresh-toggle");
        if (refreshButton) {
            refreshButton.onclick = async () => {
                this.switchFilterMode();
                if (toggle) {
                    toggle.textContent = this.filterMode; // ⬅️ Damit auch links der Text aktualisiert wird!
                }
                await this.reloadList();
            };
        }


        await this.reloadList();

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        // this.crudops = GenericCRUDImplLocal.newInstance("MediaItem");

        /* this.items = [
            new entities.MediaItem("lirem", "https://picsum.photos/100/100"),
            new entities.MediaItem("dopsum", "https://picsum.photos/200/200"),
            new entities.MediaItem("olor", "https://picsum.photos/100/200"),
            new entities.MediaItem("sed", "https://picsum.photos/150/300"),
            new entities.MediaItem("adipiscing", "https://picsum.photos/350/100"),
        ] */

        console.log("ListviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        if (
            (nextviewid === "myapp-mediaitem-dialog" && returnStatus === "itemUpdated") ||
            (nextviewid === "myapp-readview" && returnStatus === "itemDeleted")
        ) {
            await this.reloadList();
        }
    }





    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    /* bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview

        itemview.root.querySelector("h2").textContent = itemobj.title;
        itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
        itemview.root.querySelector("h3").textContent = itemobj.added;
    } */

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
        this.nextView("myapp-readview", {item:itemobj});
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {

        console.log("Menüaktion ausgewählt:", menuitemview.dataset.mwfTargetaction, itemobj);

        const action = menuitemview.dataset.mwfTargetaction;

        if (action === "deleteItem") {
            this.deleteItem(itemobj);
        } else if (action === "editItem") {
            this.editItem(itemobj);
        } else {
            super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
        }
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }

    /* specific methods for view functionality */
    /* 15. Löschen, wird aufgerufen aus "<li data-mwf-targetaction="deleteItem"></li>" */
    deleteItem(item) {
        this.showDialog("myapp-delete-confirmation-dialog", {
            item: item,
            actionBindings: {
                cancelDelete: () => {
                    this.hideDialog();
                },
                confirmDelete: async () => {
                    console.log("Löschbestätigung wurde geklickt");
                    await item.delete();
                    this.removeFromListview(item._id);
                    this.hideDialog();
                }

            }
        });
    }

    /* 16. Editieren, wird aufgerufen aus "<li data-mwf-targetaction="editItem"></li>" */
    editItem(item) {
        this.itemToBeEdited = {title: item.title, src: item.src};
        this.showDialog("myapp-mediaitem-dialog", {
            itemToBeEdited: item,
            actionBindings: {
                submitForm: async (evt) => {
                    evt.original.preventDefault();
                    item.latlng = {
                        lat: 52.52,
                        lng: 13.405
                    };
                    await item.update();
                    this.hideDialog(true);
                    this.updateInListview(item._id, item);
                },
                deleteItem: async (evt) => {
                    evt.original.preventDefault();
                    await item.delete();
                    this.hideDialog();
                    this.removeFromListview(item._id);
                }
            }
        });
    }

    /*async onresume() {
        entities.MediaItem.readAll().then(items => this.initialiseListview(items));
        super.onresume();
    }*/

    /* Wenn der Editordialog geöffnet wird und dann geschlossen wird, dann den Zustand restoren, eventuell etwas mit Kopie erstellen… */
    async hideDialog(fromSubmit) {
        console.log("ListviewViewController hideDialog(): ", this.dialog);
        await super.hideDialog();
        if (!fromSubmit && this.itemToBeEdited) {

        }
    }

    applyFilter(items) {
        if (this.filterMode === "local") {
            return items.filter(it => !it.remote);
        } else if (this.filterMode === "remote") {
            return items.filter(it => it.remote);
        }
        return items;
    }

    switchFilterMode() {
        if (this.filterMode === "all") {
            this.filterMode = "local";
        } else if (this.filterMode === "local") {
            this.filterMode = "remote";
        } else {
            this.filterMode = "all";
        }
        const toggle = this.root.querySelector("#myapp-filter-toggle");
        if (toggle) {
            toggle.textContent = this.filterMode;
        }
    }

    async reloadList() {
        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();
        const allItems = await entities.MediaItem.readAll();
        for (let i = 0; i < allItems.length; i++) {
            allItems[i].src = await fsHandler.resolveLocalFileSystemReference(allItems[i].src);
        }
        const filtered = this.applyFilter(allItems);
        this.initialiseListview(filtered);
    }

}
