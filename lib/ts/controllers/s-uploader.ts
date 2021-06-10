(function(){
    interface FilePreview {
        data?: string;
        name: string;
        type: string;
    };

    // TODO: (all over) get rid of those `any`s!!!

    // TODO: add /** */ JSDoc
    // TODO: generalize this function to return an array
    const fileToDataURL = (file: File) => {
        var reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onload = evt => {
                const res = evt?.target?.result;
                if (res) {
                    const { name, type } = file;
                    const data = type.indexOf("image") > -1 ? res : null;
                    resolve({ data, name, type });
                } else {
                    reject();
                }
            }
            reader.readAsDataURL(file);
        })
    }

    // TODO: add /** */ JSDoc
    const getDataURLs = (files: FileList) => {
        // `files` is spread her to map over FileList... though it doesn't support iterators
        // TODO: remove need for this ts-ignore. May require rethinging of iterator.
        // @ts-ignore
        return Promise.all([...files].map((file: File) => fileToDataURL(file)));
    }

    Stacks.application.register("s-uploader", class extends Stacks.StacksController {
        static targets = ["input", "preview", "container"];
        private inputTarget: any;
        private previewTarget: any;
        private containerTarget!: HTMLElement;
        private files: any;

        initialize() {
            this.files = [];
        }

        connect() {
            super.connect();

            this.inputTarget.addEventListener("dragenter", () => this.handleContainerActive(true));
            this.inputTarget.addEventListener("dragexit", () => this.handleContainerActive(false));
        }

        disconnect() {
            this.inputTarget.removeEventListener("dragenter", this.handleContainerActive);
            super.disconnect();
        }

        // TODO: add /** */ JSDoc
        handleInput() {
            var controller = this;
            controller.files = [];
            controller.previewTarget.innerHTML = "";
            getDataURLs(controller.inputTarget.files)
                .then(res => {
                    controller.handleVisible(true);
                    // @ts-ignore
                    res.slice(0, 5).map((file: FilePreview) => {
                        if (file) this.addFilePreview(file);
                    });
                    controller.handleContainerActive(true);
                });
        }

        // TODO: add /** */ JSDoc
        handleVisible(validInputValue: boolean) {
            var controller = this;
            var scope = controller.targets.scope;
            // TODO: This feels gross. Find a better way.
            var hideElements = scope.findAllElements('[data-s-uploader-show-when-valid="false"]');
            var showElements = scope.findAllElements('[data-s-uploader-show-when-valid="true"]');
            var enableElements = scope.findAllElements('[data-s-uploader-enable-when-valid="true"]');

            if (validInputValue) {
                hideElements.map(el => el.classList.add("d-none"));
                showElements.map(el => el.classList.remove("d-none"));
                enableElements.map(el => el.removeAttribute("disabled"));
                controller.handleContainerActive(false);
            } else {
                hideElements.map(el => el.classList.remove("d-none"));
                showElements.map(el => el.classList.add("d-none"));
                enableElements.map(el => el.setAttribute("disabled", "true"))
            }
        }

        // TODO: add /** */ JSDoc
        addFilePreview(file: FilePreview) {
            var controller = this;
            var preview = controller.previewTarget;
            const isImage = file.data;

            let element;
            if (isImage) {
                element = document.createElement("img");
                element.src = file.data || "";
                element.alt = file.name;
            } else {
                element = document.createElement("div");
                element.innerHTML = file.name;
            }
            element.classList.add("s-uploader--preview-item")
            preview.appendChild(element);
        }

        // TODO: add /** */ JSDoc
        handleContainerActive(shouldHighlight: boolean) {
            var controller = this;
            var container = controller.containerTarget;

            if (shouldHighlight) {
                container.classList.add("is-active");
            } else {
                container.classList.remove("is-active");
            }
        }

        // TODO: add /** */ JSDoc
        reset() {
            var controller = this;
            controller.inputTarget.value = null;
            controller.previewTarget.innerHTML = "";
            controller.handleVisible(false);
            controller.files = [];
        }

    });
})();
