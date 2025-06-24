<script lang="ts">
  import type { Imposter } from "../app";

  let { dialogRef = $bindable(), onModalSuccess, ...props } = $props();
  let saving: boolean = $state(false);
  let newImposterName: string = $state("");
  let newImposterPort: number | null = $state(null);
  let validationErrors: { name: boolean; port: boolean; errorMessage: string } =
    $state({
      name: false,
      port: false,
      errorMessage: ""
    });

  const closeWithSuccess = async () => {
    await onModalSuccess();
    dialogRef?.close();
  };

  const onSaveClick = async () => {
    saving = true;
    try {
      if (!newImposterName.match(/^[a-zA-Z0-9\s]*$/)) {
        validationErrors.name = true;
        validationErrors.errorMessage =
          "Imposter name must be only a-z and 0-9, no spaces.";
        return;
      }

      if (newImposterName.length < 2 || newImposterName.length > 30) {
        validationErrors.name = true;
        validationErrors.errorMessage =
          "Imposter name must be between 1 and 30 characters.";
        return;
      }

      validationErrors.name = false;

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

      var req = await fetch("/api/mb/imposters", {
        method: "POST",
        body: JSON.stringify({
          protocol: "http",
          name: newImposterName,
          port: newImposterPort,
          recordRequests: true,
          defaultResponse: {
            statusCode: 200,
            body: "Ok",
            headers: {}
          },
          stubs: [
            {
              responses: [
                {
                  statusCode: 200,
                  is: { body: "Example stub" }
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
    validationErrors.name = false;
    validationErrors.port = false;
    validationErrors.errorMessage = "";
    newImposterPort = null;
    newImposterName = "";
  };
</script>

<dialog
  bind:this={dialogRef}
  onclose={() => onClose()}
  id="new_imposter_modal"
  class="modal p-5"
>
  <div class="modal-box rounded-2xl">
    <div class="grid grid-cols-6 grid-flow-row gap-3 prose">
      <h3 class="font-bold col-span-6 text-center">Create Imposter</h3>
      <input
        id="imposter-name-input"
        class:input-info={!validationErrors.name}
        class:input-error={validationErrors.name}
        bind:value={newImposterName}
        disabled={saving}
        class="col-span-4 input focus:outline-1 rounded-full"
        placeholder="Imposter name"
      />
      <input
        id="imposter-port-input"
        type="number"
        class:input-info={!validationErrors.port}
        class:input-error={validationErrors.port}
        bind:value={newImposterPort}
        disabled={saving}
        class="col-span-2 input focus:outline-1 rounded-full"
        placeholder="Imposter port"
      />
      {#if validationErrors.errorMessage !== ""}
        <div class="text-xs text-error col-span-6">
          {validationErrors.errorMessage}
        </div>
      {/if}
      <button
        class="btn btn-info col-span-3 rounded-full"
        onclick={() => dialogRef.close()}>Close</button
      >
      <button
        disabled={saving}
        onclick={() => onSaveClick()}
        class="btn btn-secondary col-span-3 rounded-full">Save</button
      >
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
