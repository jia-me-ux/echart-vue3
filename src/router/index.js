import { createRouter, createWebHistory } from 'vue-router'
import SellerPage from '@/view/SellerPage.vue'
import TrendPage from '@/view/TrendPage.vue'
import MapPage from '@/view/MapPage.vue'
import HotPage from '@/view/HotPage.vue'
import StockPage from '@/view/StockPage.vue'
import RankPage from '@/view/RankPage.vue'
import ScreenPage from '@/view/ScreenPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: 'screen',
      children: [
        {
          path: 'sellerpage',
          component: SellerPage,
        },
        {
          path: 'trendpage',
          component: TrendPage,
        },
        {
          path: 'mappage',
          component: MapPage,
        },
        {
          path: 'hotpage',
          component: HotPage,
        },
        {
          path: 'stockpage',
          component: StockPage,
        },
        {
          path: 'rankpage',
          component: RankPage,
        },
        {
          path: 'screen',
          component: ScreenPage,
        },
      ],
    },
  ],
})

export default router
