<!-- 库存销量分析 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="stock_ref"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, getCurrentInstance, watch } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()

const allData = ref([])
const stock_ref = ref(null)
let currentIndex = 0
let timer = null
let myChart = null
const titleFontSize = ref(0)

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
  myChart = window.echarts.init(stock_ref.value, styleTheme.value)
  const initOption = {
    title: {
      text: '▎库存和销量分析',
      left: 20,
      top: 20,
    },
  }
  myChart.setOption(initOption)
  stock_ref.value.addEventListener('mouseover', function () {
    clearInterval(timer)
  })
  stock_ref.value.addEventListener('mouseout', function () {
    startInterval()
  })
}

const updateChart = () => {
  const centerArr = [
    ['18%', '40%'],
    ['50%', '40%'],
    ['82%', '40%'],
    ['34%', '75%'],
    ['66%', '75%'],
  ]
  const colorArr = [
    ['#4FF778', '#0BA82C'],
    ['#E5DD45', '#E8B11C'],
    ['#E8821C', '#E55445'],
    ['#5052EE', '#AB6EE5'],
    ['#23E5E5', '#2E72BF'],
  ]
  const start = currentIndex * 5
  const end = (currentIndex + 1) * 5
  const showData = allData.value.slice(start, end)
  const seriesArr = showData.map((item, index) => {
    return {
      type: 'pie',
      radius: [110, 100],
      center: centerArr[index],
      hoverAnimation: false, // 关闭鼠标移入到饼图时的动画效果
      labelLine: {
        show: false, // 隐藏指示线
      },
      label: {
        position: 'center',
        color: colorArr[index][0],
      },
      data: [
        {
          name: item.name + '\n\n' + item.sales,
          value: item.sales,
          itemStyle: {
            color: window.echarts.graphic.LinearGradient(0, 1, 0, 0, [
              {
                offset: 0,
                color: colorArr[index][0],
              },
              {
                offset: 1,
                color: colorArr[index][1],
              },
            ]),
          },
        },
        {
          value: item.stock,
          itemStyle: {
            color: '#333843',
          },
        },
      ],
    }
  })
  const dataOption = {
    series: seriesArr,
  }
  myChart.setOption(dataOption)
  screenAdapter()
}

const screenAdapter = () => {
  titleFontSize.value = (stock_ref.value.offsetWidth / 100) * 3.6
  const innerRadius = titleFontSize.value * 2
  const outterRadius = innerRadius * 1.125
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize.value,
      },
    },
    series: [
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize.value / 2,
        },
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize.value / 2,
        },
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize.value / 2,
        },
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize.value / 2,
        },
      },
      {
        type: 'pie',
        radius: [outterRadius, innerRadius],
        label: {
          fontSize: titleFontSize.value / 2,
        },
      },
    ],
  }
  myChart.setOption(adapterOption)
  myChart.resize()
}

const startInterval = () => {
  timer = setInterval(function () {
    currentIndex++
    if (currentIndex > 1) {
      currentIndex = 0
    }
    updateChart()
  }, 5000)
}

onMounted(() => {
  proxy.$socket.registerCallBack('stockData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'stockData',
    chartName: 'stock',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  clearInterval(timer)
  proxy.$socket.unRegisterCallBack('stockData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('stockData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'stockData',
    chartName: 'stock',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<style lang="less" scoped></style>
