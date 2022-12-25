<template>
    <div class="layout-px-spacing dash_1">        

        <div class="row layout-top-spacing">
            <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12 col-12 layout-spacing">
                <div class="widget widget-sales-category">
                    <div class="widget-heading">
                        <h5>Create your query</h5>
                        <button type="button" class="btn btn-warning btn-sm mb-4 me-2">Run</button>
                    </div>
                    <div class="widget-content">
                        <div class="row mb-12">
                            <label class="col-sm-2 col-form-label col-form-label-sm" for="colFormLabelSm">1</label>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input1']" :options="options1" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input2']" :options="options2" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                        </div>
                        <div class="row mb-12">
                            <label class="col-sm-2 col-form-label col-form-label-sm" for="colFormLabelSm">2</label>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input3']" :options="options1" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input4']" :options="options2" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                        </div>
                        <div class="row mb-12">
                            <label class="col-sm-2 col-form-label col-form-label-sm" for="colFormLabelSm">3</label>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input5']" :options="options1" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                            <div class="col-sm-5">
                                <multiselect v-model="inputs['input6']" :options="options2" :searchable="true" :preselect-first="true" selected-label="" select-label="" deselect-label=""></multiselect>
                            </div>
                        </div>
                        <br>
                        <div class="row mb-12 add">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus-circle"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
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
</template>

