<!-- 热销商品图表 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr-left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr-right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat-name" :style="comStyle">{{ catName }}</span>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, getCurrentInstance, watch } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()

const allData = ref([])
const hot_ref = ref(null)
const currentIndex = ref(1)
let myChart = null
const titleFontSize = ref(0)

const toLeft = () => {
  if (currentIndex.value == 0) return
  currentIndex.value--
  updateChart()
}
const toRight = () => {
  if (currentIndex.value == allData.value.length - 1) return
  currentIndex.value++
  updateChart()
}

const catName = computed(() => {
  if (!allData.value) {
    return ''
  } else {
    return allData.value[currentIndex.value]?.name
  }
})

const comStyle = computed(() => {
  return {
    fontSize: titleFontSize.value + 'px',
  }
})

const getData = (res) => {
  allData.value = res
  console.log(allData.value)
  updateChart()
}

const initChart = () => {
  if (myChart) {
    myChart.dispose()
  }
  myChart = window.echarts.init(hot_ref.value, styleTheme.value)
  const initOption = {
    title: {
      text: '▎ 热销商品的占比',
      left: 20,
      top: 20,
    },
    legend: {
      top: '15%',
      icon: 'circle',
    },
    tooltip: {
      show: true,
      formatter: (arg) => {
        // console.log(arg)
        const thirdCategory = arg.data.children
        // 计算出所有三级分类的数值总和
        let total = 0
        thirdCategory.forEach((item) => {
          total += item.value
        })
        let retStr = ''
        thirdCategory.forEach((item) => {
          retStr += `
              ${item.name}:${parseInt((item.value / total) * 100) + '%'}
              <br/>
              `
        })
        return retStr
      },
    },
    series: [
      {
        type: 'pie',
        label: {
          show: false,
        },
        emphasis: {
          label: {
            show: true,
          },
          labelLine: {
            show: false,
          },
        },
      },
    ],
  }
  myChart.setOption(initOption)
}

const updateChart = () => {
  const legendData = allData.value[currentIndex.value].children.map((item) => item.name)
  const seriesData = allData.value[currentIndex.value].children.map((item) => {
    return {
      name: item.name,
      value: item.value,
      children: item.children,
    }
  })
  const dataOption = {
    legend: {
      data: legendData,
    },
    series: [
      {
        data: seriesData,
      },
    ],
  }
  myChart.setOption(dataOption)
}

const screenAdapter = () => {
  titleFontSize.value = (hot_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize.value,
      },
    },
    legend: {
      itemWidth: titleFontSize.value,
      itemHeight: titleFontSize.value,
      itemGap: titleFontSize.value / 2,
      textStyle: {
        fontSize: titleFontSize.value / 2,
      },
    },
    series: [
      {
        radius: titleFontSize.value * 4.5,
        center: ['50%', '60%'],
      },
    ],
  }
  myChart.setOption(adapterOption)
  myChart.resize()
}

onMounted(() => {
  proxy.$socket.registerCallBack('hotData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'hotData',
    chartName: 'hotproduct',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  proxy.$socket.unRegisterCallBack('hotData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('hotData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'hotData',
    chartName: 'hotproduct',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<style lang="less" scoped>
.arr-left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr-right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat-name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  color: white;
}
</style>
