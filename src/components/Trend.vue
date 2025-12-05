<template>
  <div class="com-container">
    <div class="title" :style="comStyle">
      <span>{{ '▎' + showTitle }}</span>
      <span class="iconfont title-icon" :style="comStyle" @click="showChoice = !showChoice"
        >&#xe6eb;</span
      >
      <div class="select-con" v-show="showChoice">
        <div
          class="select-item spantitle"
          v-for="item in selectTypes"
          :key="item.key"
          :style="marginStyle"
          @click="handleSelect(item.key)"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref"></div>
  </div>
</template>

<script setup>
import * as echarts from 'echarts'
import { ref, onMounted, computed, onUnmounted, getCurrentInstance, watch } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()
const trend_ref = ref(null)
const allData = ref([])
let myChart = null
const showChoice = ref(false)
const choiceType = ref('map')
const valueArr = ref([])
const titleFontSize = ref(0)

const selectTypes = computed(() => {
  return allData.value.type
})

const showTitle = computed(() => {
  return allData.value[choiceType.value].title
})

const comStyle = computed(() => {
  return {
    fontSize: titleFontSize.value + 'px',
    color: styleTheme.value === 'chalk' ? '#fff' : '#000',
  }
})

const marginStyle = computed(() => {
  return {
    marginLeft: titleFontSize.value + 'px',
  }
})

// 获取数据
const getData = (res) => {
  // const res = await getTrendApi()
  allData.value = res
  console.log(allData.value)
  updateChart()
}

const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  myChart = window.echarts.init(trend_ref.value, styleTheme.value)
  let initOption = {
    grid: {
      left: '3%',
      top: '35%',
      right: '4%',
      bottom: '1%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      left: 20,
      top: '15%',
      ico: 'circle',
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
    },
  }
  myChart.setOption(initOption)
}

// 更新图表数据
const updateChart = () => {
  // 半透明的颜色值
  const colorArr1 = [
    'rgba(11, 168, 44, 0.5)',
    'rgba(44, 110, 255, 0.5)',
    'rgba(22, 242, 217, 0.5)',
    'rgba(254, 33, 30, 0.5)',
    'rgba(250, 105, 0, 0.5)',
  ]
  // 全透明的颜色值
  const colorArr2 = [
    'rgba(11, 168, 44, 0)',
    'rgba(44, 110, 255, 0)',
    'rgba(22, 242, 217, 0)',
    'rgba(254, 33, 30, 0)',
    'rgba(250, 105, 0, 0)',
  ]
  const timeArr = allData.value.common?.month
  valueArr.value = allData.value[choiceType.value].data

  const seriesArr = valueArr.value?.map((item, index) => {
    return {
      name: item.name,
      type: 'line',
      data: item.data,
      stack: choiceType.value,
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: colorArr1[index] },
          { offset: 1, color: colorArr2[index] },
        ]),
      },
    }
  })
  const legendArr = allData.value.map.data?.map((item) => item.name)
  const dataOption = {
    xAxis: {
      data: timeArr,
    },
    legend: {
      data: legendArr,
    },
    series: seriesArr,
  }
  myChart.setOption(dataOption)
}

const screenAdapter = () => {
  titleFontSize.value = (trend_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    legend: {
      itemWidth: titleFontSize.value,
      itemHeight: titleFontSize.value,
      itemGap: titleFontSize.value,
      textStyle: {
        fontSize: titleFontSize.value / 2,
      },
    },
  }
  myChart.setOption(adapterOption)
  myChart.resize()
}

function handleSelect(currentType) {
  choiceType.value = currentType
  console.log(currentType)
  updateChart()
  showChoice.value = false
}

onMounted(() => {
  proxy.$socket.registerCallBack('trendData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'trendData',
    chartName: 'trend',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  proxy.$socket.unRegisterCallBack('trendData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('trendData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'trendData',
    chartName: 'trend',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<style scoped lang="less">
.title {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
}
</style>
