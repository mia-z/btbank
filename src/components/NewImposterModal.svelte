<script lang="ts">
  import type { Imposter } from "../app";

  let { dialogRef = $bindable(), onModalSuccess, ...props } = $props();
  let saving: boolean = $state(false);
  let newImposterNameParts: {
    username: string;
    systemName: string;
    projectName: string;
  } = $state({ username: "", systemName: "", projectName: "" });
  let newImposterPort: number | null = $state(null);
  let validationErrors: {
    username: boolean;
    systemName: boolean;
    projectName: boolean;
    port: boolean;
    errorMessage: string;
  } = $state({
    username: false,
    systemName: false,
    projectName: false,
    port: false,
    errorMessage: ""
  });
  let recordRequestsChecked = $state(true)

  const closeWithSuccess = async () => {
    await onModalSuccess();
    dialogRef?.close();
  };

  const onSaveClick = async () => {
    saving = true;
    try {
      if (!newImposterNameParts.username.match(/^[a-zA-Z0-9]*$/)) {
        validationErrors.username = true;
        validationErrors.errorMessage =
          "Username must be only a-z and 0-9, no spaces.";
        return;
      }

      if (
        newImposterNameParts.username.length < 2 ||
        newImposterNameParts.username.length > 20
      ) {
        validationErrors.username = true;
        validationErrors.errorMessage =
          "Username must be between 1 and 30 characters.";
        return;
      }

      validationErrors.username = false;

      if (!newImposterNameParts.systemName.match(/^[a-zA-Z0-9]*$/)) {
        validationErrors.systemName = true;
        validationErrors.errorMessage =
          "System name must be only a-z and 0-9, no spaces.";
        return;
      }

      if (
        newImposterNameParts.systemName.length < 2 ||
        newImposterNameParts.systemName.length > 20
      ) {
        validationErrors.systemName = true;
        validationErrors.errorMessage =
          "System name must be between 1 and 30 characters.";
        return;
      }

      validationErrors.systemName = false;

      if (!newImposterNameParts.projectName.match(/^[a-zA-Z0-9]*$/)) {
        validationErrors.projectName = true;
        validationErrors.errorMessage =
          "Project name must be only a-z and 0-9, no spaces.";
        return;
      }

      if (
        newImposterNameParts.projectName.length < 2 ||
        newImposterNameParts.projectName.length > 20
      ) {
        validationErrors.projectName = true;
        validationErrors.errorMessage =
          "Project name must be between 1 and 30 characters.";
        return;
      }

      validationErrors.projectName = false;

      if (
        newImposterPort === null ||
        (newImposterPort !== null &&
          (newImposterPort < 1024 || newImposterPort > 65535))
      ) {
        validationErrors.port = true;
        validationErrors.errorMessage = "port must be between 1025 and 65535.";
        return;
      }

      validationErrors.port = false;
      validationErrors.errorMessage = "";

      const builtName = `${newImposterNameParts.username}_${newImposterNameParts.systemName}_${newImposterNameParts.projectName}`;

      const req = await fetch("/api/mb/imposters", {
        method: "POST",
        body: JSON.stringify({
          protocol: "http",
          name: builtName,
          port: newImposterPort,
          recordRequests: recordRequestsChecked,
          defaultResponse: {
            statusCode: 200,
            body: "Default response - No match",
            headers: {}
          },
          stubs: [
            {
              responses: [
                {
                  is: { statusCode: 200 ,body: "Example stub" }
                }
              ],
              predicates: []
            }
          ]
        })
      });

      if (req.status !== 200) {
        const errors = await req.json();
        console.log(errors);
        if (errors.error) {
          validationErrors.errorMessage =
            "Server error creating imposter! See console.";
          return;
        }
        if (errors.code && errors.code === "EADDRINUSE") {
          validationErrors.errorMessage = "Port already in use.";
          validationErrors.port = true;
          return;
        }
      }
      await closeWithSuccess();
    } catch (exception) {
      console.log(exception);
    } finally {
      saving = false;
    }
  };

  const onClose = () => {
    validationErrors.username = false;
    validationErrors.projectName = false;
    validationErrors.systemName = false;
    validationErrors.port = false;
    validationErrors.errorMessage = "";
    newImposterPort = null;
    newImposterNameParts = { projectName: "", systemName: "", username: "" };
  };
