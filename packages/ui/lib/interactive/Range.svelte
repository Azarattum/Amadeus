<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { hold } from "../../action";

  const dispatch = createEventDispatcher<{
    forward: void;
    rewind: void;
    reset: void;
  }>();

  export let format = (x: number) => x.toString();
  export let controls = false;
  export let hints = false;
  export let p = false;
  export let value = 0;
  export let skip = 10;
  export let max = 100;
  export let min = 0;

  let holding = false;
</script>

<div class={p ? "px-4 pt-8" : ""}>
  <div class="px-2">
    <input
      class="relative w-full cursor-pointer appearance-none rounded bg-transparent outline-2 outline-offset-2 outline-primary-600 focus-visible:outline"
      style="--progress:{((value - min) / (max - min)) * 100}%"
      type="range"
      {min}
      {max}
      bind:value
    />
  </div>
  {#if hints}
    <div
      class="flex w-full justify-between text-sm"
      class:pointer-events-none={!controls}
    >
      <button
        class="group rounded-lg p-2 text-content-200 outline-2 outline-primary-600 transition-paint focus-visible:bg-highlight focus-visible:outline active:scale-95 hover:bg-highlight"
        on:click={() =>
          holding
            ? ((holding = false), dispatch("reset"))
            : (value = Math.max(value - skip, min))}
        on:hold={() => ((holding = true), dispatch("rewind"))}
        use:hold={{ mouse: true }}
      >
        {format(value)}
        <div
          class="flex items-center opacity-0 transition-opacity group-focus-visible:opacity-100 group-hover:opacity-100"
        >
          <svg
            fill="hsl(var(--color-content-200)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 7 10"
            height="10"
            width="7"
          >
            <path
              d="M0.190422 5.42655C-0.0634185 5.19098 -0.0634185 4.80903 0.190422 4.57345L4.92804 0.176684C5.18188 -0.0588945 5.59343 -0.0588946 5.84728 0.176684C6.10112 0.412262 6.10112 0.794209 5.84728 1.02979L1.10966 5.42655C0.855821 5.66213 0.444263 5.66213 0.190422 5.42655Z"
            />
            <path
              d="M0.190422 4.57345C0.444263 4.33787 0.855738 4.33787 1.10958 4.57345L5.84719 8.97021C6.10103 9.20579 6.10103 9.58774 5.84719 9.82332C5.59335 10.0589 5.18179 10.0589 4.92795 9.82332L0.190422 5.42655C-0.0634185 5.19098 -0.0634185 4.80903 0.190422 4.57345Z"
            />
          </svg>
          <div class="h-[1.3px] grow rounded bg-content-200" />
        </div>
      </button>
      <button
        class="group rounded-lg p-2 text-content-200 outline-2 outline-primary-600 transition-paint focus-visible:bg-highlight focus-visible:outline active:scale-95 hover:bg-highlight"
        on:click={() =>
          holding
            ? ((holding = false), dispatch("reset"))
            : (value = Math.min(value + skip, max))}
        on:hold={() => ((holding = true), dispatch("forward"))}
        use:hold={{ mouse: true }}
      >
        {format(max - value)}
        <div
          class="flex items-center opacity-0 transition-opacity group-focus-visible:opacity-100 group-hover:opacity-100"
        >
          <div class="h-[1.3px] grow rounded bg-content-200" />
          <svg
            fill="hsl(var(--color-content-200)"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 7 10"
            height="10"
            width="7"
          >
            <path
              d="M6.80958 5.42655C7.06342 5.19098 7.06342 4.80903 6.80958 4.57345L2.07196 0.176684C1.81812 -0.0588945 1.40657 -0.0588946 1.15272 0.176684C0.898884 0.412262 0.898884 0.794209 1.15272 1.02979L5.89034 5.42655C6.14418 5.66213 6.55574 5.66213 6.80958 5.42655Z"
            />
            <path
              d="M6.80958 4.57345C6.55574 4.33787 6.14426 4.33787 5.89042 4.57345L1.15281 8.97021C0.898969 9.20579 0.898969 9.58774 1.15281 9.82332C1.40665 10.0589 1.81821 10.0589 2.07205 9.82332L6.80958 5.42655C7.06342 5.19098 7.06342 4.80903 6.80958 4.57345Z"
            />
          </svg>
        </div>
      </button>
    </div>
  {/if}
</div>

<style lang="postcss">
  input {
    &::after {
      content: "";
      display: block;
      position: absolute;
      inset: -4px;
    }

    &::-webkit-slider-runnable-track {
      appearance: none;
      height: 4px;
      border-radius: 4px;
      background:
        linear-gradient(
            to right,
            hsl(var(--color-primary-600)),
            hsl(var(--color-primary-600))
          )
          0 / var(--progress) 100% no-repeat,
        hsl(var(--color-primary-200));
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      position: relative;
      width: 32px;
      height: 32px;
      margin-top: -14px;
      border-radius: 100%;
      z-index: 100;
      background: radial-gradient(
          circle,
          hsl(var(--color-primary-600)),
          hsl(var(--color-primary-600)) 20%,
          transparent 22%,
          transparent 100%
        )
        50% 50%;

      pointer-events: auto;
      transform: translateX(calc(var(--progress) - 50%));
      background-size: 100%;
      transition: background-size 0.3s ease;
      box-shadow: none;
    }

    @media (hover: hover) and (pointer: fine) {
      &::-webkit-slider-thumb:hover {
        background-size: 500%;
      }
    }

    @media (pointer: coarse) {
      & {
        pointer-events: none;
      }

      &::-webkit-slider-thumb:active {
        background-size: 500%;
      }
    }
  }
</style>
