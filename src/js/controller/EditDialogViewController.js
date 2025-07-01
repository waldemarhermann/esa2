/**
 * @author Jörn Kreutel
 */
import {mwf} from "vfh-iam-mwf-base";
import {mwfUtils} from "vfh-iam-mwf-base";
import {LocalFileSystemReferenceHandler} from "../model/LocalFileSystemReferenceHandler";
import * as entities from "../model/MyEntities.js";
import {GenericDialogTemplateViewController} from "vfh-iam-mwf-base";
import ExifReader from "exifreader";

export default class EditDialogViewController extends GenericDialogTemplateViewController {

    constructor() {
        super();
    }

    async onresume() {
        await super.onresume();

        console.log("viewProxy: ", this.root.viewProxy);
        console.log("root: ", this.root);
        console.log("args: ", this.args);

        const item = this.args.itemToBeEdited;
        this.originalItem = structuredClone(item);

        // Wenn kein 'created' gesetzt ist, gehen wir davon aus, dass es ein neues Item ist
        if (!item.created) {
            item.remote = true; // Standard: remote aktiviert
        } else {
            // Bestehende Items: remote-Checkbox deaktivieren
            const checkbox = this.root.querySelector("#myapp-remote-checkbox");
            if (checkbox) {
                checkbox.disabled = true;
            }
        }

        if (item.src) {
            this.root.viewProxy.update({itemToBeEdited: item});
        }

        /* mit Ractive.js */
        /*this.root.viewProxy.bindAction("onTextInputCompleted", (evt) => {
           alert("on text input completed.");
        });*/

        /* Konventionelle Alternative */
        /*this.root.querySelector("input[type='text']").onblur = () => {
            alert("on text input completed!");
            this.root.querySelector("h2").textContent = "MODIFIED TITLE";
        }*/

        // Bildauswahl
        this.root.viewProxy.bindAction("fileSelected", async (evt) => {
            const file = evt.original.target.files[0];
            if (!file) return;

            item.src = URL.createObjectURL(file);
            item.imgFile = file;

            try {
                const tags = await ExifReader.load(file);
                const latTag = tags["GPSLatitude"] || tags["gpsLatitude"];
                const lonTag = tags["GPSLongitude"] || tags["gpsLongitude"];
                if (latTag && lonTag) {
                    const lat = this._convertDMS(latTag.description || latTag.value);
                    const lng = this._convertDMS(lonTag.description || lonTag.value);
                    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                        item.latlng = {lat, lng};
                    }
                }
                if (!item.latlng) {
                    item.latlng = {lat: 52.52, lng: 13.405};
                }
            } catch (e) {
                console.log("EXIF read failed", e);
                item.latlng = {lat: 52.52, lng: 13.405};
            }

            if (!item.title || item.title.trim() === "") {
                const nameWithoutExt = file.name.split(".").slice(0, -1).join(".");
                item.title = nameWithoutExt;
            }

            this.root.viewProxy.update({itemToBeEdited: item});
        });

        // Formular absenden
        this.root.viewProxy.bindAction("submitForm", async (evt) => {
            evt.original.preventDefault();

            const titleInput = this.root.querySelector("input[name='title']");
            item.title = titleInput.value;

            if (!item.title || item.title.trim() === "") {
                this.root.viewProxy.setValidationError("title", "Titel: Eingabe erforderlich");
                return;
            }

            if (!item.src && !item.imgFile) {
                alert("Bitte ein Bild auswählen.");
                return;
            }

            // Remote-Checkbox auslesen (nur bei Neuanlage relevant)
            const remoteCheckbox = this.root.querySelector("#myapp-remote-checkbox");
            if (remoteCheckbox && !item.created) {
                item.remote = remoteCheckbox.checked;
            }


            // Bild lokal speichern
            if (item.imgFile) {
                if (item.remote) {
                    // Remote-Upload
                    const uploaddata = new FormData();
                    uploaddata.append("imgdata", item.imgFile);

                    const request = new XMLHttpRequest();
                    request.open("POST", "http://localhost:7077/api/upload");

                    // Warte auf erfolgreiche Antwort
                    const uploadPromise = new Promise((resolve, reject) => {
                        request.onload = () => {
                            if (request.status === 200) {
                                const responseData = JSON.parse(request.responseText);
                                item.src = "http://localhost:7077/" + responseData.data.imgdata;
                                delete item.imgFile;
                                resolve();
                            } else {
                                reject("Upload failed: " + request.statusText);
                            }
                        };
                        request.onerror = () => reject("Upload error");
                    });

                    request.send(uploaddata);
                    await uploadPromise;
                } else {
                    // Lokales Speichern
                    const fsHandler = await LocalFileSystemReferenceHandler.getInstance();
                    item.src = await fsHandler.createLocalFileSystemReference(item.imgFile);
                    delete item.imgFile;
                }
            }

            if (!item.latlng) {

                const randomLat = 52.3 + Math.random() * 0.3;
                const randomLng = 13.2 + Math.random() * 0.4;

                item.latlng = { lat: randomLat, lng: randomLng };
            }


            // Speichern und Dialog schließen
            await (item.created ? item.update() : item.create());
            this.hideDialog({item: item}, "itemUpdated");
        });

        // Abbrechen = Rückgängig
        this.root.addEventListener("mwf-dialog-cancel", () => {
            this.args.itemToBeEdited.title = this.originalItem.title;
            this.args.itemToBeEdited.src = this.originalItem.src;
            this.root.viewProxy.update({itemToBeEdited: this.args.itemToBeEdited});
        });

    }

    async onpause() {
        await super.onpause();
        console.log("onpause(): ", this);
    }

    /*_convertDMS(value) {
        if (Array.isArray(value)) {
            const vals = value.map(v => {
                if (typeof v === 'object' && v.numerator && v.denominator) {
                    return v.numerator / v.denominator;
                }
                return parseFloat(v);
            });
            const [d, m = 0, s = 0] = vals;
            return d + m / 60 + s / 3600;
        }
        if (typeof value === 'string') {
            const parts = value.match(/([0-9.]+)/g);
            if (parts) {
                const d = parseFloat(parts[0]);
                const m = parseFloat(parts[1] || '0');
                const s = parseFloat(parts[2] || '0');
                let dec = d + m / 60 + s / 3600;
                if (/[SW]/i.test(value)) {
                    dec = -dec;
                }
                return dec;
            }
        }
        if (typeof value === 'number') {
            return value;
        }
        return NaN;
    }*/

}
