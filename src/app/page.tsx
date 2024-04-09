"use client"

import { Chart } from 'chart.js/auto'
import { useEffect, useState } from "react";
import countries from './data/countries.json'
import barColors from './data/barColors.json'
import { compare } from '../../utils/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePause, faCirclePlay } from '@fortawesome/free-solid-svg-icons';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Ruler from './components/Ruler';

Chart.register(ChartDataLabels)

interface PopulationData {
  country: string;
  population: number;
  color: string;
  region: string;
}

interface TotalPopulationData {
  [year: number]: string
}

export default function Home() {
  const [myChart, setChart] = useState<Chart<"bar"> | null>(null);
  // var popuData: Record<number, PopulationData[]>
  const [populationData, setPopulationData] = useState<Record<number, PopulationData[]>>({});
  const [currentYear, setCurrentYear] = useState<number>(1950);
  const [firstYear, setFirstYear] = useState<number | null>(null);
  const [lastYear, setLastYear] = useState<number | null>(null);
  const [yearList, setYearList] = useState<string[]>([])
  const [total, setTotal] = useState<TotalPopulationData>({});
  const [animationTimeout, setAnimationTimeout] = useState<NodeJS.Timeout | null>(null);
  const [labelList, setLabelList] = useState([false, false, false, false, false])
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // call data at first time when running app
    const fetchData = async () => {
      const response = await fetch('/sheet-data-rtg/population-and-demography.csv');
      const csvData = await response.text();
      const result = csvData.split(/\r?\n/).slice(1);
      const list: any[] = []
      var totalList = {}

      result.forEach(element => {
        //0 = country, 1 = year, 2= population
        const item = element.split(',').slice(0, 3)
        const country = item[0],
          year = item[1],
          population = item[2]


        // find region for each country
        const [c, regions] = Object.entries(countries).find(([key, value]) => key == country) || [];

        const getCountryColor = (region: string) => {
          const value: any = Object.entries(barColors).find(([key, value]) => key == region);
          return value[1]
        }

        //create new data to look like popluation data  and push it to list
        if (regions && regions.region != 'global') {
          list.push({ country: item[0], years: year, population: +population, color: getCountryColor(regions?.region || ''), region: regions?.region })
        }

        if (country == 'World') {
          totalList = { ...totalList, [year]: new Intl.NumberFormat('en-US').format(+population) }
        }
      })

      //group data by year and set it to populationData value
      var groupData = Object.groupBy(list, ({ years }) => years)
      Object.entries(groupData).map(([key, value]) => value?.sort(compare))
      const yearDatas = Object.keys(groupData)
      setYearList(yearDatas)
      setTotal(totalList)
      setPopulationData(groupData as any)
    };

    fetchData();
  }, [])

  useEffect(() => {
    //create graph after get data in population data
    if (Object.keys(populationData).length == 0) return
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;

    //get first year and last year from data
    const years = Object.keys(populationData).map(Number);
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    setCurrentYear(firstYear);
    setFirstYear(firstYear);
    setLastYear(lastYear);
    startAnimation(firstYear, lastYear);

    //set first year data to make a graph
    const firstYearLabels: string[] = []
    const firstYearDatas: number[] = []
    const firstYearColor: string[] = []

    for (let i = 0; i < populationData[firstYear].length; i++) {
      const country = populationData[firstYear][i].country
      const population = populationData[firstYear][i].population
      const color = populationData[firstYear][i].color

      firstYearLabels.push(country);
      firstYearDatas.push(population)
      firstYearColor.push(color)

      //stop when get list with 12 datas
      if (firstYearLabels.length > 11) {
        break;
      }
    }

    if (canvas) {
      var ctx = canvas.getContext('2d');

      //create a chart
      const chart = new Chart(ctx as any, {
        type: 'bar',
        data: {
          labels: firstYearLabels,
          datasets: [
            {
              label: "Population",
              data: firstYearDatas,
              backgroundColor: firstYearColor,
            }
          ]
        },
        options: {
          indexAxis: 'y',
          elements: {
            bar: { borderWidth: 2, }
          },
          responsive: true,
          scales: {
            x: { beginAtZero: true, grace: '10%' },
            y: {
              grid: {
                display: false
              },

            }
          },
          plugins: {
            legend: {
              align: 'start',
              labels: {
                generateLabels(chart) {
                  //customize text of legends
                  return [{
                    text: 'Asia',
                    fillStyle: barColors.asia,
                    strokeStyle: barColors.asia,
                    index: 0,
                    hidden: labelList[0] ? true : false
                  }, {
                    text: 'Europe',
                    fillStyle: barColors.europe,
                    strokeStyle: barColors.europe,
                    index: 1,
                    hidden: labelList[1] ? true : false
                  }, {
                    text: 'Africa',
                    fillStyle: barColors.africa,
                    strokeStyle: barColors.africa,
                    index: 2,
                    hidden: labelList[2] ? true : false
                  }, {
                    text: 'Oceania',
                    fillStyle: barColors.oceania,
                    strokeStyle: barColors.oceania,
                    index: 3,
                    hidden: labelList[3] ? true : false
                  }, {
                    text: 'Americas',
                    fillStyle: barColors.americas,
                    strokeStyle: barColors.americas,
                    index: 4,
                    hidden: labelList[4] ? true : false
                  },]
                },
              },
              onClick(e, legendItem, legend) {
                legendItem.hidden = !legendItem.hidden
                if (legendItem.index != undefined) {
                  labelList[legendItem.index] = !labelList[legendItem.index]
                  chart.update()
                }
              }
            },
            datalabels: {
              color: 'black',
              anchor: 'end',
              align: 'right',
              font: {
                weight: 'bold'
              },
              formatter: function (value, context) {
                const format = new Intl.NumberFormat('en-US')
                return format.format(value);
              }
            },
          
          },
        },
      });
      setChart(chart)
    }
  }, [populationData])

  useEffect(() => {
    //update graph to the next year
    if (!myChart || !currentYear) return;
    updateChart(myChart, false)
    myChart.update();
  }, [currentYear])

  const updateChart = (chart: Chart<"bar">, isLegend: boolean) => {
    if (!myChart || !currentYear || !populationData) return;

    const updateLabels: string[] = []
    const updateDatas: number[] = []
    const updateColors: string[] = []

    for (let i = 0; i < populationData[currentYear].length; i++) {
      const country = populationData[currentYear][i].country
      const population = populationData[currentYear][i].population
      const color = populationData[currentYear][i].color
      const region = populationData[currentYear][i].region

      if ((region == 'asia' && labelList[0] == false) ||
        (region == 'europe' && labelList[1] == false) ||
        (region == 'africa' && labelList[2] == false) ||
        (region == 'oceania' && labelList[3] == false) ||
        (region == 'americas' && labelList[4] == false)
      ) {
        updateLabels.push(country);
        updateDatas.push(population)
        updateColors.push(color)
      }

      if (updateLabels.length > 11) {
        break;
      }
    }

    chart.config.data.labels = updateLabels
    chart.config.data.datasets[0].data = updateDatas
    chart.config.data.datasets[0].backgroundColor = updateColors

  }

  const startAnimation = (firstYear: number, lastYear: number, remainingTime: number = 500) => {
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
    setAnimationTimeout(
      setTimeout(() => {
        setCurrentYear(prevYear => {
          const nextYear = prevYear === lastYear ? firstYear : prevYear && prevYear + 1;
          startAnimation(firstYear, lastYear); // Recursive call to schedule the next update
          return nextYear;
        });
      }, remainingTime) as NodeJS.Timeout
    );
  };

  const pauseAnimation = () => {
    setIsPaused(true)
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }
  };

  const resumeAnimation = () => {
    if (animationTimeout && firstYear && lastYear) {
      startAnimation(firstYear, lastYear);
      setIsPaused(false);
    }
  };

  return (
    <>
      {/* line chart */}
      <h1 className="chart-title">Population growth per country, 1950 to 2021</h1>
      <div className="chart-container">
        <p>Click on the legend below to filter by continent 👇</p>
        <div className='chart-wrapper'>
          <canvas id='myChart'></canvas>
          <div className='chart-info'>
            <div className='chart-year'>{currentYear}</div>
            <div>{`Total: ${total[currentYear] != undefined ? total[currentYear] : 0}`}</div>
          </div>
        </div>
      </div >
      <div className="chart-controls">
        <button onClick={isPaused ? resumeAnimation : pauseAnimation}>
          {isPaused ? <FontAwesomeIcon size={'2xl'} icon={faCirclePlay} /> : <FontAwesomeIcon size={'2xl'} icon={faCirclePause} />}
        </button>
        <Ruler labels={yearList} now={currentYear?.toString()} />
      </div>

    </>
  )
}

