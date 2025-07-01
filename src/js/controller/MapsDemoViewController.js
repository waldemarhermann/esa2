/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import * as entities from "../model/MyEntities.js";

export let mapController;
export let mapView; /* Das ist das DOM-Element in dem die Karte dargestellt ist. Dann muss man das sozusagen rein pasten.*/
export let markerMap = new Map();

export default class MapsDemoViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;
    // TODO-REPEATED: declare custom instance attributes for this controller

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view

        // call the superclass once creation is done
        super.oncreate();
    }

    async onresume() {
        await super.onresume();

        if (!mapController) {
            mapController = L.map("myapp-maproot");
            mapView = this.root.querySelector("#myapp-maproot");
            console.log("created mapController: ", mapController);
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapController);
            mapController.setView([51.505,-0.09],13);
        } else {
            if (!this.root.querySelector("#myapp-maproot")) {
                this.root.querySelector("main").appendChild(mapView);
            }
        }

        /*const items = [
          new entities.MediaItem("lirem", "https://picsum.photos/100/200"),
          new entities.MediaItem("dopsum", "https://picsum.photos/200/100"),
          new entities.MediaItem("olor", "https://picsum.photos/100/100"),
          new entities.MediaItem("sed", "https://picsum.photos/400/150")
        ];

        const coords = [
            [52.54471159402152, 13.352894327349361],
            [52.47505945770001, 13.400528223646104],
            [52.496690749059994, 13.43745962549674],
            [52.542887520531295, 13.402641267828974]
        ];*/

        const items = await entities.MediaItem.readAll();

        const existingIds = new Set(items.map(it => it._id));

        for (const [id, marker] of markerMap.entries()) {
            if (!existingIds.has(id)) {
                mapController.removeLayer(marker);
                markerMap.delete(id);
            }
        }

        for (let item of items) {
            if (!item.latlng) {
                item.latlng = {
                    lat: 52.3 + Math.random() * 0.3,
                    lng: 13.2 + Math.random() * 0.4
                };
                await item.update();
            }

            const latlng = [item.latlng.lat, item.latlng.lng];
            let marker = markerMap.get(item._id);

            const markerPopup = document.createElement("div");
            markerPopup.classList.add("myapp-marker-popup");

            const popupTitle = document.createElement("div");
            popupTitle.textContent = item.title;
            markerPopup.appendChild(popupTitle);

            const popupimg = document.createElement("img");
            popupimg.src = item.src;
            popupimg.style.width = "100px";
            popupimg.style.height = "auto";
            markerPopup.appendChild(popupimg);

            markerPopup.onclick = () => {
                this.nextView("myapp-readview", { item: item });
            };

            if (marker) {
                marker.setLatLng(latlng);
                marker.bindPopup(markerPopup);
            } else {
                marker = L.marker(latlng).addTo(mapController);
                marker.bindPopup(markerPopup);
                markerMap.set(item._id, marker);
            }
        }
    }

    constructor() {
        super();

        console.log("MapsDemoViewControllerTemplate()");
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
