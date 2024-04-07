"use client"

import { Chart } from 'chart.js/auto'
import { useEffect, useState } from "react";
import countries from './data/countries.json'
import barColors from './data/barColors.json'
import { compare } from '../../utils/utils';

interface PopulationData {
  country: string;
  population: number;
  color: string;
}

export default function Home() {
  const [myChart, setChart] = useState<Chart<"bar"> | null>(null);
  // var popuData: Record<number, PopulationData[]>
  const [popuData, setPopuData] = useState<Record<number, PopulationData[]>>({});
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [animationTimeout, setAnimationTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // call data at first time when running app
    const fetchData = async () => {
      const response = await fetch('/population-and-demography.csv');
      const csvData = await response.text();
      const result = csvData.split(/\r?\n/).slice(1);
      const list: any[] = []

      result.forEach(element => {
        //0 = country, 1 = year, 2= population
        const item = element.split(',').slice(0, 3)
        const country = item[0],
          year = item[1], population = item[2]

        const [c, regions] = Object.entries(countries).find(([key, value]) => key == country) || [];

        const getCountryColor = (region: string) => {
          const value: any = Object.entries(barColors).find(([key, value]) => key == region);
          return value[1]
        }
        if (regions && regions.region != 'global') list.push({ country: item[0], years: year, population: +population, color: getCountryColor(regions?.region || '') })
      })

      var groupData = Object.groupBy(list, ({ years }) => years)
      Object.entries(groupData).map(([key, value]) => value?.sort(compare))
      setPopuData(groupData as any)
    };

    fetchData();
  }, [])

  useEffect(() => {
    //create graph after get data in population data
    if (Object.keys(popuData).length == 0) return
    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const years = Object.keys(popuData).map(Number);
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    setCurrentYear(firstYear);
    startAnimation(firstYear, lastYear);
    const testLabel: string[] = []
    const testData: number[] = []
    const testColor: string[] = []
    popuData[firstYear]?.some(e => {
      testLabel.push(e.country);
      testData.push(e.population)
      testColor.push(e.color)
      if (testLabel.length > 11) {
        return true
      }
    })
    if (canvas) {
      var ctx = canvas.getContext('2d');

      const chart = new Chart(ctx as any, {
        type: 'bar',
        data: {
          labels: testLabel,
          datasets: [
            {
              data: testData,
              backgroundColor: testColor,
            }
          ]
        },
        options: {
          indexAxis: 'y',
          // Elements options apply to all of the options unless overridden in a dataset
          // In this case, we are setting the border of each horizontal bar to be 2px wide
          elements: {
            bar: {
              borderWidth: 2,
            }
          },
          animation: {
            duration: 1000, // Adjust the duration as needed
            easing: 'easeInOutQuart',
            // easing: 'easeInOutQuart', // Choose easing function for smoother transitions
          },
          responsive: true,
          scales: {
            x: {
              beginAtZero: true
            }
          }
        },
      });
      setChart(chart)
    }
  }, [popuData])

  useEffect(() => {
    //update graph to the next year
    if (!myChart || !currentYear) return;

    const updateLabels: string[] = []
    const updateDatas: number[] = []
    const updateColors: string[] = []
    popuData && popuData[currentYear].some(element => {
      updateLabels.push(element.country);
      updateDatas.push(element.population)
      updateColors.push(element.color)
      if (updateLabels.length > 11) {
        return true
      }
    })

    myChart.config.data.labels = updateLabels
    myChart.config.data.datasets[0].data = updateDatas
    myChart.config.data.datasets[0].backgroundColor = updateColors
    myChart.update();
  }, [currentYear])

  const startAnimation = (firstYear: number, lastYear: number) => {
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
      }, 1000) as NodeJS.Timeout
    );
  };

  return (
    <>
      {/* line chart */}
      <h1 className="w-[110px] mx-auto mt-10 text-xl font-semibold capitalize ">line Chart</h1>
      <div className="w-[1100px] h-screen flex mx-auto my-auto">
        <div className='border border-gray-400 pt-0 rounded-xl  w-full h-fit my-auto  shadow-xl '>
          <canvas id='myChart'></canvas>
        </div>
      </div>
    </>
  )
}

