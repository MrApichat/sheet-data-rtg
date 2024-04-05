"use client"

import Image from "next/image";
import { Chart } from 'chart.js/auto'
import { useEffect } from "react";

export default function Home() {
  let myChart : any;
  useEffect(() => {

    if (document.getElementById('myChart')) {
      var ctx = document.getElementById('myChart') as any;
      var data = {
        labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        datasets: [{
          data: [86, 114, 106, 106, 107, 111, 133],
          label: "Applied",
          borderColor: "#3e95cd",
          backgroundColor: "#7bb6dd",
          fill: false,
        }, {
          data: [70, 90, 44, 60, 83, 90, 100],
          label: "Accepted",
          borderColor: "#3cba9f",
          backgroundColor: "#71d1bd",
          fill: false,
        }, {
          data: [10, 21, 60, 44, 17, 21, 17],
          label: "Pending",
          borderColor: "#ffa500",
          backgroundColor: "#ffc04d",
          fill: false,
        }, {
          data: [6, 3, 2, 2, 7, 0, 16],
          label: "Rejected",
          borderColor: "#c45850",
          backgroundColor: "#d78f89",
          fill: false,
        }
        ]
      }
      
      if (myChart) {
        myChart.destroy();
        myChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: data,
      });
      } else {
        myChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: data,
      });
      }

    }


  }, [])
  return (
    <>
      {/* line chart */}
      <h1 className="w-[110px] mx-auto mt-10 text-xl font-semibold capitalize ">line Chart</h1>
      <div className="w-[1100px] h-screen flex mx-auto my-auto">
        <div className='border border-gray-400 pt-0 rounded-xl  w-full h-fit my-auto  shadow-xl'>
          <canvas id='myChart'></canvas>
        </div>
      </div>
    </>
  )
}
