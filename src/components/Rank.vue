<template>
  <div class="com-container">
    <div class="com-chart" ref="rank_ref"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance, watch } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()

const rank_ref = ref(null)
let myChart = null
const allData = ref(null)
const startValue = ref(0) // 区域缩放的起点值
const endValue = ref(9) // 区域缩放的终点值
const timerId = ref(null) // 定时器的标识

const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  myChart = window.echarts.init(rank_ref.value, styleTheme.value)
  const initOption = {
    title: {
      text: '▎ 地区销售排行',
      left: 20,
      top: 20,
    },
    grid: {
      top: '40%',
      left: '5%',
      right: '5%',
      bottom: '5%',
      containLabel: true,
    },
    tooltip: {
      show: true,
    },
    xAxis: {
      type: 'category',
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
      },
    ],
  }
  myChart.setOption(initOption)
  myChart.on('mouseover', () => {
    clearInterval(timerId.value)
  })
  myChart.on('mouseout', () => {
    startInterval()
  })
}

const getData = (ret) => {
  allData.value = ret
  // 对allData里面的每一个元素进行排序, 从大到小进行
  allData.value.sort((a, b) => {
    return b.value - a.value
  })
  console.log(allData.value)
  updateChart()
  startInterval()
}

const updateChart = () => {
  const colorArr = [
    ['#0BA82C', '#4FF778'],
    ['#2E72BF', '#23E5E5'],
    ['#5052EE', '#AB6EE5'],
  ]

  // 处理图表需要的数据
  const provinceArr = allData.value.map((item) => {
    return item.name
  })
  const valueArr = allData.value.map((item) => {
    return item.value
  })

  const dataOption = {
    xAxis: {
      data: provinceArr,
    },
    dataZoom: {
      show: false,
      startValue: startValue.value,
      endValue: endValue.value,
    },
    series: [
      {
        data: valueArr,
        itemStyle: {
          color: (arg) => {
            let targetColorArr = null
            if (arg.value > 300) {
              targetColorArr = colorArr[0]
            } else if (arg.value > 200) {
              targetColorArr = colorArr[1]
            } else {
              targetColorArr = colorArr[2]
            }
            return new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: targetColorArr[0],
              },
              {
                offset: 1,
                color: targetColorArr[1],
              },
            ])
          },
        },
      },
    ],
  }
  myChart.setOption(dataOption)
}

const screenAdapter = () => {
  const titleFontSize = (rank_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    series: [
      {
        barWidth: titleFontSize,
        itemStyle: {
          barBorderRadius: [titleFontSize / 2, titleFontSize / 2, 0, 0],
        },
      },
    ],
  }
  myChart.setOption(adapterOption)
  myChart.resize()
}

const startInterval = () => {
  if (timerId.value) {
    clearInterval(timerId.value)
  }
  timerId.value = setInterval(() => {
    startValue.value++
    endValue.value++
    if (endValue.value > allData.value.length - 1) {
      startValue.value = 0
      endValue.value = 9
    }
    updateChart()
  }, 2000)
}

onMounted(() => {
  proxy.$socket.registerCallBack('rankData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'rankData',
    chartName: 'rank',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  clearInterval(timerId.value)
  proxy.$socket.unRegisterCallBack('rankData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('rankData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'rankData',
    chartName: 'rank',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<style lang="less" scoped></style>
