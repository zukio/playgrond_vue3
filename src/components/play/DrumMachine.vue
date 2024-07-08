<template>
  <div class="drum-machine container mt-5">
    <h2 class="mb-4">Vue 3 Drum Machine</h2>
    <div class="row mb-3">
      <div class="col">
        <button @click="togglePlay" class="btn btn-primary">
          {{ isPlaying ? 'Stop' : 'Play' }}
        </button>
      </div>
      <div class="col">
        <label for="bpm" class="form-label">BPM: {{ bpm }}</label>
        <input type="range" class="form-range" id="bpm" v-model="bpm" min="60" max="180" />
      </div>
    </div>
    <div class="pattern-grid">
      <div v-for="(row, rowIndex) in pattern" :key="rowIndex" class="row mb-2">
        <div v-for="(beat, colIndex) in row" :key="colIndex" class="col">
          <button
            @click="updatePattern(rowIndex, colIndex)"
            class="btn"
            :class="beat ? 'btn-success' : 'btn-outline-secondary'"
          >
            {{ beat ? 'O' : 'X' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const audioContext: any = ref(null)
const gainNode: any = ref(null)
const drumSounds: any = ref({
  kick: null,
  snare: null,
  hihat: null
})
const isPlaying = ref(false)
const bpm = ref(120)
const currentBeat = ref(0)
const pattern = ref([
  [1, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1]
])

let intervalId: number | null = null

const initAudio = async () => {
  try {
    audioContext.value = new (window.AudioContext || window.AudioContext)()
    gainNode.value = audioContext.value.createGain()
    if (gainNode.value) gainNode.value.connect(audioContext.value.destination)

    const loadSound = async (url: string) => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        console.log(`Loaded buffer for ${url}, size: ${arrayBuffer.byteLength} bytes`)
        return await audioContext.value.decodeAudioData(arrayBuffer)
      } catch (error) {
        console.error(`Error loading sound ${url}:`, error)
        throw error
      }
    }

    drumSounds.value = {
      kick: await loadSound('/sound/GENERATE00.wav'),
      snare: await loadSound('/sound/GENERATE01.wav'),
      hihat: await loadSound('/sound/GENERATE02.wav')
    }

    console.log('All sounds loaded successfully')
  } catch (error) {
    console.error('Error initializing audio:', error)
  }
}

const playSound = (buffer: AudioBuffer) => {
  if (!buffer) {
    console.error('Attempted to play undefined buffer')
    return
  }
  const source = audioContext.value.createBufferSource()
  source.buffer = buffer
  source.connect(gainNode.value)
  source.start()
}

const togglePlay = () => {
  if (isPlaying.value) {
    if (intervalId) clearInterval(intervalId)
    isPlaying.value = false
  } else {
    const interval = ((60 / bpm.value) * 1000) / 2 // 16th notes
    intervalId = setInterval(() => {
      if (currentBeat.value % 2 === 0) {
        // 8th notes
        if (pattern.value[0][currentBeat.value / 2]) playSound(drumSounds.value.kick)
        if (pattern.value[1][currentBeat.value / 2]) playSound(drumSounds.value.snare)
      }
      if (pattern.value[2][Math.floor(currentBeat.value / 2)]) playSound(drumSounds.value.hihat)

      currentBeat.value = (currentBeat.value + 1) % 16
    }, interval)
    isPlaying.value = true
  }
}

const updatePattern = (row: number, col: number) => {
  pattern.value[row][col] = 1 - pattern.value[row][col]
}

onMounted(async () => {
  await initAudio()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
  if (audioContext.value) audioContext.value.close()
})
</script>

<style scoped>
/* スタイルは変更なし */
</style>
