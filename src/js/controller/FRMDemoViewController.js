/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
import ExifReader from "exifreader";

export default class FRMDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        super.oncreate();
    }


    async onresume() {
        await super.onresume();

        const myItem = new entities.MediaItem("lirem");
        myItem.remote = true;

        const fsHandler = await LocalFileSystemReferenceHandler.getInstance();

        /* Folgende Lösung nicht effizient: Bilder werden lokal gespeichert,
        * aber benötigen sehr viel Speicherplatz (DATAURL's) */
        // TODO: do databinding, set listeners, initialise the view
        this.viewProxy = this.bindElement("myapp-frm-demo-template", {item: myItem}, this.root).viewProxy;
        this.viewProxy.bindAction("submitForm", async (evt) => {
            evt.original.preventDefault();
            alert("onsubmit! Remote: " + myItem.remote);
            if (myItem.remote) {
                const uploaddata = new FormData();
                uploaddata.append("imgdata", myItem.imgFile);
                uploaddata.append("anotherField", "some value");

                const request = new XMLHttpRequest();
                request.open("POST", "http://localhost:7077/api/upload");
                const response = request.send(uploaddata);
                console.log("response: ", response);
                request.onload = () => {
                    alert("loaded: " + request.responseText);
                    const responseData = JSON.parse(request.responseText);
                    console.log("responseData: ", responseData);
                    delete myItem.imgFile;
                    myItem.src = "http://localhost:7077/" + responseData.data.imgdata;
                    console.log("myItem: ", myItem);
                    myItem.create().then(() => alert("created remotly"));
                }
            } else {
                if (myItem.imgFile) {
                    myItem.src = await fsHandler.createLocalFileSystemReference(myItem.imgFile);
                    delete myItem.imgFile;
                }
                myItem.create().then(() => alert("created!"));
            }
        });
        this.viewProxy.bindAction("fileSelected", async (evt) => {
            if (evt.original.target.files[0]) {
                console.log("fileSelected: ", evt.original.target, evt.original.target.files[0]);
                const imgFile = evt.original.target.files[0];
                /* Mit FileReader wird lokale Datei im Browser gelesen
                *  readAsDataUrl liest Datei und konvertiert sie in eine Base64 Data-Url*/
                /*const fileReader = new FileReader();
                fileReader.readAsDataURL(evt.original.target.files[0]);
                fileReader.onload = () => {
                    /!*console.log("loaded file data: ", fileReader.result);
                    const img = this.root.querySelector("main form img");
                    img.src = fileReader.result;*!/
                    myItem.src = fileReader.result;
                    this.viewProxy.update({item: myItem});
                }*/
                /* temporäre URL, die auf Datei im Speicher verweist.
                * Effizienter, da keine Umwandlung in Base64, also Datei wird nicht in String konvertiert. */
                myItem.src = URL.createObjectURL(imgFile);
                this.viewProxy.update({item: myItem});
                myItem.imgFile = imgFile;
                /*const localReference = await fsHandler.createLocalFileSystemReference(imgFile);
                console.log("LocalReference: ", localReference);
                const resolvedLocalReference = await fsHandler.resolveLocalFileSystemReference(localReference);
                console.log(resolvedLocalReference);*/

                const imgMetadata = await ExifReader.load(imgFile);
                    console.log("imgMetadata: ", imgMetadata);
            }
        });
    }


    constructor() {
        super();

        console.log("FRMDemoViewController()");
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
