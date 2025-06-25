<script lang="ts">
  import type { Imposter } from "../app";
  import toast from "svelte-french-toast";
  import stubSchema from "./stubschema.json";
  import { TrashIcon } from "@rgossiaux/svelte-heroicons/outline";
  import {
    JSONEditor,
    Mode,
    createAjvValidator,
    type Content,
    type TextContent
  } from "svelte-jsoneditor";
  import Trash from "@rgossiaux/svelte-heroicons/outline/Trash";

  let { dialogRef = $bindable(), onEditorClose, ...props } = $props();
  let imposter: Imposter | null = $state(null);
  let fetchResult: "loading" | ["failed", string] | "success" =
    $state("loading");

  let editorProps: { content: Content | undefined; mode: Mode } = $state({
    content: { json: {}, text: "" },
    mode: Mode.text
  });

  const schemaValidator = createAjvValidator({ schema: stubSchema });

  export const startEditing = async (port: number) => {
    try {
      const req = await fetch(`/api/mb/imposters/${port}`);
      const res = (await req.json()) as Imposter;
      imposter = res;
      const filteredStubs = res.stubs.map((x) => {
        return {
          responses: x.responses,
          predicates: x.predicates
        };
      });
      editorProps.content = { json: { stubs: filteredStubs } };
      fetchResult = "success";
      dialogRef?.show();
    } catch (exception) {
      fetchResult = ["failed", "Exception"];
      console.log(exception);
    }
  };

  const onImposterSave = async () => {
    //@ts-ignore - fuck typescript sometimes holy shit
    if (editorProps?.content?.json) {
      return;
    }
    console.log(editorProps.content);
    var req = await fetch(`/api/mb/imposters/${imposter?.port}/stubs`, {
      method: "PUT",
      body: (editorProps.content as TextContent).text
    });

    if (req.status === 200) {
      toast.success("Saved stubs!", { position: "bottom-center" });
      return;
    }

    const error = await req.json();
    if (error.error) {
      toast.error("Server error saving stubs! See console!", {
        position: "bottom-center"
      });
      return;
    }
    if (error.code) {
      toast.error(error.code, { position: "bottom-center" });
      return;
    }
  };

  const onImposterDelete = async () => {
    var req = await fetch(`/api/mb/imposters/${imposter?.port}`, {
      method: "DELETE"
    });

    console.log(req);
    console.log(await req.json());
    dialogRef?.close();
  };

  const onClose = async () => {
    await onEditorClose();
    dialogRef?.close();
  };
</script>

<dialog
  bind:this={dialogRef}
  onclose={async () => await onClose()}
  id="json_editor_modal"
  class="modal p-5"
>
  <div class="modal-box min-w-5/6 h-full rounded-xl p-0">
    <div class="grid grid-cols-6 h-full">
      <div
        class="col-span-2 flex flex-col  rounded-bl-xl rounded-tl-2l p-3"
      >
        <div class="prose grow flex flex-col">
          <h2 class="text-center">{imposter?.name}</h2>
          <div class="rounded-xl bg-base-200 p-3 py-2">
            <table class="table !m-0">
              <tbody>
                <tr>
                  <td class="font-bold">Port</td>
                  <td class="text-center">{imposter?.port}</td>
                </tr>
                <tr>
                  <td class="font-bold">Protocol</td>
                  <td class="text-center">{imposter?.protocol}</td>
                </tr>
                <tr>
                  <td class="font-bold">Imposter page</td>
                  <td class="text-center"
                    ><a
                      class="text-base-content underline"
                      target="_blank"
                      href={`http://localhost:2525/imposters/${imposter?.port}`}
                      >Link</a
                    ></td
                  >
                </tr>
                <tr>
                  <td class="font-bold">Record Requests</td>
                  <td class="text-center"
                    >{imposter?.recordRequests?.toString()}</td
                  >
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="grid grid-cols-8 gap-2">
          <button
            class="btn btn-error rounded-full col-span-1 p-0"
            onclick={onImposterDelete}><div class="w-6 text-zinc-200/80"><TrashIcon/></div></button
          >
          <button
            class="btn btn-info rounded-xl col-span-3"
            onclick={() => dialogRef.close()}>Close</button
          >
          <button
            class="btn btn-secondary rounded-xl col-span-4"
            onclick={() => onImposterSave()}>Save</button
          >
        </div>
      </div>
      <div class="col-span-4 flex flex-col h-full json-editor jse-theme-dark">
        {#if fetchResult === "success"}
          <JSONEditor
            {...editorProps}
            mainMenuBar={false}
            bind:content={editorProps.content}
            validator={schemaValidator}
          />
        {:else if Array.isArray(fetchResult)}
          <div>Error</div>
        {:else}
          <div>Loading</div>
        {/if}
      </div>
    </div>
  </div>
</dialog>

<style>
  @import "svelte-jsoneditor/themes/jse-theme-dark.css";
</style>
