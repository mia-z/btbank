<script lang="ts">
  import "../app.css";
  import { Toaster } from "svelte-french-toast";

  let { children } = $props();
</script>

<div class="flex flex-col min-h-screen pb-5">
  <header class="mt-5 p-2 mx-auto container rounded relative">
    <div class="contents prose-sm lg:prose">
      <h1 class="text-center">Mountebank Mock Config</h1>
    </div>
  </header>

  <main class="mt-5 self-center grow w-md">
    {@render children()}
  </main>

  <Toaster />
</div>

<style>
  :global(html) {
    background-color: var(--color-base-200);
  }

  h1 {
    letter-spacing: 0;
    display: block;

    background: linear-gradient(
      270deg,
      oklch(60.682% 0.108 309.782),
      oklch(54.615% 0.215 262.88),
      oklch(85.661% 0.144 198.645),
      oklch(60.682% 0.108 309.782),
      oklch(93.426% 0.102 94.555),
      oklch(54.615% 0.215 262.88),
      oklch(60.682% 0.108 309.782)
    );
    background-size: 200% 200%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;

    animation: rainbowMove 15s linear infinite;
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }

  @keyframes rainbowMove {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