</script>

<dialog
  bind:this={dialogRef}
  onclose={() => onClose()}
  id="new_imposter_modal"
  class="modal p-5"
>
  <div class="modal-box min-w-2xl rounded-2xl">
    <div class="flex flex-col">
      <div class="w-full prose">
        <h3 class="font-bold text-center">Create Imposter</h3>
      </div>
      <div class="grid grid-cols-3 grid-flow-row gap-3 mt-2 p-3 bg-base-200 border-base-300 shadow-xl rounded-lg">
        <label for="imposter-username-input" class="open-sans text-sm">
          Username
          <input
            id="imposter-username-input"
            class:input-info={!validationErrors.username}
            class:input-error={validationErrors.username}
            bind:value={newImposterNameParts.username}
            disabled={saving}
            class="col-span-1 input focus:outline-1 rounded-xl rounded-tl-sm"
            placeholder="eg, ryacoc"
          />
        </label>
        <label for="imposter-systemname-input" class="open-sans text-sm">
          System name
          <input
            id="imposter-systemname-input"
            class:input-info={!validationErrors.systemName}
            class:input-error={validationErrors.systemName}
            bind:value={newImposterNameParts.systemName}
            disabled={saving}
            class="col-span-1 input focus:outline-1 rounded-xl rounded-tl-sm"
            placeholder="eg, db01mb001"
          />
        </label>
        <label for="imposter-projectname-input" class="open-sans text-sm">
          Project name
          <input
            id="imposter-projectname-input"
            class:input-info={!validationErrors.projectName}
            class:input-error={validationErrors.projectName}
            bind:value={newImposterNameParts.projectName}
            disabled={saving}
            class="col-span-1 input focus:outline-1 rounded-xl rounded-tl-sm"
            placeholder="eg MountebankTesting"
          />
        </label>
        <hr class="col-span-3 text-base-100"/>
        <label for="imposter-port-input" class="col-span-1 open-sans text-sm my-auto">
          Port
          <input
            id="imposter-port-input"
            type="number"
            class:input-info={!validationErrors.port}
            class:input-error={validationErrors.port}
            bind:value={newImposterPort}
            disabled={saving}
            class="grow input focus:outline-1 rounded-xl rounded-tl-sm"
            placeholder="ie 3030, 10010"
          />
        </label>
        <label for="imposter-protocol-input" class="col-span-1 open-sans text-sm my-auto">
          Protocol
          <input
            id="imposter-protocol-input"
            value="http"
            readonly
            class="grow input input-info opacity-50 focus:outline-none rounded-xl rounded-tl-sm"
            placeholder=""
          />
        </label>
        <div class="flex flex-col col-span-1">
          <label for="imposter-record-requests-checkbox" class="col-span-1 text-center open-sans text-sm my-auto">
            Record requests
          </label>
          <div class="mx-auto">
            <input
              id="imposter-record-requests-checkbox"
              type="checkbox"
              bind:checked={recordRequestsChecked}
              class="checkbox checkbox-info focus:outline-1 rounded-xl rounded-t-sm"
            />
          </div>
        </div>
        {#if validationErrors.errorMessage !== ""}
          <div class="open-sans font-bold text-sm text-center text-error col-span-3 p-1">
            {validationErrors.errorMessage}
          </div>
        {/if}
      </div>
      <div class="grid mt-3 grid-cols-2 gap-3">
        <button
          class="col-span-1 btn btn-info rounded-xl"
          onclick={() => dialogRef.close()}>Close</button
        >
        <button
          disabled={saving}
          onclick={() => onSaveClick()}
          class="col-span-1 btn btn-secondary rounded-xl">Save</button
        >
      </div>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
