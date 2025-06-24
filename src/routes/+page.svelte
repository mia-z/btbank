<script lang="ts">
  import { onMount } from "svelte";
  import ImposterEditor from "../components/ImposterEditor.svelte";
  import type { PageData } from "./$types";
  import NewImposterModal from "../components/NewImposterModal.svelte";

  let { data }: PageData = $props();

  let imposters = $state(data.imposters);

  let editor: ImposterEditor | undefined = $state();
  let newImposterModal: HTMLDialogElement | undefined = $state();

  const onImposterCardClick = (port: number) => {
    editor?.startEditing(port);
  };

  const onNewImposterClick = () => {
    newImposterModal?.show();
  };

  const refreshImposterList = async () => {
    const req = await fetch(`/api/mb/imposters`);
    const res = await req.json();
    imposters = res.imposters;
  };
</script>

<div class="flex flex-col">
  <div class="grid grid-cols-4 gap-3">
    <button
      class="btn btn-secondary rounded-full col-span-3"
      onclick={() => onNewImposterClick()}>New Imposter</button
    >
    <button class="btn btn-accent rounded-full col-span-1">Logs</button>
  </div>
  <div class="flex mt-3 space-y-3 flex-col">
    {#if imposters?.length > 0}
      {#each imposters as imposter}
        {@render imposter_card(imposter)}
      {/each}
    {:else}
      <button class="btn btn-info rounded-full" disabled
        >No imposters found</button
      >
    {/if}
  </div>
</div>

<ImposterEditor
  bind:this={editor}
  onEditorClose={async () => await refreshImposterList()}
/>

<NewImposterModal
  bind:dialogRef={newImposterModal}
  onModalSuccess={async () => await refreshImposterList()}
/>

{#snippet imposter_card(imposter: any)}
  {@const { name, protocol, port, numberOfRequests } = imposter}
  <button
    class="btn btn-info p-1 px-5 shadow-xl h-full open-sans bg-info rounded-full"
    onclick={() => onImposterCardClick(port)}
  >
    <div class="flex flex-col w-full">
      <div class="flex flex-row">
        <p>{name}</p>
      </div>
      <div class="w-full flex flex-row justify-between">
        <p>Port: {port}</p>
        <p class="ml-auto opacity-70">Request count: {numberOfRequests}</p>
      </div>
    </div>
  </button>
{/snippet}
