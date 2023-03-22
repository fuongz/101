<template>
  <div class="max-w-2xl mx-auto px-4 xl:px-0 mt-12 font-mono">
    <h1 class="text-4xl text-center font-medium">
      Coin profit/loss calculator
    </h1>

    <div class="mt-16">
      <div class="form-group">
        <label for="investment" class="form-label"> Select coin: </label>
        <multi-select
          v-model="form.coin"
          :searchable="true"
          :options="priceOptions"
          placeholder="Click to select a crypto-currency"
          :classes="{
            container:
              'px-4 py-3 relative mx-auto w-full flex items-center justify-end box-border cursor-pointer border border-gray-300 rounded bg-white text-base leading-snug outline-none dark:border-0 dark:bg-transparent rounded',
            search:
              'w-full rounded absolute inset-0 outline-none appearance-none box-border border-0 text-base font-sans bg-white rounded pl-3.5 dark:bg-dark-800 dark:text-gray-300',
            noOptions: 'py-2 px-3 text-gray-600 bg-white dark:text-white',
            noResults: 'py-2 px-3 text-gray-600 bg-white dark:text-white',
            dropdown:
              'absolute -left-px -right-px bottom-0 transform translate-y-full border border-gray-300 -mt-px overflow-y-scroll z-50 bg-white flex flex-col rounded-b dark:bg-gray-700 dark:border-transparent',
            option:
              'flex items-center justify-start box-border text-left cursor-pointer font-medium text-base leading-snug py-2 px-3 dark:text-white',
          }"
          @select="setCoin"
        />
      </div>
    </div>

    <loading :busy="loading.commonCoins" class="mt-6">
      <h4 class="mb-1 text-sm text-gray-500 dark:text-gray-400">Popular:</h4>
      <div class="flex items-center space-x-4">
        <div
          v-for="coin in commonCoinOptions"
          :key="`common-coin-${coin.label}`"
          class="coin-badge"
          @click="setCoin(coin.value, coin)"
        >
          {{ coin.label }}
        </div>
      </div>
    </loading>

    <div v-if="coinsCached && coinsCached.length > 0" class="mt-6">
      <h4 class="mb-1 text-sm text-gray-500 dark:text-gray-400">History:</h4>
      <div class="flex items-center space-x-4">
        <div
          v-for="coinCache in coinsCached"
          :key="`common-coin-${coinCache.label}`"
          class="coin-badge"
          @click="setCoin(coinCache.value, coinCache)"
        >
          {{ coinCache.label }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-12 mt-16">
      <div class="form-group">
        <label for="investment" class="form-label"> Investment </label>
        <input
          id="investment"
          v-model="form.investment"
          placeholder="Investment"
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="initial-coin-price" class="form-label">
          Initial Coin Price
        </label>
        <input
          id="initial-coin-price"
          v-model="form.initialCoinPrice"
          placeholder="Initial Coin Price"
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="selling-coin-price" class="form-label">
          Selling Coin Price
        </label>
        <input
          id="selling-coin-price"
          v-model="form.sellingCoinPrice"
          placeholder="Selling Coin Price"
          class="input"
        />
      </div>
    </div>

    <div class="mt-4">
      <h3>
        Total: <b>{{ total }}</b>
      </h3>
      <p></p>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import Loading from '~/components/common/loading.vue'
  import MultiSelect from '@vueform/multiselect'
  import '@vueform/multiselect/themes/default.css'
  import { useLocalStorage } from '@vueuse/core'
  import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

  const form = ref<any>({
    coin: null,
    investment: 1,
    initialCoinPrice: 0,
    sellingCoinPrice: 0,
  })
  const loading = reactive<any>({
    commonCoins: false,
  })
  const interval = ref<any>({
    prices: null,
  })
  const coinsCached = useLocalStorage<any>('coins_cached', [])

  const priceOptions = ref<any>([])
  const commonCoinOptions = ref<any>([])
  const commonCoins = ['BTCUSDT', 'ETHUSDT', 'DOGEUSDT']

  const setCoin = (coin: any, val = null) => {
    if (val !== null) {
      coinsCached.value = [...coinsCached.value, val]
        .filter((v, i, a) => a.findIndex((t) => t.value === v.value) === i)
        .reverse()
        .slice(0, 6)
    }

    const coinValue = Number(coin) > 0 ? Number(coin) : Number(coin).toFixed(4)
    form.value.initialCoinPrice = coinValue
    form.value.sellingCoinPrice = coinValue
  }

  const total = computed(() => {
    const { investment, initialCoinPrice, sellingCoinPrice } = form.value
    return Number(
      Number(sellingCoinPrice * investment) -
        Number(initialCoinPrice * investment)
    )
  })

  const fetchPrices = async () => {
    const priceResponse = await fetch(`http://localhost:5001/v1/prices`).then(
      (res) => res.json()
    )
    priceOptions.value = Object.keys(priceResponse).map((k: any) => ({
      value: Number(priceResponse[k]),
      label: k,
    }))
    commonCoinOptions.value = priceOptions.value.filter((v: any) =>
      commonCoins.includes(v.label)
    )
  }

  onMounted(async () => {
    loading.commonCoins = true
    await fetchPrices()
    interval.value.prices = setInterval(async () => await fetchPrices(), 10000)
    loading.commonCoins = false
  })

  onUnmounted(() => clearInterval(interval.value.prices))
</script>

<style scoped>
  .coin-badge {
    @apply rounded px-4 py-2 font-medium transition bg-gray-200 cursor-pointer hover:(bg-gray-300) dark:(bg-dark-700 text-white) dark:hover:(bg-dark-400);
  }
</style>
