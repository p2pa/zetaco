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
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'protocol'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <div class="form-control" v-for="values, i in inputValues[index - 1]" :key="i">
                                      <multiselect v-if="i == 0" v-model="inputValues[index - 1][i]" :options="options.protocol" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <multiselect v-if="i == 1" v-model="inputValues[index - 1][i]" :options="options.what" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>                                    
                                    </div>
                                </div>
                                <div class="input-group mb-4" v-if="inputTypes[index - 1] == 'chain'">
                                    <span class="input-group-text" id="basic-addon1">{{index}}</span>
                                    <span class="input-group-text" id="basic-addon1">{{ inputTypes[index - 1] }}</span>
                                    <div class="form-control" v-for="values, i in inputValues[index - 1]" :key="i">
                                      <multiselect v-if="i == 0" v-model="inputValues[index - 1][0]" :options="options.chain.x" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>
                                      <multiselect v-if="i == 1" v-model="inputValues[index - 1][1]" :options="inputValues[index - 1][0] == '' ? [] : options.chain.dimension[options.chain.x.find(inputValues[index - 1][0])]" :searchable="true" :preselect-first="false" selected-label="" select-label="" deselect-label=""></multiselect>                                    
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
                            <!-- <div class="row mb-12">
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
                            </div>                             -->
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
                  <apex-chart v-if="revenue_options" height="325" :type="chartType" :options="revenue_options" :series="revenue_series"></apex-chart>
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

export default {
  name: 'App',
  components: {
    AppHeader,
    Multiselect,
    ApexChart
  },
  methods: {
    fetchQuery: async function(){
      let from;
      let to = parseInt((new Date().getTime() / 1000).toFixed(0)); 

      // to do
      // check if all values contain valid entry      
      
      // if inputTypes contains a filter
      if(this.inputTypes.indexOf('filter')){
        this.inputValues[this.inputTypes.indexOf('filter')].forEach(el => {
            let condition = el.split(" ");
            if(condition[0] == 'Date'){
              if(condition[1] == '>='){
                from = parseInt(new Date(condition[2]).getTime() / 1000);
              }
            }
          });
      }

      let dataArray = []

      for (let index = 0; index < this.inputTypes.length; index++) {
        const element = this.inputTypes[index];           
        if(element == 'protocol'){
          let array = this.inputValues[index];
          // if type == revenue do bar chart         

          let url = 'http://localhost:3000/api/' + array[0] + '/' + array[1] + '/' + from + '/' + to ;      

          await axios
          .get(url)
          .then((res) => {
            dataArray.push({                 
                name: array[0], 
                data: res.data[0].data                         
            })
            this.revenue_options.labels = res.data[0].labels
          })   
        } 
        
        if(element == 'chain'){
          let array = this.inputValues[index];
          // if type == revenue do bar chart         

          let url = 'http://localhost:3000/api/chains/' + array[0] + '/' + array[1].replace(/\s+/, "")  + '/' + from + '/' + to ;      
          
          await axios
          .get(url)
          .then((res) => {
            let item = {                 
                name: array[0], 
                data: []                         
            };
            let labels = []
            for (let z = 0; z < res.data.rows.length; z++) {
              let el = res.data.rows[z];
              labels.push(el[1])
              item.data.push(el[2])
            }
            dataArray.push(item)
            this.revenue_options.labels = labels
          })   
        }       
      }      
      console.log(this.revenue_options.labels);      
      this.revenue_series = dataArray;
    },
  },  
  async beforeMount(){
    // get chains
    let url = 'http://localhost:3000/getChains'; 
    let nameArray = [];
    let dimensionArray = [];
    await axios
    .get(url)
    .then((res) => {
      let chains = res.data;
      for (let z = 0; z < chains.length; z++) {
        let el = chains[z];
        nameArray.push(el.name)
        dimensionArray.push(el.dimensions)       
      }
    })   
    this.options.chain.x = nameArray;
    this.options.chain.dimension = dimensionArray;
    console.log(this.options)
  },
  data: function() {
    return {        
        chartType: "area",
        inputsAmount: 1,
        inputTypes: [
          'chain',
          'filter'
        ],
        options:{
            chain: {
              x: [],
              dimension: []
            },                      
            protocol: ['Aave', 'Compound', 'Convex-Finance', 'Curve', 'JustLend', 'Lido', 'MakerDAO', 'PancakeSwap', 'Uniswap'],
            what: ['Volume', 'Unique users'] //'Volume', 'Transaction amount', 'Unique users', 'Average Transaction Volume'
        },        
        inputValues: [
          ['', ''],
          ['Date >= 2022-01-01']
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
                style: { fontSize: '12px', fontFamily: 'Poppins', cssClass: 'apexcharts-xaxis-title' }
              },
          },
          yaxis: {              
              tickAmount: 7,
              labels: {
                  formatter: function (value) {
                    if(value > 1000000000){
                      return Math.floor((value / 1000000000) * 100) / 100 + 'B';
                    }
                    if(value > 1000000){
                      return Math.floor((value / 1000000) * 100) / 100 + 'M';
                    } 
                    if(value < 1000000){
                      return Math.round((value / 1000) * 100) / 100 + 'K';
                    }                     
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
