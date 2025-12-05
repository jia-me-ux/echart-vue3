<script setup>
import { computed, onMounted, onUnmounted, ref, getCurrentInstance, watch } from 'vue'
import * as echarts from 'echarts'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()

const allData = ref([])
const seller_ref = ref(null)
let currentPage = 1
let totalPage = 0
const showData = ref([])
let myChart = null
let timer = null

// 获取卖家数据
const getData = (res) => {
  // const res = await getDataApi()
  allData.value = res
  // 给数据排序，从小到大
  allData.value.sort((a, b) => a.value - b.value)
  // 计算总页数
  totalPage = Math.ceil(allData.value.length / 5)
  updateChart()
}

// 初始化图表
const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  myChart = window.echarts.init(seller_ref.value, styleTheme.value)

  //  初始表单数据和配置
  let initOption = {
    title: {
      text: '▎ 商家销售额排行',
      left: '20',
      top: '20',
      textStyle: {
        color: '#fff',
        fontSize: 56,
      },
    },
    grid: {
      top: '20%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
    },
    yAxis: {
      type: 'category',
      // data: sellerNames.value,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        lineStyle: {
          width: 33,
          color: '#2d3443',
        },
      },
    },
    series: [
      {
        type: 'bar',
        // data: sellerValues.value,
        barWidth: 66,
        laber: {
          show: true,
          position: 'right',
          textStyle: {
            color: 'white',
          },
        },
        itemStyle: {
          barBorderRadius: [0, 33, 33, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#5052ee' },
            { offset: 1, color: '#ab6ee5' },
          ]),
        },
      },
    ],
  }
  myChart.setOption(initOption)

  // 定时切换页码
  seller_ref.value.addEventListener('mouseover', () => {
    clearInterval(timer)
  })
  seller_ref.value.addEventListener('mouseout', () => {
    startInternal()
  })
}

// 更新图表数据和配置
const updateChart = () => {
  // 分页获取当前页数据
  const startIndex = (currentPage - 1) * 5
  const endIndex = startIndex + 5
  showData.value = allData.value.slice(startIndex, endIndex)
  // 初始化表格数据
  const sellerNames = computed(() => {
    return showData.value.map((item) => item.name)
  })

  const sellerValues = computed(() => {
    return showData.value.map((item) => item.value)
  })
  // 表单数据和配置
  let updateOption = {
    yAxis: {
      data: sellerNames.value,
    },
    series: [
      {
        data: sellerValues.value,
      },
    ],
  }

  myChart.setOption(updateOption)
}

function startInternal() {
  timer = setInterval(() => {
    currentPage++
    if (currentPage > totalPage) {
      currentPage = 1
    }
    updateChart()
  }, 3000)
}

function screenAdapter() {
  let titleFontSize = (seller_ref.value.offsetWidth / 100) * 3.6
  myChart.setOption({
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    tooltip: {
      textStyle: {
        fontSize: titleFontSize * 0.6,
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0],
        },
      },
    ],
  })
  // 关键：调整图表大小
  myChart.resize()
}

onMounted(async () => {
  proxy.$socket.registerCallBack('sellerData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'sellerData',
    chartName: 'seller',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  if (myChart) {
    myChart.dispose()
  }
  clearInterval(timer)
  window.removeEventListener('resize', screenAdapter)
  proxy.$socket.unRegisterCallBack('sellerData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('sellerData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'sellerData',
    chartName: 'seller',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<style scoped></style>
