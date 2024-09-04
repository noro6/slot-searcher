<script setup lang="ts">
import { onMounted, ref } from 'vue'

class Item {
  antiAir = 0
  isAttacker = false
  constructor(antiAir = 0, isAttacker = false) {
    this.antiAir = antiAir
    this.isAttacker = isAttacker
  }
}

/** 装備情報 */
const items = ref<Item[]>([])

/** 制空値最小 */
const minTargetAirPower = ref(0)
/** 制空値最大 */
const maxTargetAirPower = ref(0)
/** 艦戦数最小 */
const minFighterSize = ref(0)
/** 艦戦数最大 */
const maxFighterSize = ref(0)
/** 搭載数合計 */
const sumSlotSize = ref(0)

/** 奇数 スキップ */
const ignoreOddSlot = ref(true)
/** 0機 スキップ */
const ignoreZeroSlot = ref(true)

/** 搭載数候補の結果 */
const resultSlots = ref<number[][]>([])
/** 計算時間 */
const calculateTime = ref(0)

const showFormattedResult = ref(false)

const hasError = ref(false)

onMounted(() => {
  // e.g. [id.2258] 深海珊瑚海水鬼
  items.value.push(new Item(11, false))
  items.value.push(new Item(6, true))
  items.value.push(new Item(3, true))
  items.value.push(new Item(0, false))

  minFighterSize.value = 58
  maxFighterSize.value = 58

  minTargetAirPower.value = 124
  maxTargetAirPower.value = 124

  sumSlotSize.value = 142
})

const addItem = () => {
  items.value.push(new Item())
}
const removeItem = () => {
  if (items.value.length > 1) {
    items.value.pop()
  }
}

const calculate = () => {
  showFormattedResult.value = false
  calculateTime.value = new Date().getTime()
  resultSlots.value = []

  const result: number[][] = []

  // cash
  const skipOdd = ignoreOddSlot.value
  const skipZero = ignoreZeroSlot.value
  const maxSlotSize = sumSlotSize.value
  const maxSlotsLength = items.value.length
  const minFighter = minFighterSize.value
  const maxFighter = maxFighterSize.value
  const maxAirPower = maxTargetAirPower.value
  const minAirPower = minTargetAirPower.value
  const isAttackers = items.value.map((item) => item.isAttacker)
  const antiAirs = items.value.map((item) => item.antiAir)

  const getArray = (array: number[], sumArray: number) => {
    // 件数多すぎなので中止
    if (result.length > 1000) return

    if (array.length === maxSlotsLength) {
      // check. 総搭載数
      if (sumArray !== maxSlotSize) {
        return
      }
      // const slotArray = [...array]; => 遅すぎ
      const slots = []
      for (let i = 0; i < array.length; i++) {
        slots.push(array[i])
      }

      // check. free
      // if (!(slots[0] < slots[1] && slots[0] > slots[2] && slots[0] > slots[3] && slots[2] > slots[3])) {
      //     return;
      // }

      // check. 総艦戦数
      const fighterSize = slots.reduce((a, c, i) => a + (isAttackers[i] ? 0 : c), 0)
      if (fighterSize < minFighter || fighterSize > maxFighter) {
        return
      }

      // check. 制空値
      const airPower = getTotalAirPower(slots, antiAirs)
      if (minAirPower <= airPower && airPower <= maxAirPower) {
        result.push(slots)
      }
      return
    }

    const max = maxSlotSize - sumArray
    for (let i = 0; i <= max; i++) {
      // 件数多すぎなので中止
      if (result.length > 1000) break
      // 0機スロット除外
      if (skipZero && i === 0) continue
      // 奇数スロット除外
      if (skipOdd && i % 2 !== 0) continue
      array.push(i)
      getArray(array, sumArray + i)
      array.pop()
    }
  }

  getArray([], 0)
  resultSlots.value = result
  hasError.value = result.length > 1000
  showFormattedResult.value = result.length <= 100
  calculateTime.value = new Date().getTime() - calculateTime.value
}
const getTotalAirPower = (slots: number[], antiAirs: number[]) => {
  return slots.reduce((a, c, i) => a + Math.floor((antiAirs[i] ?? 0) * Math.sqrt(c)), 0)
}
</script>

