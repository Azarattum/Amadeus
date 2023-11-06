<div
  class="pointer-events-none absolute left-1/2 top-0 w-max -translate-x-1/2 translate-y-[calc(-100%-0.75rem)] rounded-md bg-surface-100 px-4 py-2 text-md text-content-100 opacity-0 shadow-lg transition-composite after:absolute after:inset-0 after:-z-10 after:bg-surface-100 dark:text-content"
>
  <slot />
</div>

<style>
  div::after {
    mask: conic-gradient(
        from -30deg at bottom,
        #0000,
        #000 1deg 60deg,
        #0000 61deg
      )
      bottom / 100% 50% no-repeat;
    inset-block-end: -0.5rem;
  }

  @media (hover: hover) and (pointer: fine) {
    :global(*):hover > div {
      --tw-translate-y: calc(-100% - 0.5rem);
      transition-delay: 200ms;
      opacity: 1;
    }
  }
</style>
