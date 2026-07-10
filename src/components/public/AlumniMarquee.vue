<script setup lang="ts">
import { ALUMNI } from '@/content/alumni'

// Two independent, oppositely-scrolling rows read better than one long belt —
// split the pool roughly in half.
const mid = Math.ceil(ALUMNI.length / 2)
const rowA = ALUMNI.slice(0, mid)
const rowB = ALUMNI.slice(mid)
</script>

<template>
  <div class="space-y-3 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
    <div class="marquee-row">
      <div class="marquee-track marquee-left">
        <div v-for="(person, i) in [...rowA, ...rowA]" :key="`a-${i}`" class="alumnus-card" :title="person.bio">
          <img :src="person.photoUrl" :alt="person.name" loading="lazy" class="alumnus-photo" />
          <div class="alumnus-scrim" />
          <p class="alumnus-name">{{ person.name }}</p>
        </div>
      </div>
    </div>
    <div class="marquee-row">
      <div class="marquee-track marquee-right">
        <div v-for="(person, i) in [...rowB, ...rowB]" :key="`b-${i}`" class="alumnus-card" :title="person.bio">
          <img :src="person.photoUrl" :alt="person.name" loading="lazy" class="alumnus-photo" />
          <div class="alumnus-scrim" />
          <p class="alumnus-name">{{ person.name }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee-row {
  overflow: hidden;
}

.marquee-track {
  display: flex;
  gap: 3px;
  width: max-content;
}

.marquee-left {
  animation: marquee-scroll-left 110s linear infinite;
}

.marquee-right {
  animation: marquee-scroll-right 110s linear infinite;
}

.marquee-row:hover .marquee-track {
  animation-play-state: paused;
}

.alumnus-card {
  position: relative;
  flex-shrink: 0;
  width: 9.5rem;
  height: 9.5rem;
  overflow: hidden;
}

.alumnus-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(100%);
  transition: filter 0.25s ease;
}

.alumnus-card:hover .alumnus-photo {
  filter: grayscale(0%);
}

.alumnus-scrim {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0) 55%);
}

.alumnus-name {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.6rem;
  padding: 0 0.65rem;
  color: white;
  font-weight: 800;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 1.15;
}

@keyframes marquee-scroll-left {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes marquee-scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none !important;
  }
}
</style>
