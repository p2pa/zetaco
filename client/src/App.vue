<template>
  <div class="boxed-layout horizontal">
    <AppHeader></AppHeader>

    <div class="layout-px-spacing dash_1">
      <div class="row layout-top-spacing">
        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                    <div class="widget widget-sales-category">
                        <div class="widget-heading">
                            <h5>Create your query</h5>
                            <button @click="fetchQuery" type="button" class="btn btn-warning btn-sm mb-4 me-2">Run</button>
                        </div>
                        <div class="widget-content">                           

                            <div class="row mb-12" v-for="index in inputsAmount" :key="index">
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] !== 'filter'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <div class="form-control">
                                      <multiselect v-model="inputValues[index - 1]" :options="options[index - 1]" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                    </div>
                                </div>
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'filter'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <span v-for="condition, i in inputValues[index - 1]" class="form-control" :key="i">
                                      <span class="badge badge-secondary me-1">
                                        {{ condition }}
                                      </span>
                                    </span>                              
                                </div>
                            </div>
                            <div v-html="printOutputs"></div>                      

                            <br>
                            <div class="row mb-12">
                              <label class="col-sm-1 col-form-label col-form-label-sm" for="colFormLabelSm">+</label>
                              <div class="col-sm-2">
                                  <span class="btn btn-info me-1">Rows</span>
                              </div>
                              <div class="col-sm-2">
                                  <span class="btn btn-info me-1">Summarize</span>
                              </div>
                              <div class="col-sm-2">
                                  <span class="btn btn-info me-1">Columns</span>
                              </div>
                              <div class="col-sm-2">
                                  <span class="btn btn-info me-1">Join table</span>
                              </div>
                            </div>                            
                        </div>
                    </div>
                </div>

        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
          <div class="widget widget-revenue">
              <div class="widget-heading">
                  <h5>Chart</h5>
                  
                  <div class="dropdown btn-group">
                      <a href="javascript:;" id="ddlRevenue" class="btn dropdown-toggle btn-icon-only" data-bs-toggle="dropdown" aria-expanded="false">
                          <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="feather feather-more-horizontal"
                          >
                              <circle cx="12" cy="12" r="1"></circle>
                              <circle cx="19" cy="12" r="1"></circle>
                              <circle cx="5" cy="12" r="1"></circle>
                          </svg>
                      </a>
                      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="ddlRevenue">
                          <li><a href="javascript:;" class="dropdown-item">Last 30 days</a></li>
                      </ul>
                  </div>
              </div>

              <div class="widget-content">
                  <!-- <div class="chart-title">Total Profit <span class="text-primary ms-1">$10,840</span></div> -->
                  <apex-chart v-if="revenue_options" height="325" type="area" :options="revenue_options" :series="revenue_series"></apex-chart>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
</template>

<script>
import '@/assets/sass/app.scss';
import '@/assets/sass/widgets/widgets.scss';
import ApexChart from 'vue3-apexcharts';
import Multiselect from '@suadelabs/vue3-multiselect';
import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
import AppHeader from '@/components/header.vue';
import axios from 'axios'
import moment from 'moment'

export default {
  name: 'App',
  components: {
    AppHeader,
    Multiselect,
    ApexChart
  },
  methods: {
    fetchQuery: function(){
      let protocol, what, from;
      let to = new Date().getTime();

      for (let index = 0; index < this.inputTypes.length; index++) {
        const element = this.inputTypes[index];
        if(element == 'start'){
          protocol = this.inputValues[index];
        }
        if(element == 'join'){
          what = this.inputValues[index];
        }
        if(element == 'filter'){
          this.inputValues[index].forEach(el => {
            let condition = el.split(" ");
            if(condition[0] == 'Date'){
              if(condition[1] == '>='){
                from = parseInt(new Date(condition[2]).getTime() / 1000);
              }
            }
          });
        }
      }      
      
      let url = 'http://localhost:3000/api/' + protocol + '/' + what + '/' + from + '/' + to ;      

      axios
      .get(url)
      .then((res) => {
        this.revenue_series[0].data = res.data[0].data
        this.revenue_options.labels = res.data[0].labels
        console.log(this.revenue_options.labels)
      })   
    },
  },   
  data: function() {
    return {        
        inputsAmount: 3,
        inputTypes: [
          'start',
          'join',
          'filter'
        ],
        options: [
          ['Aave', 'Uniswap'],
          ['Volume', 'TVL', 'Transaction amount', 'Unique users', 'Average Transaction Volume'],
          []
        ], 
        inputValues: [
          'Aave',
          'TVL',
          ['Date >= 2021-01-01']
        ],       
        revenue_series: [
            {   
                name: 'Aave', 
                data: [],
                logarithmic: true,
                color: 'green',
            },
        ],
        revenue_options: {
          chart: {
                    fontFamily: 'Nunito, sans-serif',
                    zoom: { enabled: false },
                    toolbar: { show: false },
          },
          dataLabels: { enabled: false },
          stroke: { show: true, curve: 'smooth', width: 2, lineCap: 'square' },
          dropShadow: { enabled: true, opacity: 0.2, blur: 10, left: -7, top: 22 },
          colors: ['#2196f3', '#e7515a'],
          labels: [],
          xaxis: {
              axisBorder: { show: false },
              axisTicks: { show: false },
              crosshairs: { show: true },
              labels: { 
                offsetX: 0, 
                offsetY: 5, 
                style: { fontSize: '12px', fontFamily: 'Poppins', cssClass: 'apexcharts-xaxis-title' }, 
                format: 'yyyy/MM/dd',
              },
              formatter: function(value) {
                return moment(value).format('yyyy/mm/dd')
              },
          },
          yaxis: {              
              tickAmount: 7,
              labels: {
                  formatter: function (value) {
                      return Math.floor((value / 1000000000) * 100) / 100 + 'B';
                  },
                  offsetX: -10,
                  offsetY: 0,
                  style: { fontSize: '12px', fontFamily: 'Poppins', cssClass: 'apexcharts-yaxis-title' },
              },
          },
          grid: {
              borderColor: '#191e3a',
              strokeDashArray: 5,
              xaxis: { lines: { show: true } },
              yaxis: { lines: { show: false } },
              padding: { top: 0, right: 0, bottom: 0, left: 0 },
          },
          legend: {
              position: 'top',
              horizontalAlign: 'right',
              offsetY: 0,
              fontSize: '16px',
              fontFamily: 'Poppins',
              markers: { width: 10, height: 10, strokeWidth: 0, strokeColor: '#fff', fillColors: undefined, radius: 12, onClick: undefined, offsetX: 0, offsetY: 0 },
              itemMargin: { horizontal: 20, vertical: 5 },
          },
          tooltip: { theme: 'dark', marker: { show: true }, x: { show: false } },
          fill: {
              type: 'gradient',
              gradient: {
                  type: 'vertical',
                  shadeIntensity: 1,
                  inverseColors: !1,
                  opacityFrom: 0.19,
                  opacityTo: 0.05,
                  stops: [100, 100],
              },
          },
        }
      }
  },  
}
</script>
