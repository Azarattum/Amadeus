<script lang="ts">
  export let size = 64;
  export let cutoff = 0.3;
  export let wiggle = 0.15;
  export let duration = 2000;
  export let thickness = Math.sqrt(size);
  export let color = "hsl(var(--color-highlight))";

  $: circumference = Math.PI * (size - thickness);
</script>

<svg
  class="inline-block animate-spin"
  width="{size}px"
  height="{size}px"
  viewBox="0 0 {size} {size}"
  xmlns="http://www.w3.org/2000/svg"
  role="status"
>
  <circle
    class="animate-[dash-wiggle_var(--duration)_ease-in-out_infinite]"
    fill="none"
    stroke={color}
    stroke-dasharray={circumference}
    stroke-dashoffset={circumference * cutoff}
    stroke-width={thickness}
    stroke-linecap="round"
    cx={size / 2}
    cy={size / 2}
    r={size / 2 - thickness / 2}
    style:--back={circumference * (cutoff - wiggle)}
    style:--forth={circumference * (cutoff + wiggle)}
    style:--duration="{duration}ms"
  />
</svg>

<style global>
  @keyframes dash-wiggle {
    0%,
    100% {
      stroke-dashoffset: var(--back);
    }
    50% {
      stroke-dashoffset: var(--forth);
    }
  }
</style>
