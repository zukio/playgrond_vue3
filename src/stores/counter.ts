import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }
  const demoData = ref()

  function getDemoData() {
    return demoData.value.forEach((i: number, value: any) => {
      value.index = i
    })
  }
  async function fetchDemoData() {
    // データを取得するロジック
    // 例: API呼び出し
    // demoData.value = await fetchFromAPI()
    const payload = {
      message: ''
    }
    return await fetch(
      'https://script.google.com/macros/s/AKfycbxI0fzQA1HSjfkkbpbLyFXUKpT9T6zw0TyeooIydzdjWjoSsgDYcxjE/exec' /*,
			{
				method: 'GET',
				headers: new Headers({
					'content-type': 'application/json'
				})
			}*/
    )
      .then((response) => {
        return response.json()
      })
      .then(
        (res) => {
          payload.message = res
          demoData.value = payload
          return true
        },
        (error) => {
          console.log('error' + error)
          return false
        }
      )
  }

  return { count, doubleCount, increment, fetchDemoData, demoData, getDemoData }
})
