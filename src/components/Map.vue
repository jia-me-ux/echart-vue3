<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script setup>
import http from '@/utils/http'
import { getProvinceMapInfo } from '@/utils/map_utils'
import { ref, onMounted, onUnmounted, getCurrentInstance, watch } from 'vue'
import { useThemeStore } from '@/store/useThemeStore'
import { storeToRefs } from 'pinia'

const { styleTheme } = storeToRefs(useThemeStore())

const { proxy } = getCurrentInstance()

const map_ref = ref(null)
const allData = ref([])
const mapData = {}
let myChart = null

// 获取数据
const getData = (res) => {
  allData.value = res
  console.log(allData.value)
  updateChart()
}

const initChart = async () => {
  if (myChart) {
    myChart.dispose()
  }
  myChart = window.echarts.init(map_ref.value, styleTheme.value)

  const res = await http.get('http://localhost:5173/static/map/china.json')
  window.echarts.registerMap('china', res.data)
  const initOption = {
    title: {
      text: '▎ 商家分布',
      left: 20,
      top: 20,
    },
    geo: {
      type: 'map',
      map: 'china',
      top: '5%',
      bottom: '5%',
      itemStyle: {
        areaColor: '#2E72BF',
        borderColor: '#333',
      },
    },
    legend: {
      left: '5%',
      bottom: '5%',
      orient: 'vertical',
    },
  }
  myChart.setOption(initOption)
  myChart.on('click', async (arg) => {
    const provinceInfo = getProvinceMapInfo(arg.name)
    if (!mapData[provinceInfo.key]) {
      const res = await http.get('http://localhost:5173' + provinceInfo.path)
      mapData[provinceInfo.key] = res.data
      console.log(provinceInfo.key)
      console.log(res.data)

      window.echarts.registerMap(provinceInfo.key, res.data)
    }
    const changeOption = {
      geo: {
        map: provinceInfo.key,
      },
    }
    myChart.setOption(changeOption)
  })
}

// 更新图表数据
const updateChart = () => {
  const legendArr = allData.value.map((item) => {
    return item.name
  })
  const seriesArr = allData.value.map((item) => {
    return {
      type: 'effectScatter',
      rippleEffect: {
        scale: 5,
        brushType: 'stroke',
      },
      name: item.name,
      data: item.children,
      coordinateSystem: 'geo',
    }
  })
  const dataOption = {
    legend: {
      data: legendArr,
    },
    series: seriesArr,
  }
  myChart.setOption(dataOption)
}

const screenAdapter = () => {
  const titleFontSize = (map_ref.value.offsetWidth / 100) * 3.6
  const adapterOption = {
    title: {
      textStyle: {
        fontSize: titleFontSize,
      },
    },
    legend: {
      itemWidth: titleFontSize / 2,
      itemHeight: titleFontSize / 2,
      itemGap: titleFontSize / 2,
      textStyle: {
        fontSize: titleFontSize / 2,
      },
    },
  }
  myChart.setOption(adapterOption)
  myChart.resize()
}

function revertMap() {
  const revertOption = {
    geo: {
      map: 'china',
    },
  }
  myChart.setOption(revertOption)
}

onMounted(() => {
  proxy.$socket.registerCallBack('mapData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'mapData',
    chartName: 'map',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})

onUnmounted(() => {
  window.removeEventListener('resize', screenAdapter)
  proxy.$socket.unRegisterCallBack('mapData')
})

defineExpose({
  screenAdapter,
})

watch(styleTheme, () => {
  proxy.$socket.registerCallBack('mapData', getData)
  proxy.$socket.send({
    action: 'getData',
    socketType: 'mapData',
    chartName: 'map',
    value: '',
  })
  initChart()
  window.addEventListener('resize', screenAdapter)
  screenAdapter()
})
</script>

<style scoped lang="less"></style>
