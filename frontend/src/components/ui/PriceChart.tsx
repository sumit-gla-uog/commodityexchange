// @ts-nocheck
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { CommodityPrice } from '../../types/commodity'

interface PriceChartProps {
  commodity: CommodityPrice
}

export const PriceChart = ({ commodity }: PriceChartProps) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'line',
      backgroundColor: '#1f2937',
    },
    title: {
      text: `${commodity.name} - 12 Month Price Trend`,
      style: { color: '#ffffff' },
    },
    xAxis: {
      categories: commodity.chart_data.map((d) => d.date),
      labels: { style: { color: '#9ca3af' } },
    },
    yAxis: {
      title: {
        text: commodity.unit,
        style: { color: '#9ca3af' },
      },
      labels: { style: { color: '#9ca3af' } },
      gridLineColor: '#374151',
    },
    series: [
      {
        type: 'line',
        name: commodity.name,
        data: commodity.chart_data.map((d) => d.price),
        color: '#3b82f6',
      },
    ],
    legend: { itemStyle: { color: '#9ca3af' } },
    credits: { enabled: false },
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <HighchartsReact.default highcharts={Highcharts} options={options} />
    </div>
  )
}