<template>
  <div class="common-container align-center flex-wrap">
    <v-sheet v-for="(slot, i) in items" :key="i" class="pa-2" border rounded>
      <div class="text-caption">Slot {{ i + 1 }}</div>
      <v-checkbox v-model="slot.isAttacker" label="攻撃機"></v-checkbox>
      <v-text-field
        v-model.number="slot.antiAir"
        type="number"
        label="対空"
        variant="outlined"
      ></v-text-field>
    </v-sheet>
    <v-btn icon="mdi-plus" @click="addItem" :disabled="items.length >= 5"></v-btn>
    <v-btn icon="mdi-minus" @click="removeItem" :disabled="items.length <= 1"></v-btn>
  </div>
  <div class="common-container">
    <div>
      <div class="text-caption">制空値 最小</div>
      <v-text-field v-model.number="minTargetAirPower" type="number"></v-text-field>
    </div>
    <div class="align-self-center mt-6">～</div>
    <div>
      <div class="text-caption">制空値 最大</div>
      <v-text-field v-model.number="maxTargetAirPower" type="number"></v-text-field>
    </div>
  </div>
  <div class="common-container">
    <div>
      <div class="text-caption">非攻撃機*数 最小</div>
      <v-text-field v-model.number="minFighterSize" type="number"></v-text-field>
    </div>
    <div class="align-self-center mt-6">～</div>
    <div>
      <div class="text-caption">非攻撃機*数 最大</div>
      <v-text-field v-model.number="maxFighterSize" type="number"></v-text-field>
    </div>
    <div class="align-self-center mt-6 text-caption">* 非攻撃機 = 艦戦, 回転翼機 etc...</div>
  </div>
  <div class="common-container align-end">
    <div>
      <div class="text-caption">搭載数合計</div>
      <v-text-field v-model.number="sumSlotSize" type="number"></v-text-field>
    </div>
    <v-checkbox v-model="ignoreOddSlot" label="奇数スロ除外"></v-checkbox>
    <v-checkbox v-model="ignoreZeroSlot" label="0機スロ除外"></v-checkbox>
  </div>
  <div class="d-flex align-end">
    <v-btn @click="calculate()">Calculate</v-btn>
    <div class="ms-3 text-caption">{{ resultSlots.length }} 件</div>
    <div class="ms-1 text-caption">( {{ calculateTime }} ms )</div>
  </div>
  <v-alert v-if="hasError" class="my-2" type="error" variant="outlined">
    件数が多すぎたので 1000 件で中止しました。
  </v-alert>
  <v-divider class="my-3"></v-divider>
  <div v-if="!showFormattedResult && resultSlots.length">
    <div v-if="resultSlots.length >= 2" class="mb-2">
      <v-btn @click="showFormattedResult = true"> format </v-btn>
    </div>
    <div>{{ resultSlots }}</div>
  </div>
  <div v-else-if="resultSlots.length" class="result-container">
    <div v-for="(slots, i) in resultSlots" :key="i">
      [
      <span v-for="(slot, j) in slots" :key="j">
        <span v-if="j > 0">, </span>
        <span v-if="slot < 10" class="pad0">0</span>{{ slot }}
      </span>
      ]
    </div>
  </div>
</template>

<style scoped>
.common-container {
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: flex;
  column-gap: 1rem;
}

.result-container {
  display: flex;
  flex-wrap: wrap;
  row-gap: 0.5rem;
  column-gap: 1rem;
  max-width: 1080px;
}
.pad0 {
  user-select: none;
  opacity: 0;
}
</style>
