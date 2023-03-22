<template>
  <div class="max-w-4xl mx-auto px-4 xl:px-0 py-4 font-mono">
    <h1
      class="
        text-3xl
        font-semibold
        text-center text-gray-600
        dark:text-gray-300
      "
    >
      Binance Futures: Balance Target
    </h1>
    <div class="grid grid-cols-3 gap-4 mt-16">
      <div>
        <p class="font-light text-gray-600 dark:text-gray-300">Margin</p>
        <h2
          class="text-3xl"
          :class="{
            'text-red-600': data.currentBalance < data.crossWalletBalance,
            'text-green-500': data.currentBalance > data.crossWalletBalance,
            'text-blue-600': data.currentBalance === data.crossWalletBalance,
          }"
        >
          {{ data.currentBalance }}
          <sup class="text-base text-gray-600 dark:text-gray-400">
            {{ data.asset }}
          </sup>
        </h2>
        <h4 class="text-blue-600 text-xs mt-4">
          Balance:
          <span class="mt-2 text-base font-semibold">
            {{ data.crossWalletBalance }}
            <sup>{{ data.asset }}</sup>
          </span>
        </h4>
        <p
          class="mt-2"
          :class="{
            'text-red-600': data.crossUnPnl < 0,
            'text-green-500': data.crossUnPnl > 0,
            'text-gray-600': data.crossUnPnl === 0,
          }"
        >
          <span class="text-gray-600 text-xs mr-2 dark:text-gray-400"
            >Unrealized PNL:</span
          >
          <template v-if="data.crossUnPnl > 0">+ </template
          >{{ data.crossUnPnl }}
          <span class="text-xs">{{ data.asset }}</span>
        </p>

        <div class="mt-16">
          <p class="text-gray-600 mb-2 dark:text-gray-300">History</p>

          <div
            v-for="item in histories"
            :key="item"
            class="font-light text-sm mb-1"
            :class="{
              'text-red-600': item.sign === '-',
              'text-green-600': item.sign === '+',
              'text-blue-600': item.sign === null,
            }"
          >
            {{ item.sign }} {{ item.balance }}
            <span class="text-gray-600 text-xs mt-1 dark:text-gray-400">
              {{ new Date(item.time).toLocaleString('en-US') }}
            </span>
          </div>
        </div>
      </div>

      <div>
        <p class="font-light text-gray-600 dark:text-gray-300">Distance</p>
        <h2 class="text-3xl" :class="{ 'text-red-600': data.distance >= 0 }">
          <template v-if="data.distance >= 0">- </template>{{ data.distance }}
          <sup class="text-base text-gray-600 dark:text-gray-400">{{
            data.asset
          }}</sup>
        </h2>
      </div>

      <div>
        <p class="font-light text-gray-600 dark:text-gray-300">Target</p>
        <h2 class="text-3xl text-purple-600">
          {{ data.targetBalance }}
          <sup class="text-base text-gray-600 dark:text-gray-400">
            {{ data.asset }}
          </sup>
        </h2>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, nextTick, onMounted, onUnmounted, reactive } from 'vue'
  import { useRoute } from 'vue-router'

  const data = reactive<any>({
    currentBalance: 0,
    targetBalance: 0,
    crossUnPnl: 0,
    distance: 0,
    asset: 'USDT',
    crossWalletBalance: 0,
    history: [],
    fetchInterval: null,
  })

  const routes = useRoute()

  onMounted(async () => {
    await nextTick()
    await fetchData()
    data.fetchInterval = setInterval(async () => await fetchData(), 2000)
  })

  onUnmounted(() => {
    clearInterval(data.fetchInterval)
  })

  const fetchData = async () => {
    const cached = localStorage.getItem('crossUnPnl')
    if (cached) {
      const currentCached = JSON.parse(cached)
      data.history = currentCached
    }

    const $target = localStorage.getItem('target')
    data.targetBalance = routes.query.target || $target
    if (!$target && !routes.query.target) data.targetBalance = 100
    if ($target !== data.targetBalance)
      localStorage.setItem('target', data.targetBalance)
    const response = await fetch(
      `http://localhost:5001/v1/balance?target=${data.targetBalance}`
    ).then((res) => res.json())
    data.currentBalance = response.currentBalance
    data.targetBalance = response.targetBalance
    data.crossUnPnl = response.crossUnPnl
    data.distance = response.distance
    data.asset = response.asset
    data.crossWalletBalance = Number(response.crossWalletBalance).toFixed(4)
    document.title = `${data.distance} | Binance Calculator`
    setCached('crossUnPnl', Number(response.crossWalletBalance))
  }

  const histories = computed(() => {
    return data.history
      .reverse()
      .reduce((acc: any, cur: any, i: any) => {
        const curVal = { ...cur }
        if (acc.length === 0) {
          curVal.sign = null
          return [...acc, curVal]
        } else if (Number(curVal.balance) > Number(acc[i - 1].balance)) {
          curVal.sign = '+'
          return [...acc, curVal]
        } else {
          curVal.sign = '-'
          return [...acc, curVal]
        }
      }, [])
      .reverse()
  })

  const setCached = (key: string, val: any) => {
    const cached = localStorage.getItem(key)
    if (!cached) {
      localStorage.setItem(
        key,
        JSON.stringify(
          new Array(1).fill({
            balance: val,
            time: Date.now(),
          })
        )
      )
    } else {
      const currentCached = JSON.parse(cached)
      if (currentCached[0].balance !== val) {
        localStorage.setItem(
          key,
          JSON.stringify([
            {
              balance: val,
              time: Date.now(),
            },
            ...currentCached.slice(0, 20),
          ])
        )
      }
    }
  }
</script>