<script setup>
    import '@/assets/sass/widgets/widgets.scss';
    import { computed, ref } from 'vue';
    import { useStore } from 'vuex';
    import ApexChart from 'vue3-apexcharts';
    import Multiselect from '@suadelabs/vue3-multiselect';
    import '@suadelabs/vue3-multiselect/dist/vue3-multiselect.css';
    import { useMeta } from '@/composables/use-meta';
    
    import sushi from '../sushi.json';
    import thorchain from '../thorchain.json';
    import synthetix from '../synthetix.json';
    import balancer from '../balancer.json';

    useMeta({ title: 'Sales Admin' });    

    const store = useStore();

    // Query building
    const options1 = ref(['THORChain', 'Ethereum', 'Sushiswap', 'Synthetix']);
    const options2 = ref(['Volume', 'TVL', 'Transaction amount', 'Unique users', 'Average Transaction Volume']);
    const inputs = ref({
        input1: ['THORChain'],
        input2: ['Volume'],
        input3: ['Sushiswap'],
        input4: ['Volume'],
        input5: ['Synthetix'],
        input6: ['Volume'],
    });

    // Get a date object for the current time
    var d = new Date();
    // Set it to one month ago
    d.setMonth(d.getMonth() - 1);
    // Zero the time component
    d.setHours(0, 0, 0, 0);
  
    let since = "2022-12-01";

    //Revenue
    const revenue_series = ref([
        {   
            name: 'THORChain', 
            //data: [2983956.71217961, 2395275.71071763, 1009108.76758473, 2572090.63945783, 2098498.32074663, 2194474.50212802, 1368761.00564936, 1125933.01377081, 735116.858568302],
            data: thorchain.map((element) => {
                let newerThanMonth = new Date(element["DAY"]).getTime() > new Date(since).getTime();
                let today = new Date()
                today.setHours(0,0,0,0)
                let olderThanToday = new Date(element["DAY"]).getTime() < today.getTime();
                if(newerThanMonth && olderThanToday){
                    return element["SWAP_VOLUME_USD"]
                }                
            }).filter(notUndefined => notUndefined !== undefined),
            logarithmic: true,
            color: 'green',
        },
        // { 
        //     name: 'Ethereum', 
        //     data: [35938538.6182716, 36158676.7907273, 35733462.5261331, 28471844.7885794, 45072836.8123043, 41293303.1992253, 41647877.669636, 45814068.5791835, 37723419.5537677] ,
        //     logarithmic: true
        // },
        // {
        //     name: 'Sushiswap',
        //     data: [14871458.8198884, 9800143.76025729, 6847148.6310583, 10815621.019162, 11397942.8816669, 8909929.96071868, 11297770.2919411, 8361259.24056119, 5396507.89061365],
        //     logarithmic: true
        // },
        // {
        //     name: 'Uniswap',
        //     data: [1205075160.12, 643004472.25, 307789126.5, 539359354.42, 623531212.73, 396210925.2, 449933491.13, 450910243.39, 149123770.96],
        //     logarithmic: true
        // },
         {
            name: 'Sushiswap',
            data: sushi.map((element) => {
                let newerThanMonth = new Date(element["Date"]).getTime() > new Date(since).getTime();
                let today = new Date()
                today.setHours(0,0,0,0)
                let olderThanToday = new Date(element["Date"]).getTime() < today.getTime();
                if(newerThanMonth && olderThanToday){
                    return element["Transaction Volume USD"]
                }
            }).filter(notUndefined => notUndefined !== undefined),
            logarithmic: true,
            color: 'red',
         },
         {
            name: 'Synthetix',
            data: synthetix.map((element) => {
                let newerThanMonth = new Date(element["Date"]).getTime() > new Date(since).getTime();
                let today = new Date()
                today.setHours(0,0,0,0)
                let olderThanToday = new Date(element["Date"]).getTime() < today.getTime();
                if(newerThanMonth && olderThanToday){
                    return element["Transaction Volume USD"]
                }
            }).filter(notUndefined => notUndefined !== undefined),
            logarithmic: true,
            color: 'blue',
         },
        // {
        //     name: 'Balancer',
        //     data: balancer.map((element) => {
        //         if(new Date(element["Date"]).getTime() > new Date("2022-11-31").getTime()){
        //             return element["Transaction Volume USD"]
        //         }
        //     }).filter(notUndefined => notUndefined !== undefined),
        //     logarithmic: true
        // },
    ]);

    // Volume DEX swaps -> UNISWAP (V2 and V3), SUSHI, BALANCER, CURVE
    // SELECT
    //     DATE_TRUNC('day',block_timestamp) AS "Date",
    //     platform, 
    //     COUNT(DISTINCT tx_hash) AS "Number of Transactions",
    //     COUNT(DISTINCT origin_from_address) AS "Number of Unique Users",
    //     SUM(amount_in_usd) AS "Transaction Volume, USD",
    //     AVG(amount_in_usd) AS "Average Transaction Volume, USD"
    //     FROM ethereum.core.ez_dex_swaps
    //     WHERE
    //     "Date" BETWEEN '2022-09-01' AND '2022-11-30' AND
    //     platform IN ('sushiswap','uniswap-v3')
    //     GROUP BY 1,2
    //     ORDER BY 1,2

    const revenue_options = computed(() => {
        const is_dark = store.state.is_dark_mode;
        return {
            chart: {
                fontFamily: 'Nunito, sans-serif',
                zoom: { enabled: false },
                toolbar: { show: false },
            },
            dataLabels: { enabled: false },
            stroke: { show: true, curve: 'smooth', width: 2, lineCap: 'square' },
            dropShadow: { enabled: true, opacity: 0.2, blur: 10, left: -7, top: 22 },
            colors: is_dark ? ['#2196f3', '#e7515a'] : ['#1b55e2', '#e7515a'],
            // markers: {
            //     discrete: [
            //         { seriesIndex: 0, dataPointIndex: 6, fillColor: '#1b55e2', strokeColor: '#fff', size: 7 },
            //         { seriesIndex: 1, dataPointIndex: 5, fillColor: '#e7515a', strokeColor: '#fff', size: 7 },
            //     ],
            // },
            //labels: ['2022-12-16', '2022-12-17', '2022-12-18', '2022-12-19', '2022-12-19', '2022-12-20', '2022-12-21', '2022-12-22', '2022-12-23', '2022-12-24'],
            labels: thorchain.map((element) => {   
                let newerThanMonth = new Date(element["DAY"]).getTime() > new Date(since).getTime();
                let today = new Date()
                today.setHours(0,0,0,0)
                let olderThanToday = new Date(element["DAY"]).getTime() < today.getTime();
                if(newerThanMonth && olderThanToday){                
                    return element["DAY"]
                } 
                // if( < new Date(element["DAY"]).getTime() ){
                //     return element["DAY"];    
                // }                                            
            }).filter(notUndefined => notUndefined !== undefined),
            xaxis: {
                axisBorder: { show: false },
                axisTicks: { show: false },
                crosshairs: { show: true },
                labels: { offsetX: 0, offsetY: 5, style: { fontSize: '12px', fontFamily: 'Nunito, sans-serif', cssClass: 'apexcharts-xaxis-title' } },
            },
            yaxis: {
                
                tickAmount: 7,
                labels: {
                    formatter: function (value) {
                        return Math.floor((value / 1000000) * 100) / 100 + 'M';
                    },
                    offsetX: -10,
                    offsetY: 0,
                    style: { fontSize: '12px', fontFamily: 'Nunito, sans-serif', cssClass: 'apexcharts-yaxis-title' },
                },
            },
            grid: {
                borderColor: is_dark ? '#191e3a' : '#e0e6ed',
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
                fontFamily: 'Nunito, sans-serif',
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
                    opacityFrom: is_dark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: is_dark ? [100, 100] : [45, 100],
                },
            },
        };
    });

    console.log(revenue_options)

    //Daily Sales
    const daily_sales_series = ref([
        { name: 'Sales', data: [44, 55, 41, 67, 22, 43, 21] },
        { name: 'Last Week', data: [13, 23, 20, 8, 13, 27, 33] },
    ]);
    const daily_sales_options = computed(() => {
        return {
            chart: { toolbar: { show: false }, stacked: true, stackType: '100%' },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 1 },
            colors: ['#e2a03f', '#e0e6ed'],
            responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } } }],
            xaxis: { labels: { show: false }, categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'] },
            yaxis: { show: false },
            fill: { opacity: 1 },
            plotOptions: { bar: { horizontal: false, columnWidth: '25%' } },
            legend: { show: false },
            grid: {
                show: false,
                xaxis: { lines: { show: false } },
                padding: { top: 10, right: -20, bottom: -20, left: -20 },
            },
        };
    });

    //Total Orders
    const total_orders_series = ref([{ name: 'Sales', data: [28, 40, 36, 52, 38, 60, 38, 52, 36, 40] }]);
    const total_orders_options = computed(() => {
        const is_dark = store.state.is_dark_mode;
        return {
            chart: { sparkline: { enabled: true } },
            stroke: { curve: 'smooth', width: 2 },
            colors: is_dark ? ['#1abc9c'] : ['#fff'],
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            yaxis: { min: 0, show: false },
            grid: { padding: { top: 125, right: 0, bottom: 0, left: 0 } },
            fill: {
                opacity: 1,
                type: 'gradient',
                gradient: {
                    type: 'vertical',
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: is_dark ? 0.3 : 0.4,
                    opacityTo: 0.05,
                    stops: is_dark ? [100, 100] : [45, 100],
                },
            },
            tooltip: { x: { show: false }, theme: 'dark' },
        };
    });

    //Sales by Category
    const sales_donut_series = ref([985, 737, 270]);
    const sales_donut_options = computed(() => {
        const is_dark = store.state.is_dark_mode;
        const option = {
            chart: {},
            dataLabels: { enabled: false },
            expandOnClick: is_dark ? false : true,
            stroke: { show: true, width: 25, colors: is_dark ? '#0e1726' : '#fff' },
            colors: is_dark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: { width: 10, height: 10 },
                height: 50,
                offsetY: 20,
                itemMargin: { horizontal: 8, vertical: 0 },
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: { show: true, fontSize: '29px', fontFamily: 'Nunito, sans-serif', offsetY: -10 },
                            value: {
                                show: true,
                                fontSize: '26px',
                                fontFamily: 'Nunito, sans-serif',
                                color: is_dark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: function (val) {
                                    return val;
                                },
                            },
                            total: {
                                show: true,
                                label: 'Total',
                                color: '#888ea8',
                                fontSize: '29px',
                                formatter: function (w) {
                                    return w.globals.seriesTotals.reduce(function (a, b) {
                                        return a + b;
                                    }, 0);
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Apparel', 'Sports', 'Others'],
        };

        if (is_dark) {
            option['states'] = {
                hover: { filter: { type: 'none' } },
                active: { filter: { type: 'none' } },
            };
        }

        return option;
    });
</script>

<style>
    
</style>