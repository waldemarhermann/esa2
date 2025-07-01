/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

import {mapController} from "./MapsDemoViewController";

export default class ReadviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        console.log("root: ", this.root);
        console.log("args: ", this.args);
        console.log("mapController: ", mapController);

        const myItem = this.args.item; //new entities.MediaItem("My new item", "https://picsum.photos/300/100");
        // const h1 = this.root.querySelector("h1");

        /* Template in die Ansicht hinzufügen */
        /* in "item: myItem" kann das "item" selbst gewählt werden. */
        const templateProxy = this.bindElement("myapp-readview-template", {item: myItem}, this.root).viewProxy;

        templateProxy.bindAction("deleteItem", () => {
            this.showDialog("myapp-delete-confirmation-dialog", {
                item: myItem,
                actionBindings: {
                    cancelDelete: () => {
                        this.hideDialog();
                    },
                    confirmDelete: async () => {
                        await myItem.delete();
                        this.previousView({item: myItem}, "itemDeleted");
                        this.hideDialog();
                    }
                }
            });
        });

        /*h1.textContent = myItem.title + " " + myItem._id;
        const img = this.root.getElementsByTagName("img")[0];
        img.src = myItem.src;*/

        /*const deleteAction = this.root.querySelector("header button:last-child");
        deleteAction.onclick = () => {
            myItem.delete().then(() =>
                this.previousView({item: myItem}, "itemDeleted");
            });
        }*/

        /*this.root.querySelector("footer button").onclick = () => {
            this.previousView();
        }*/

        // call the superclass once creation is done
        super.oncreate();
    }


    constructor() {
        super();

        console.log("ReadviewViewController()");
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
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

}
